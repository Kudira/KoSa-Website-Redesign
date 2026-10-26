// Quick health check for the Cloudbeds connection. Safe to open in a browser:
// it reports counts and room-type names only, never keys or guest data.
// GET /api/cloudbeds/status

import { NextResponse } from 'next/server';
import { cloudbedsConfigured, cloudbedsWriteEnabled, getPaymentMethods, getRoomTypes, getTonight } from '@/lib/cloudbeds/client';
import { directBookingModes } from '@/lib/booking/direct';
import { listPublicRooms } from '@/lib/cms/rooms';
import { matchRoomType } from '@/lib/cloudbeds/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!cloudbedsConfigured()) {
    return NextResponse.json({ connected: false, reason: 'Set CLOUDBEDS_API_KEY and CLOUDBEDS_PROPERTY_ID in Vercel.' });
  }
  const write = cloudbedsWriteEnabled();
  const [types, tonight, rooms, methods] = await Promise.all([getRoomTypes(), getTonight(), listPublicRooms(), write ? getPaymentMethods() : Promise.resolve([])]);
  const modes = directBookingModes();
  return NextResponse.json({
    connected: types.length > 0 || tonight.length > 0,
    directBooking: modes.payNow ? 'on: pay now with Paystack' + (modes.payLater ? ', and pay later' : '') : modes.payLater ? 'on: pay later only' : write ? 'off: add PAYSTACK_SECRET_KEY (or BOOKING_ALLOW_PAY_LATER=true)' : 'off: guests use the Cloudbeds booking engine',
    paymentTypeUsed: write ? process.env.CLOUDBEDS_PAYMENT_TYPE || 'ebanking' : undefined,
    paymentMethodsInCloudbeds: write ? methods : undefined,
    roomTypes: types.map((t) => ({ id: t.id, name: t.name, maxGuests: t.maxGuests })),
    tonight: tonight.map((r) => ({ roomType: r.roomTypeName, nightly: r.nightly, roomsLeft: r.roomsAvailable })),
    websiteRooms: rooms.map((r) => {
      const t = matchRoomType(r, types.map((x) => ({ ...x, roomTypeId: x.id, roomTypeName: x.name })));
      return { website: r.name, cloudbeds: t?.name ?? null };
    }),
  });
}
