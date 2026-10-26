// Rooms from the admin, enriched with live Cloudbeds data.
// The admin stays the source of truth for names, photos and copy. Cloudbeds
// adds what changes every day: tonight's price, rooms left, occupancy, and the
// official room description and features as a fallback.

import 'server-only';
import { listPublicRooms, getPublicRoomBySlug } from '@/lib/cms/rooms';
import { cloudbedsConfigured, getRoomTypes, getTonight, matchRoomType } from '@/lib/cloudbeds/client';
import type { PublicRoom } from '@/lib/cms/types';

async function enrich(rooms: PublicRoom[]): Promise<PublicRoom[]> {
  if (!cloudbedsConfigured() || !rooms.length) return rooms;
  const [types, tonight] = await Promise.all([getRoomTypes(), getTonight()]);
  if (!types.length && !tonight.length) return rooms;
  return rooms.map((room) => {
    const type = matchRoomType(room, types.map((t) => ({ ...t, roomTypeId: t.id, roomTypeName: t.name })));
    const rate = matchRoomType({ name: room.name, cloudbedsRoomTypeId: room.cloudbedsRoomTypeId ?? type?.id }, tonight);
    if (!type && !rate) return room;
    return {
      ...room,
      cloudbedsRoomTypeId: room.cloudbedsRoomTypeId ?? type?.id ?? rate?.roomTypeId ?? null,
      maxGuests: type?.maxGuests ?? room.maxGuests,
      live: {
        nightly: rate?.nightly ?? null,
        currency: rate?.currency ?? 'GHS',
        // A type missing from tonight's list (while others are present) is sold out tonight.
        roomsLeft: rate ? rate.roomsAvailable : tonight.length ? 0 : null,
        maxGuests: type?.maxGuests ?? null,
        description: type?.description ?? null,
        features: type?.features ?? [],
        photos: type?.photos ?? [],
      },
    };
  });
}

export async function listRoomsWithLive(): Promise<PublicRoom[]> {
  return enrich(await listPublicRooms());
}

export async function getRoomWithLive(slug: string): Promise<PublicRoom | null> {
  const room = await getPublicRoomBySlug(slug);
  if (!room) return null;
  const [enriched] = await enrich([room]);
  return enriched;
}
