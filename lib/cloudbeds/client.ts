// Cloudbeds.
//
// Auth: a static API key (Cloudbeds → Settings → API Credentials), stored only
// in the environment as CLOUDBEDS_API_KEY together with CLOUDBEDS_PROPERTY_ID.
// The key is sent as `x-api-key` (and as a Bearer token, which Cloudbeds also
// accepts for API keys).
//
// Reads (rooms, rates, availability) work with any key that has the read
// scopes. Writes (creating a reservation, recording a payment, adding a note)
// only happen when CLOUDBEDS_ALLOW_WRITE=true is also set, and only from the
// booking routes on the server, after the price and availability have been
// checked again against Cloudbeds.
//
// Every function returns normalised, display-ready data and never throws: if
// Cloudbeds is not configured or unreachable, callers get `null`/`[]` and the
// site falls back to the rooms and prices managed in the admin.

import 'server-only';
import { site } from '@/lib/site';

const BASE = process.env.CLOUDBEDS_API_BASE || 'https://api.cloudbeds.com/api/v1.2';

export interface CbRoomType {
  id: string;
  name: string;
  shortName: string | null;
  description: string | null;
  maxGuests: number | null;
  adultsIncluded: number | null;
  units: number | null;
  photos: string[];
  features: string[];
}

export interface CbRate {
  roomTypeId: string;
  roomTypeName: string;
  /** Total for the whole stay, in property currency. */
  total: number;
  /** Average per night. */
  nightly: number;
  roomsAvailable: number;
  ratePlanName: string | null;
  /** Cloudbeds roomRateID, passed back when creating the reservation. */
  rateId: string | null;
  currency: string;
}

export function cloudbedsConfigured(): boolean {
  return Boolean(process.env.CLOUDBEDS_API_KEY && process.env.CLOUDBEDS_PROPERTY_ID);
}

async function cbGet<T>(path: string, params: Record<string, string | number | boolean | undefined>, revalidate: number): Promise<T | null> {
  const key = process.env.CLOUDBEDS_API_KEY;
  const propertyID = process.env.CLOUDBEDS_PROPERTY_ID;
  if (!key || !propertyID) return null;
  const url = new URL(`${BASE}/${path.replace(/^\//, '')}`);
  for (const [k, v] of Object.entries({ propertyID, ...params })) {
    if (v !== undefined) url.searchParams.set(k, String(v));
  }
  try {
    const res = await fetch(url, {
      headers: { 'x-api-key': key, Authorization: `Bearer ${key}`, Accept: 'application/json' },
      ...(revalidate > 0 ? { next: { revalidate } } : { cache: 'no-store' as const }),
    });
    if (!res.ok) {
      console.warn(`[cloudbeds] ${path} → ${res.status}`);
      return null;
    }
    const json = (await res.json()) as { success?: boolean } & T;
    if (json && json.success === false) {
      console.warn(`[cloudbeds] ${path} → success:false`, JSON.stringify(json).slice(0, 300));
      return null;
    }
    return json;
  } catch (e) {
    console.warn(`[cloudbeds] ${path} failed:`, (e as Error).message);
    return null;
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

type Loose = Record<string, unknown>;
const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);
const num = (v: unknown) => {
  const n = typeof v === 'string' ? parseFloat(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? n : null;
};
function asList(v: unknown): Loose[] {
  if (Array.isArray(v)) return v as Loose[];
  if (v && typeof v === 'object') return Object.values(v as Loose).filter((x) => x && typeof x === 'object') as Loose[];
  return [];
}
function stripHtml(s: string | null) {
  return s ? s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim() : null;
}

/** YYYY-MM-DD in Ghana time (UTC+0). */
export function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}
export function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}
export function nightsBetween(a: string, b: string) {
  return Math.max(1, Math.round((Date.parse(b) - Date.parse(a)) / 86400000));
}

// ── Room types ────────────────────────────────────────────────────────────

export async function getRoomTypes(): Promise<CbRoomType[]> {
  const json = await cbGet<{ data?: unknown }>('getRoomTypes', { includePhotos: 1, includeAmenities: 1 }, 3600);
  if (!json) return [];
  return asList(json.data).map((r) => {
    const photos = asList(r.roomTypePhotos)
      .map((p) => str(p.image) ?? str(p.original) ?? str(p.thumb))
      .filter(Boolean) as string[];
    const features = (Array.isArray(r.roomTypeFeatures) ? r.roomTypeFeatures : asList(r.roomTypeFeatures))
      .map((f) => (typeof f === 'string' ? f : str((f as Loose).name) ?? str((f as Loose).feature)))
      .filter(Boolean) as string[];
    return {
      id: String(r.roomTypeID ?? ''),
      name: str(r.roomTypeName) ?? 'Room',
      shortName: str(r.roomTypeNameShort),
      description: stripHtml(str(r.roomTypeDescription)),
      maxGuests: num(r.maxGuests),
      adultsIncluded: num(r.adultsIncluded),
      units: num(r.roomTypeUnits),
      photos,
      features,
    };
  }).filter((r) => r.id);
}

// ── Rates and availability for a stay ─────────────────────────────────────

