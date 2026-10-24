import { NextResponse } from 'next/server';
import { z } from 'zod';
import { cloudbedsFetch } from '@/lib/cloudbeds/auth';
import { prisma } from '@/lib/prisma';
import { sendMail } from '@/lib/email';

const schema = z.object({
  roomTypeID: z.string(),
  ratePlanID: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  adults: z.number().int().min(1),
  children: z.number().int().min(0).default(0),
  guest: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    country: z.string().optional(),
  }),
  paymentMethod: z.enum(['cash', 'card', 'paystack', 'transfer']).default('card'),
  totalCost: z.number().nonnegative().optional(),
  currency: z.string().default('GHS'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    // Create guest then reservation in Cloudbeds
    type GuestRes = { guestID?: string; success?: boolean };
    type ResRes = { reservationID?: string; success?: boolean; confirmationNumber?: string };

    const guestRes = await cloudbedsFetch<GuestRes>('/postGuest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyID: process.env.CLOUDBEDS_PROPERTY_ID,
        guestFirstName: data.guest.firstName,
        guestLastName: data.guest.lastName,
        guestEmail: data.guest.email,
        guestPhone: data.guest.phone,
        guestCountry: data.guest.country,
      }),
    });

    const reservation = await cloudbedsFetch<ResRes>('/postReservation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyID: process.env.CLOUDBEDS_PROPERTY_ID,
        startDate: data.startDate,
        endDate: data.endDate,
        guestID: guestRes.guestID,
        rooms: [
          {
            roomTypeID: data.roomTypeID,
            ratePlanID: data.ratePlanID,
            adults: data.adults,
            children: data.children,
          },
        ],
        paymentMethod: data.paymentMethod,
      }),
    });

    // Cache in local DB
    const cached = await prisma.booking.create({
      data: {
        cloudbedsReservationId: reservation.reservationID,
        confirmationNumber: reservation.confirmationNumber,
        guestName: `${data.guest.firstName} ${data.guest.lastName}`,
        guestEmail: data.guest.email,
        guestPhone: data.guest.phone,
        checkIn: new Date(data.startDate),
        checkOut: new Date(data.endDate),
        adults: data.adults,
        children: data.children,
        roomTypeId: data.roomTypeID,
        ratePlanId: data.ratePlanID,
        totalCost: data.totalCost,
        currency: data.currency,
        status: 'CONFIRMED',
        paymentProvider: data.paymentMethod,
      },
    });

    // Mark the booked room type as occupied so the site + AI concierge reflect it.
    if (data.roomTypeID) {
      await prisma.room
        .updateMany({ where: { cloudbedsRoomTypeId: data.roomTypeID }, data: { available: false } })
        .catch(() => {});
    }

    await sendMail({
      to: data.guest.email,
      subject: `Your KoSa reservation is confirmed ${reservation.confirmationNumber ?? cached.id}`,
      text: `Akwaaba ${data.guest.firstName},\n\nYour stay at KoSa Beach Resort is confirmed for ${data.startDate} → ${data.endDate}.\n\nConfirmation: ${reservation.confirmationNumber ?? cached.id}\n\nWe can't wait to welcome you.\n\nSimply, Belong.\nKoSa Beach Resort`,
    });

    return NextResponse.json({
      ok: true,
      reservationID: reservation.reservationID,
      confirmationNumber: reservation.confirmationNumber ?? cached.id,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 400 });
  }
}
