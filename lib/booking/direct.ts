// Direct booking: the guest reserves a room on the website and the
// reservation is written straight into Cloudbeds.
//
// Two modes, each switched on in Vercel:
//
//   Pay now   CLOUDBEDS_ALLOW_WRITE=true + PAYSTACK_SECRET_KEY
//             The guest pays on Paystack first. Only a verified payment
//             creates the reservation, so nobody can block rooms with fake
//             bookings. The payment is then recorded on the reservation.
//
//   Pay later CLOUDBEDS_ALLOW_WRITE=true + BOOKING_ALLOW_PAY_LATER=true
//             The reservation is created straight away and the team sends a
//             payment link. Faster for guests, but anyone can hold a room, so
//             keep an eye on unpaid reservations if this is on.
//
// With neither, the site keeps sending guests to the Cloudbeds booking engine.
//
// Every price is fetched again from Cloudbeds on the server. Nothing the
// browser sends about price is trusted.

import 'server-only';
import { prisma } from '@/lib/prisma';
import { sendMail } from '@/lib/email';
import { site } from '@/lib/site';
import {
  addReservationNote,
  cloudbedsWriteEnabled,
  createReservation,
  getStayRates,
  nightsBetween,
  recordPayment,
  type CbRate,
} from '@/lib/cloudbeds/client';
import { paystackConfigured, verifyPayment } from '@/lib/paystack';

export function directBookingModes() {
  const write = cloudbedsWriteEnabled();
  return {
    payNow: write && paystackConfigured(),
    payLater: write && process.env.BOOKING_ALLOW_PAY_LATER === 'true',
  };
}

export interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string; // ISO 3166-1 alpha-2
  arrivalTime?: string;
  requests?: string;
}

/** What we keep in Booking.notes (JSON) between payment and reservation. */
export interface BookingNotes {
  v: 1;
  mode: 'now' | 'later';
  country: string;
  arrivalTime?: string;
  requests?: string;
  grandTotal?: number | null;
  problem?: string;
}

export type BookingRow = {
  id: string;
  cloudbedsReservationId: string | null;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  roomTypeId: string | null;
  roomTypeName: string | null;
  ratePlanId: string | null;
  totalCost: unknown;
  currency: string;
  status: string;
  paymentProvider: string | null;
  paymentRef: string | null;
  notes: string | null;
};

const iso = (d: Date) => d.toISOString().slice(0, 10);

export function readNotes(b: { notes: string | null }): BookingNotes {
  try {
    const n = JSON.parse(b.notes ?? '');
    if (n && n.v === 1) return n as BookingNotes;
  } catch {
    /* not ours */
  }
  return { v: 1, mode: 'later', country: 'GH', requests: b.notes ?? undefined };
}

/** A fresh, uncached quote for one room type. */
export async function quote(q: { roomTypeId: string; checkIn: string; checkOut: string; adults: number; children: number }): Promise<CbRate | null> {
  const rates = await getStayRates({ ...q, fresh: true });
  const r = rates.find((x) => x.roomTypeId === q.roomTypeId);
  return r && r.roomsAvailable > 0 && r.total > 0 ? r : null;
}

export async function createPendingBooking(p: {
  rate: CbRate;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  guest: GuestDetails;
  mode: 'now' | 'later';
}) {
  const notes: BookingNotes = { v: 1, mode: p.mode, country: p.guest.country, arrivalTime: p.guest.arrivalTime, requests: p.guest.requests };
  return prisma.booking.create({
    data: {
      guestName: `${p.guest.firstName} ${p.guest.lastName}`.trim(),
      guestEmail: p.guest.email,
      guestPhone: p.guest.phone,
      checkIn: new Date(p.checkIn),
      checkOut: new Date(p.checkOut),
      adults: p.adults,
      children: p.children,
      roomTypeId: p.rate.roomTypeId,
      roomTypeName: p.rate.roomTypeName,
      ratePlanId: p.rate.rateId,
      totalCost: p.rate.total,
      currency: p.rate.currency,
      status: 'PENDING',
      paymentProvider: p.mode === 'now' ? 'paystack' : 'later',
      notes: JSON.stringify(notes),
    },
  });
}

