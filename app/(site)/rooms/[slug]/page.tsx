import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Users, BedDouble, Maximize2 } from 'lucide-react';
import { SmoothImage as Image } from '@/components/shared/SmoothImage';
import { listPublicRooms, getPublicRoomBySlug, displayCategory } from '@/lib/cms/rooms';
import { Carousel } from '@/components/shared/Carousel';
import { Tide } from '@/components/ui/Tide';
import { site } from '@/lib/site';
import { getT } from '@/lib/i18n/server';
import { formatGhs, roomStartingRateGhs } from '@/lib/pricing';
import { getSetting } from '@/lib/cms/settings';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const room = await getPublicRoomBySlug(params.slug);
  if (!room) return {};
  return {
    title: `${room.name} · Rooms`,
    description: `${room.tagline ?? room.description ?? ''} ${room.name} at KoSa Beach Resort, Elmina, Ghana.`.trim(),
    openGraph: { images: room.image ? [{ url: room.image, width: 1400, height: 900 }] : undefined },
  };
}

const DEFAULT_AMENITY_KEYS = [
  'roomDetail.amenity.balcony',
  'roomDetail.amenity.bed',
  'roomDetail.amenity.shower',
  'roomDetail.amenity.local',
  'roomDetail.amenity.wifi',
  'roomDetail.amenity.ac',
  'roomDetail.amenity.breakfast',
  'roomDetail.amenity.welcome',
] as const;

