// Live availability for a stay, matched to the rooms on the website.
// GET /api/cloudbeds/availability?checkIn=2026-12-20&checkOut=2026-12-23&adults=2&children=0

import { NextResponse } from 'next/server';
import { listPublicRooms } from '@/lib/cms/rooms';
import { directBookingModes } from '@/lib/booking/direct';
import { bookingEngineUrl, cloudbedsConfigured, getStayRates, matchRoomType, nightsBetween } from '@/lib/cloudbeds/client';

export const dynamic = 'force-dynamic';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const checkIn = url.searchParams.get('checkIn') ?? '';
  const checkOut = url.searchParams.get('checkOut') ?? '';
  const adults = Math.min(12, Math.max(1, Number(url.searchParams.get('adults') || 2)));
  const children = Math.min(10, Math.max(0, Number(url.searchParams.get('children') || 0)));
  if (!DATE.test(checkIn) || !DATE.test(checkOut) || checkOut <= checkIn) {
    return NextResponse.json({ error: 'Choose a check-in date and a later check-out date.' }, { status: 400 });
  }
  const link = bookingEngineUrl({ checkIn, checkOut, adults, children });
  if (!cloudbedsConfigured()) {
    return NextResponse.json({ configured: false, bookingUrl: link, rooms: [], direct: { payNow: false, payLater: false } });
  }

  const [rates, rooms] = await Promise.all([getStayRates({ checkIn, checkOut, adults, children }), listPublicRooms()]);
  const matched = rates.map((r) => {
    const room = rooms.find((x) => matchRoomType(x, [r]));
    return {
      roomTypeId: r.roomTypeId,
      name: room?.name ?? r.roomTypeName,
      slug: room?.slug ?? null,
      image: room?.image ?? null,
      nightly: r.nightly,
      total: r.total,
      currency: r.currency,
      roomsLeft: r.roomsAvailable,
      ratePlan: r.ratePlanName,
    };
  });

  return NextResponse.json({
    configured: true,
    checkIn,
    checkOut,
    nights: nightsBetween(checkIn, checkOut),
    adults,
    children,
    bookingUrl: link,
    rooms: matched,
    direct: directBookingModes(),
  });
}