/**
 * Live prices and remaining rooms for a stay. Uses getAvailableRoomTypes
 * (only bookable room types come back); falls back to getRatePlans.
 */
export async function getStayRates(opts: { checkIn: string; checkOut: string; adults?: number; children?: number; fresh?: boolean }): Promise<CbRate[]> {
  const { checkIn, checkOut, adults = 2, children = 0 } = opts;
  const ttl = opts.fresh ? 0 : 300;
  const nights = nightsBetween(checkIn, checkOut);

  const avail = await cbGet<{ data?: unknown }>(
    'getAvailableRoomTypes',
    { propertyIDs: process.env.CLOUDBEDS_PROPERTY_ID, startDate: checkIn, endDate: checkOut, rooms: 1, adults, children },
    ttl,
  );
  if (avail) {
    const out: CbRate[] = [];
    for (const prop of asList(avail.data)) {
      const currency = str((prop.propertyCurrency as Loose | undefined)?.currencyCode) ?? 'GHS';
      for (const r of asList(prop.propertyRooms)) {
        const total = num(r.roomRate) ?? 0;
        if (!total) continue;
        out.push({
          roomTypeId: String(r.roomTypeID ?? ''),
          roomTypeName: str(r.roomTypeName) ?? 'Room',
          total,
          nightly: Math.round(total / nights),
          roomsAvailable: num(r.roomsAvailable) ?? 0,
          ratePlanName: str(r.ratePlanNamePublic),
          rateId: r.roomRateID != null ? String(r.roomRateID) : null,
          currency,
        });
      }
    }
    if (out.length) return dedupeLowest(out);
  }

  const plans = await cbGet<{ data?: unknown }>('getRatePlans', { startDate: checkIn, endDate: checkOut, adults, children }, ttl);
  if (!plans) return [];
  const out: CbRate[] = [];
  for (const r of asList(plans.data)) {
    const total = num(r.totalRate) ?? (num(r.roomRate) ?? 0) * nights;
    if (!total) continue;
    out.push({
      roomTypeId: String(r.roomTypeID ?? ''),
      roomTypeName: str(r.roomTypeName) ?? 'Room',
      total,
      nightly: Math.round(total / nights),
      roomsAvailable: num(r.roomsAvailable) ?? 0,
      ratePlanName: str(r.ratePlanNamePublic),
      rateId: r.rateID != null ? String(r.rateID) : null,
      currency: 'GHS',
    });
  }
  return dedupeLowest(out);
}

/** Keep the cheapest public rate per room type. */
function dedupeLowest(rates: CbRate[]): CbRate[] {
  const best = new Map<string, CbRate>();
  for (const r of rates) {
    const k = r.roomTypeId || r.roomTypeName;
    const cur = best.get(k);
    if (!cur || r.total < cur.total) best.set(k, { ...r, roomsAvailable: Math.max(r.roomsAvailable, cur?.roomsAvailable ?? 0) });
  }
  return Array.from(best.values()).sort((a, b) => a.nightly - b.nightly);
}

/**
 * Tonight's snapshot (a one-night stay starting today), used for "from" prices
 * and "only N left" signals across the site. Cached for 10 minutes.
 */
export async function getTonight(): Promise<CbRate[]> {
  const today = new Date();
  return getStayRates({ checkIn: isoDate(today), checkOut: isoDate(addDays(today, 1)) });
}

// ── Matching Cloudbeds room types to the rooms managed in the admin ───────

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\b(room|the)\b/g, '').replace(/\s+/g, ' ').trim();

export function matchRoomType<T extends { roomTypeId?: string; id?: string; roomTypeName?: string; name?: string }>(
  room: { name: string; cloudbedsRoomTypeId?: string | null },
  list: T[],
): T | undefined {
  if (room.cloudbedsRoomTypeId) {
    const byId = list.find((x) => (x.roomTypeId ?? x.id) === room.cloudbedsRoomTypeId);
    if (byId) return byId;
  }
  const n = norm(room.name);
  const exact = list.find((x) => norm(x.roomTypeName ?? x.name ?? '') === n);
  if (exact) return exact;
  // Loose match only when every word of the shorter name (at least two words)
  // appears in the longer one, e.g. "Deluxe Double Sea View" ~ "Deluxe Double - Sea View".
  const words = (s: string) => new Set(s.split(' ').filter(Boolean));
  const a = words(n);
  const candidates = list.filter((x) => {
    const b = words(norm(x.roomTypeName ?? x.name ?? ''));
    const [short, long] = a.size <= b.size ? [a, b] : [b, a];
    return short.size >= 2 && Array.from(short).every((w) => long.has(w));
  });
  return candidates.length === 1 ? candidates[0] : undefined;
}

// ── Booking engine deep link ──────────────────────────────────────────────

/** The Cloudbeds booking engine, with dates and guests pre-filled when known. */
export function bookingEngineUrl(opts: { checkIn?: string; checkOut?: string; adults?: number; children?: number } = {}) {
  const url = new URL(site.bookingUrl);
  if (opts.checkIn) url.searchParams.set('checkin', opts.checkIn);
  if (opts.checkOut) url.searchParams.set('checkout', opts.checkOut);
  if (opts.adults) url.searchParams.set('adults', String(opts.adults));
  if (opts.children) url.searchParams.set('kids', String(opts.children));
  return url.toString();
}