export default async function RoomDetailPage({ params }: Props) {
  const room = await getPublicRoomBySlug(params.slug);
  if (!room) notFound();

  const { t } = getT();
  const cat = displayCategory(room.category);
  const catKey = ({ 'Garden View': 'rooms.filter.suite', 'Palm Side': 'rooms.filter.palmSide', 'Sea View': 'rooms.filter.beachView' } as const)[cat];

  const amenities = room.amenities.length ? room.amenities : DEFAULT_AMENITY_KEYS.map((k) => t(k));
  const [pricing, allRooms] = await Promise.all([getSetting('pricing'), listPublicRooms()]);
  const showPrices = !pricing.hideRoomPrices;
  const related = allRooms.filter((r) => r.slug !== room.slug).slice(0, 3);
  const gallery = room.gallery.length ? room.gallery : room.image ? [room.image] : [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HotelRoom',
    name: room.name,
    image: room.image ?? undefined,
    description: room.tagline ?? room.description ?? undefined,
    occupancy: { '@type': 'QuantitativeValue', maxValue: room.maxGuests },
    amenityFeature: amenities.map((a) => ({ '@type': 'LocationFeatureSpecification', name: a })),
    offers: { '@type': 'Offer', availability: 'https://schema.org/InStock', url: `${site.url}/rooms/${room.slug}` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section data-sky="morning" className="relative">
        <div className="container-page pt-32 md:pt-44 pb-10">
          <Link href="/rooms" className="eyebrow link-tide">{t('nav.stay')}</Link>
          <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="eyebrow mb-4">{t(catKey)}</p>
              <h1 className="font-display text-display-xl text-balance">{room.name}</h1>
            </div>
            {room.tagline && <p className="lg:col-span-4 text-lede opacity-85 lg:pb-3">{room.tagline}</p>}
          </div>
        </div>
        {gallery.length > 0 && (
          <div className="relative">
            <Carousel images={gallery} alt={room.name} aspect="aspect-[4/3] md:aspect-[21/9]" rounded="rounded-none" dots={gallery.length > 1} sizes="100vw" />
            <Tide below="var(--sky)" size="md" echo className="absolute bottom-[-1px] left-0 z-10" />
          </div>
        )}
      </section>

      <section data-sky="morning" className="container-page py-16 md:py-24 grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ul className="flex flex-wrap gap-x-8 gap-y-3 text-lg">
            <li className="inline-flex items-center gap-2.5">
              <Users size={19} aria-hidden /> {t('roomsPage.upTo')} {room.maxGuests} {t('roomsPage.guestsUnit')}
            </li>
            {room.bedConfig && (
              <li className="inline-flex items-center gap-2.5">
                <BedDouble size={19} aria-hidden /> {room.bedConfig}
              </li>
            )}
            {room.sizeSqm ? (
              <li className="inline-flex items-center gap-2.5">
                <Maximize2 size={18} aria-hidden /> {room.sizeSqm} m²
              </li>
            ) : null}
          </ul>

          <div className="mt-12 font-display text-[1.45rem] md:text-[1.7rem] leading-[1.5] whitespace-pre-line text-pretty max-w-[38ch]" style={{ fontVariationSettings: "'SOFT' 100, 'opsz' 28" }}>
            {room.description || t('roomDetail.descFallback')}
          </div>

          <h2 className="mt-16 font-display text-display-sm">{t('roomDetail.amenities')}</h2>
          <ul className="mt-7 grid gap-x-10 sm:grid-cols-2">
            {amenities.map((a) => (
              <li key={a} className="flex gap-4 border-t border-forest/15 py-4">
                <svg width="22" height="10" viewBox="0 0 22 10" className="mt-2 shrink-0 text-teal" aria-hidden>
                  <path d="M1 8 C4 8 5 2 8 2 S12 8 15 8 18 2 21 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="lg:col-span-4 lg:col-start-9">
          <div className="sticky top-28 rounded-pebble bg-teal-600 p-8 text-cream">
            <p className="font-display text-3xl leading-tight">{room.name}</p>
            {showPrices && (
              <p className="mt-6">
                <span className="block text-sm text-cream/70">{t('homeRooms.from')}</span>
                <span className="font-display text-5xl">{formatGhs(roomStartingRateGhs(room.slug, room.price))}</span>
                <span className="text-cream/70"> {t('homeRooms.night')}</span>
              </p>
            )}
            <div className="mt-8 grid gap-3">
              {room.available ? (
                <a href={site.bookingUrl} target="_blank" rel="noreferrer" className="inline-flex h-14 items-center justify-center rounded-full bg-sunshine px-6 font-semibold text-forest-900 transition-colors hover:bg-cream">
                  {t('roomDetail.reserve')} {room.name}
                </a>
              ) : (
                <span aria-disabled="true" className="inline-flex h-14 items-center justify-center rounded-full bg-cream/10 px-6 font-semibold text-cream/60 cursor-not-allowed">
                  {t('roomsPage.occupied')}
                </span>
              )}
              <Link href="/contact" className="inline-flex h-14 items-center justify-center rounded-full px-6 font-semibold ring-1 ring-inset ring-cream/40 transition-colors hover:bg-cream hover:text-teal-700">
                {t('roomDetail.askConcierge')}
              </Link>
            </div>
            <p className="mt-6 text-sm text-cream/70">{t('roomDetail.freeCancellation')}</p>
          </div>
        </aside>
      </section>

      {related.length > 0 && (
        <section data-sky="noon" className="container-page py-20 md:py-28">
          <h2 className="font-display text-display-md">{t('roomDetail.otherRooms')}</h2>
          <ul className="mt-12 grid gap-10 md:grid-cols-3">
            {related.map((r, i) => (
              <li key={r.id}>
                <Link href={`/rooms/${r.slug}`} className="group block">
                  <div className={`relative aspect-[4/5] overflow-hidden ${i === 1 ? 'rounded-t-full rounded-b-pebble' : 'rounded-pebble'}`}>
                    {r.image && <Image src={r.image} alt={r.name} fill sizes="(min-width:768px) 30vw, 90vw" className="object-cover branded-img transition-transform duration-[1.6s] ease-tide group-hover:scale-105" />}
                  </div>
                  <h3 className="mt-5 font-display text-2xl group-hover:text-teal transition-colors">{r.name}</h3>
                  <p className="mt-1 opacity-70">{r.tagline ?? displayCategory(r.category)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