/** Simple abuse brake: at most 3 unfinished bookings per email per hour. */
export async function tooManyPending(email: string) {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const n = await prisma.booking.count({ where: { guestEmail: email, status: 'PENDING', createdAt: { gte: since } } });
  return n >= 3;
}

function splitName(full: string) {
  const parts = full.trim().split(/\s+/);
  return { firstName: parts.shift() ?? full, lastName: parts.join(' ') || '-' };
}

/**
 * Write the reservation into Cloudbeds for a booking row. Used right away for
 * pay-later, and after a verified Paystack payment for pay-now.
 */
async function reserve(b: BookingRow, paid?: { amountGhs: number; reference: string; channel?: string }) {
  const notes = readNotes(b);
  const name = splitName(b.guestName);
  const res = await createReservation({
    checkIn: iso(b.checkIn),
    checkOut: iso(b.checkOut),
    roomTypeId: b.roomTypeId ?? '',
    rateId: b.ratePlanId,
    adults: b.adults,
    children: b.children,
    guest: { ...name, email: b.guestEmail, phone: b.guestPhone, country: notes.country },
    arrivalTime: notes.arrivalTime,
    paymentMethod: 'ebanking',
    sendEmailConfirmation: true,
  });

  if (!res.ok) {
    await markAttention(b, notes, `Cloudbeds did not accept the reservation: ${res.message}`, paid);
    return { state: 'attention' as const };
  }

  const lines = [
    paid ? `Paid online with Paystack: GHS ${paid.amountGhs.toFixed(2)} (ref ${paid.reference}${paid.channel ? `, ${paid.channel}` : ''}).` : 'Booked on the website, pay later: please send the guest a payment link.',
    notes.arrivalTime ? `Estimated arrival: ${notes.arrivalTime}.` : '',
    b.guestPhone ? `Phone: ${b.guestPhone}.` : '',
    notes.requests ? `Guest requests: ${notes.requests}` : '',
  ].filter(Boolean);
  await addReservationNote(res.reservationID, lines.join('\n'));

  let paymentProblem = '';
  if (paid) {
    const pay = await recordPayment({ reservationID: res.reservationID, amount: paid.amountGhs, description: `Paystack ${paid.reference}` });
    if (!pay.ok) paymentProblem = `The payment could not be recorded in Cloudbeds (${pay.message}). Please add it by hand.`;
  }
  const short = paid && res.grandTotal && res.grandTotal - paid.amountGhs > 1
    ? `Cloudbeds total is GHS ${res.grandTotal.toFixed(2)}, GHS ${(res.grandTotal - paid.amountGhs).toFixed(2)} more than was paid online (taxes or fees). Collect the balance.`
    : '';

  await prisma.booking.update({
    where: { id: b.id },
    data: {
      cloudbedsReservationId: res.reservationID,
      confirmationNumber: res.reservationID,
      status: paid ? 'CONFIRMED' : 'PENDING',
      paymentProvider: paid ? 'paystack' : 'later',
      paymentRef: paid?.reference ?? null,
      notes: JSON.stringify({ ...notes, grandTotal: res.grandTotal, problem: [paymentProblem, short].filter(Boolean).join(' ') || undefined }),
    },
  });

  await notifyTeam(
    `${paid ? 'Paid' : 'Unpaid'} website booking ${res.reservationID}: ${b.guestName}, ${iso(b.checkIn)} to ${iso(b.checkOut)}`,
    [
      `${b.roomTypeName}, ${b.adults} adult(s), ${b.children} child(ren).`,
      `Guest: ${b.guestName}, ${b.guestEmail}${b.guestPhone ? `, ${b.guestPhone}` : ''}.`,
      ...lines,
      paymentProblem,
      short,
    ],
  );
  return { state: paid ? ('confirmed' as const) : ('reserved' as const), reservationID: res.reservationID };
}