// ── Writes ────────────────────────────────────────────────────────────────

/** True only when the key is set AND writes are explicitly switched on. */
export function cloudbedsWriteEnabled(): boolean {
  return cloudbedsConfigured() && process.env.CLOUDBEDS_ALLOW_WRITE === 'true';
}

type FormValue = string | number | boolean | undefined | null;

/** Flatten { rooms: [{ roomTypeID: 'x' }] } into rooms[0][roomTypeID]=x. */
function toForm(data: Record<string, unknown>, form = new URLSearchParams(), prefix = ''): URLSearchParams {
  for (const [k, v] of Object.entries(data)) {
    const key = prefix ? `${prefix}[${k}]` : k;
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v)) v.forEach((item, i) => (typeof item === 'object' ? toForm(item as Record<string, unknown>, form, `${key}[${i}]`) : form.append(`${key}[${i}]`, String(item))));
    else if (typeof v === 'object') toForm(v as Record<string, unknown>, form, key);
    else form.append(key, String(v as FormValue));
  }
  return form;
}

async function cbPost<T>(path: string, data: Record<string, unknown>): Promise<{ ok: true; json: T } | { ok: false; message: string }> {
  if (!cloudbedsWriteEnabled()) return { ok: false, message: 'Cloudbeds writes are switched off.' };
  const key = process.env.CLOUDBEDS_API_KEY as string;
  const body = toForm({ propertyID: process.env.CLOUDBEDS_PROPERTY_ID, ...data });
  try {
    const res = await fetch(`${BASE}/${path}`, {
      method: 'POST',
      headers: { 'x-api-key': key, Authorization: `Bearer ${key}`, Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    });
    const json = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string } & T;
    if (!res.ok || json.success === false) {
      const message = json.message || `Cloudbeds ${path} returned ${res.status}`;
      console.warn(`[cloudbeds] ${path} failed:`, message);
      return { ok: false, message };
    }
    return { ok: true, json };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export interface NewReservation {
  checkIn: string;
  checkOut: string;
  roomTypeId: string;
  rateId?: string | null;
  adults: number;
  children: number;
  guest: { firstName: string; lastName: string; email: string; phone?: string | null; country: string; zip?: string | null };
  arrivalTime?: string | null;
  /** Cloudbeds accepts cash, credit, ebanking or pay_pal here. */
  paymentMethod: 'cash' | 'credit' | 'ebanking' | 'pay_pal';
  sendEmailConfirmation?: boolean;
}

export async function createReservation(r: NewReservation) {
  const res = await cbPost<{ reservationID?: string; status?: string; grandTotal?: number; guestID?: string }>('postReservation', {
    startDate: r.checkIn,
    endDate: r.checkOut,
    guestFirstName: r.guest.firstName,
    guestLastName: r.guest.lastName,
    guestEmail: r.guest.email,
    guestPhone: r.guest.phone,
    guestCountry: r.guest.country,
    guestZip: r.guest.zip || '00000',
    estimatedArrivalTime: r.arrivalTime,
    rooms: [{ roomTypeID: r.roomTypeId, quantity: 1, roomRateID: r.rateId ?? undefined }],
    adults: [{ roomTypeID: r.roomTypeId, quantity: r.adults }],
    children: [{ roomTypeID: r.roomTypeId, quantity: r.children }],
    paymentMethod: r.paymentMethod,
    sendEmailConfirmation: r.sendEmailConfirmation ?? true,
  });
  if (!res.ok) return res;
  if (!res.json.reservationID) return { ok: false as const, message: 'Cloudbeds did not return a reservation number.' };
  return {
    ok: true as const,
    reservationID: res.json.reservationID,
    status: res.json.status ?? null,
    grandTotal: typeof res.json.grandTotal === 'number' ? res.json.grandTotal : num(res.json.grandTotal),
  };
}

/** Record a payment taken outside Cloudbeds (e.g. Paystack) on the reservation. */
export async function recordPayment(p: { reservationID: string; amount: number; type?: string; description: string }) {
  return cbPost<{ paymentID?: string }>('postPayment', {
    reservationID: p.reservationID,
    amount: p.amount.toFixed(2),
    type: p.type || process.env.CLOUDBEDS_PAYMENT_TYPE || 'ebanking',
    description: p.description,
  });
}

export async function addReservationNote(reservationID: string, note: string) {
  return cbPost('postReservationNote', { reservationID, reservationNote: note.slice(0, 2000) });
}

/** Payment methods enabled on the property (needs the Payment: Read scope). */
export async function getPaymentMethods(): Promise<{ method: string; code: string; name: string }[]> {
  const json = await cbGet<{ data?: { methods?: unknown } }>('getPaymentMethods', {}, 3600);
  return asList(json?.data?.methods).map((m) => ({ method: str(m.method) ?? '', code: str(m.code) ?? '', name: str(m.name) ?? '' }));
}
