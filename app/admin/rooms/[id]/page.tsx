import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { RoomForm, type RoomFormValues } from '../RoomForm';
import type { Locale } from '@/lib/i18n/dictionaries';

export const metadata: Metadata = { title: 'Edit Room · Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function EditRoomPage({ params }: { params: { id: string } }) {
  const room = await prisma.room.findUnique({ where: { id: params.id } });
  if (!room) notFound();

  const initial: Partial<RoomFormValues> = {
    id: room.id,
    slug: room.slug,
    name: room.name,
    tagline: room.tagline ?? '',
    category: room.category,
    description: room.description ?? '',
    price: Number(room.price),
    currency: room.currency,
    maxGuests: room.maxGuests,
    bedConfig: room.bedConfig ?? '',
    sizeSqm: room.sizeSqm ?? '',
    image: room.image ?? '',
    gallery: room.gallery,
    amenities: room.amenities,
    features: room.features,
    cloudbedsRoomTypeId: room.cloudbedsRoomTypeId ?? '',
    available: room.available,
    status: room.status,
    sortOrder: room.sortOrder,
    translations: (room.translations as Partial<Record<Locale, Record<string, string>>> | null) ?? {},
  };

  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader backHref="/admin/rooms" eyebrow="Rooms" title={room.name} description={`/rooms/${room.slug}`} />
      <RoomForm initial={initial} />
    </section>
  );
}
