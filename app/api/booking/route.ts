// Start a direct booking from the website.
// POST /api/booking
//
// Checks the price and availability again with Cloudbeds, saves a pending
// booking, then either sends the guest to Paystack (pay now) or creates the
// reservation straight away (pay later, if switched on).

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createPendingBooking, directBookingModes, quote, reserveUnpaid, tooManyPending, type BookingRow } from '@/lib/booking/direct';
import { nightsBetween } from '@/lib/cloudbeds/client';
import { startPayment } from '@/lib/paystack';

export const dynamic = 'force-dynamic';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

const schema = z.object({
  roomTypeId: z.string().min(1).max(40),
  checkIn: z.string().regex(DATE),
  checkOut: z.string().regex(DATE),
  adults: z.number().int().min(1).max(8),
  children: z.number().int().min(0).max(6),
  pay: z.enum(['now', 'later']),
  guest: z.object({
    firstName: z.string().trim().min(1).max(60),
    lastName: z.string().trim().min(1).max(60),
    email: z.string().trim().toLowerCase().email().max(120),
    phone: z.string().trim().min(6).max(30),
    country: z.string().trim().regex(/^[A-Z]{2}$/),
    arrivalTime: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal('')),
    requests: z.string().trim().max(800).optional(),
  }),
  // Honeypot: real people never fill this in.
  website: z.string().max(200).optional(),
});

// Best-effort per-address brake (each server instance keeps its own count).
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60 * 1000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 6;
}

export async function POST(req: Request) {
  const modes = directBookingModes();
  if (!modes.payNow && !modes.payLater) {
    return NextResponse.json({ error: 'Online booking is not switched on.' }, { status: 503 });
  }

  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  if (limited(ip)) return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes or message us on WhatsApp.' }, { status: 429 });

  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Please check the form and try again.' }, { status: 400 });
  }
  if (data.website) return NextResponse.json({ ok: true, mode: 'reserved', ref: 'thanks' });

  const today = new Date().toISOString().slice(0, 10);
  if (data.checkIn < today || data.checkOut <= data.checkIn || nightsBetween(data.checkIn, data.checkOut) > 30) {
    return NextResponse.json({ error: 'Choose dates from today onwards, for up to 30 nights.' }, { status: 400 });
  }
  const mode = data.pay === 'now' && modes.payNow ? 'now' : data.pay === 'later' && modes.payLater ? 'later' : modes.payNow ? 'now' : 'later';

  if (await tooManyPending(data.guest.email).catch(() => false)) {
    return NextResponse.json({ error: 'You already have bookings waiting. Please finish one, or message us on WhatsApp.' }, { status: 429 });
  }

  const rate = await quote(data);
  if (!rate) return NextResponse.json({ error: 'unavailable' }, { status: 409 });

  const guest = { ...data.guest, arrivalTime: data.guest.arrivalTime || undefined };
  let booking: BookingRow;
  try {
    booking = (await createPendingBooking({ rate, checkIn: data.checkIn, checkOut: data.checkOut, adults: data.adults, children: data.children, guest, mode })) as BookingRow;
  } catch (e) {
    console.error('[booking] could not save booking', (e as Error).message);
    return NextResponse.json({ error: 'We could not save your booking. Please try again or message us on WhatsApp.' }, { status: 500 });
  }

  if (mode === 'later') {
    const out = await reserveUnpaid(booking);
    return NextResponse.json({ ok: true, mode: 'reserved', ref: booking.id, state: out.state });
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  const pay = await startPayment({
    email: guest.email,
    amountGhs: rate.total,
    reference: booking.id,
    callbackUrl: `${origin}/api/booking/paystack/callback`,
    metadata: { booking: booking.id, room: rate.roomTypeName, checkIn: data.checkIn, checkOut: data.checkOut },
  });
  if (!pay) return NextResponse.json({ error: 'We could not open the payment page. Please try again or message us on WhatsApp.' }, { status: 502 });
  return NextResponse.json({ ok: true, mode: 'pay', url: pay.authorization_url, total: rate.total, currency: rate.currency });
}