async function markAttention(b: BookingRow, notes: BookingNotes, problem: string, paid?: { amountGhs: number; reference: string }) {
  await prisma.booking.update({
    where: { id: b.id },
    data: { paymentProvider: paid ? 'paystack:needs-attention' : 'later:needs-attention', paymentRef: paid?.reference ?? null, notes: JSON.stringify({ ...notes, problem }) },
  });
  await notifyTeam(`ACTION NEEDED: website booking for ${b.guestName} was not created`, [
    problem,
    paid ? `The guest has PAID GHS ${paid.amountGhs.toFixed(2)} on Paystack (ref ${paid.reference}). Create the reservation by hand or refund.` : '',
    `${b.roomTypeName}, ${iso(b.checkIn)} to ${iso(b.checkOut)}, ${b.adults} adult(s), ${b.children} child(ren).`,
    `Guest: ${b.guestName}, ${b.guestEmail}${b.guestPhone ? `, ${b.guestPhone}` : ''}.`,
  ]);
  if (paid) {
    await sendMail({
      to: b.guestEmail,
      subject: 'We have your payment. Our team is confirming your room.',
      text: `Hello ${splitName(b.guestName).firstName},\n\nThank you. We have received your payment of GHS ${paid.amountGhs.toFixed(2)} for ${iso(b.checkIn)} to ${iso(b.checkOut)}.\n\nYour room needs a final check by our team, and we will be in touch shortly to confirm it. If anything has changed we will offer you another room or a full refund.\n\nYou can also reach us on WhatsApp: https://wa.me/${site.contact.whatsapp}\n\nKoSa Beach Resort\nLife is better at the beach`,
    });
  }
}

async function notifyTeam(subject: string, lines: string[]) {
  const to = process.env.BOOKINGS_NOTIFY_EMAIL || site.contact.email;
  await sendMail({ to, subject, text: lines.filter(Boolean).join('\n') });
}

/** Pay-later: create the reservation right away. */
export async function reserveUnpaid(b: BookingRow) {
  return reserve(b);
}

/**
 * Pay-now: called by the Paystack callback and the webhook (whichever comes
 * first). Verifies the payment with Paystack, then takes a lock on the row so
 * the reservation is only ever created once.
 */
export async function finalizePaid(reference: string) {
  const b = (await prisma.booking.findUnique({ where: { id: reference } })) as BookingRow | null;
  if (!b) return { state: 'missing' as const };
  if (b.cloudbedsReservationId) return { state: 'confirmed' as const, booking: b };
  if (b.paymentProvider?.endsWith('needs-attention')) return { state: 'attention' as const, booking: b };

  const payment = await verifyPayment(reference);
  const expected = Math.round(Number(b.totalCost ?? 0) * 100);
  if (!payment || payment.status !== 'success') return { state: 'unpaid' as const, booking: b };
  if (payment.currency !== 'GHS' || payment.amount < expected) {
    await markAttention(b, readNotes(b), `Paystack amount ${payment.amount / 100} ${payment.currency} is less than the quoted GHS ${expected / 100}.`, {
      amountGhs: payment.amount / 100,
      reference,
    });
    return { state: 'attention' as const, booking: b };
  }

  // Lock: only one caller moves the row from 'paystack' to 'paystack:processing'.
  const claim = await prisma.booking.updateMany({
    where: { id: b.id, status: 'PENDING', cloudbedsReservationId: null, paymentProvider: 'paystack' },
    data: { paymentProvider: 'paystack:processing', paymentRef: reference },
  });
  if (claim.count !== 1) return { state: 'processing' as const, booking: b };

  const out = await reserve(b, { amountGhs: payment.amount / 100, reference, channel: payment.channel });
  return { ...out, booking: b };
}

export function stayNights(b: { checkIn: Date; checkOut: Date }) {
  return nightsBetween(iso(b.checkIn), iso(b.checkOut));
}
