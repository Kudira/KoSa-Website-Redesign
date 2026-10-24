import { prisma } from '@/lib/prisma';

// Live room availability. A room is available when its `available` flag is true
// AND no confirmed Booking currently overlaps today for that room type. This is
// the single source of truth read by both the public site and the AI concierge,
// so a fully-booked resort stays shown as booked until freed.

export interface RoomAvailability {
  name: string;
  available: boolean;
}
export interface AvailabilitySummary {
  rooms: RoomAvailability[];
  anyAvailable: boolean;
  allBooked: boolean;
}

export async function getAvailability(): Promise<AvailabilitySummary> {
  try {
    const now = new Date();
    const [rooms, activeBookings] = await Promise.all([
      prisma.room.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        select: { id: true, name: true, available: true, cloudbedsRoomTypeId: true },
      }),
      prisma.booking.findMany({
        where: { status: 'CONFIRMED', checkIn: { lte: now }, checkOut: { gt: now } },
        select: { roomTypeId: true, roomTypeName: true },
      }),
    ]);

    // Keys that identify a currently-occupied room type (id, cloudbeds id or name).
    const booked = new Set(
      activeBookings.flatMap((b) => [b.roomTypeId, b.roomTypeName]).filter(Boolean) as string[],
    );
    const isBooked = (r: { id: string; name: string; cloudbedsRoomTypeId: string | null }) =>
      booked.has(r.id) || booked.has(r.name) || (r.cloudbedsRoomTypeId ? booked.has(r.cloudbedsRoomTypeId) : false);

    const list = rooms.map((r) => ({ name: r.name, available: r.available && !isBooked(r) }));
    const anyAvailable = list.some((r) => r.available);
    return { rooms: list, anyAvailable, allBooked: list.length > 0 && !anyAvailable };
  } catch {
    // If the DB is unreachable, do not claim anything is booked.
    return { rooms: [], anyAvailable: true, allBooked: false };
  }
}

/** Compact text block describing current availability, for the AI concierge. */
export function availabilityToPrompt(a: AvailabilitySummary): string {
  if (!a.rooms.length) return 'CURRENT ROOM AVAILABILITY: unknown — direct availability questions to /book or WhatsApp.';
  if (a.allBooked) {
    return 'CURRENT ROOM AVAILABILITY (live): the resort is FULLY BOOKED right now — every room is occupied. Do not offer or promise a room. Warmly invite the guest to try different dates, join the waitlist, or check back, via /book or WhatsApp.';
  }
  const lines = a.rooms.map((r) => `- ${r.name}: ${r.available ? 'Available' : 'Occupied'}`).join('\n');
  return `CURRENT ROOM AVAILABILITY (live):\n${lines}\nOnly rooms marked Available can be booked right now.`;
}
