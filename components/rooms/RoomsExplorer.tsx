'use client';

// Rooms as a sequence of spreads rather than a grid of cards: a large swipeable
// photograph on one side, the room's character on the other, alternating down
// the page. Search and a category filter sit quietly above.

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Search, X, Users, BedDouble, Maximize2 } from 'lucide-react';
import { Carousel } from '@/components/shared/Carousel';
import { displayCategory, type PublicRoom } from '@/lib/cms/types';
import { formatGhs, roomStartingRateGhs } from '@/lib/pricing';
import { cn } from '@/lib/utils';

type Labels = {
  searchPlaceholder: string;
  all: string;
  suite: string;
  palmSide: string;
  beachView: string;
  upTo: string;
  guestsUnit: string;
  cardCta: string;
  resultsOne: string;
  resultsMany: string;
  empty: string;
  view: string;
  occupied: string;
  bookingUrl: string;
  from?: string;
  night?: string;
  clear?: string;
  tonight?: string;
  left?: string;
  full?: string;
};

const CATS = ['All', 'Sea View', 'Garden View', 'Palm Side'] as const;

export function RoomsExplorer({ rooms, labels, showPrices = true }: { rooms: PublicRoom[]; labels: Labels; showPrices?: boolean }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<(typeof CATS)[number]>('All');

  const catLabel = (c: (typeof CATS)[number] | ReturnType<typeof displayCategory>) =>
    c === 'All' ? labels.all : c === 'Garden View' ? labels.suite : c === 'Palm Side' ? labels.palmSide : labels.beachView;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rooms.filter((r) => {
      if (active !== 'All' && displayCategory(r.category) !== active) return false;
      if (!q) return true;
      const hay = [r.name, r.tagline, r.description, r.bedConfig, ...(r.amenities ?? []), ...(r.features ?? [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rooms, query, active]);

  return (
    <div>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between pb-8 border-b border-forest/15">
        <div className="flex flex-wrap gap-2" role="group" aria-label={labels.all}>
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              aria-pressed={active === c}
              className={cn(
                'h-11 rounded-full px-5 text-[0.95rem] font-medium transition-colors duration-500',
                active === c ? 'bg-forest text-cream' : 'ring-1 ring-inset ring-forest/20 hover:bg-forest/5',
              )}
            >
              {catLabel(c)}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:max-w-sm">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" aria-hidden />
          <label htmlFor="room-search" className="sr-only">{labels.searchPlaceholder}</label>
          <input
            id="room-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={labels.searchPlaceholder}
            className="h-12 w-full rounded-full bg-cream/70 pl-11 pr-11 ring-1 ring-inset ring-forest/15 placeholder:text-forest/45 focus:ring-teal focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label={labels.clear ?? 'Clear search'} className="absolute right-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full hover:bg-forest/5">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <p className="mt-6 text-sm opacity-60" aria-live="polite">
        {filtered.length === 1 ? labels.resultsOne : labels.resultsMany.replace('{n}', String(filtered.length))}
      </p>

      {filtered.length === 0 ? (
        <p className="py-24 font-display text-3xl opacity-70">{labels.empty}</p>
      ) : (
        <ol className="mt-4">
          {filtered.map((r, i) => {
            const images = r.gallery?.length ? r.gallery : r.image ? [r.image] : [];
            const flip = i % 2 === 1;
            return (
              <li key={r.id} className="grid gap-8 py-14 md:py-20 lg:grid-cols-12 lg:gap-14 border-b border-forest/10 last:border-0">
                <div className={cn('relative lg:col-span-7', flip && 'lg:order-2')}>
                  {images.length > 0 ? (
                    <Carousel
                      images={images}
                      alt={r.name}
                      aspect="aspect-[4/3]"
                      rounded={flip ? 'rounded-pebble' : 'rounded-t-[12rem] rounded-b-pebble'}
                      dots={images.length > 1}
                      sizes="(min-width:1024px) 58vw, 100vw"
                    />
                  ) : (
                    <div className="aspect-[4/3] rounded-pebble kosa-img-fallback" />
                  )}
                  {!r.available && (
                    <span className="absolute left-4 top-4 z-10 rounded-full bg-forest px-4 py-2 text-sm font-medium text-cream">{labels.occupied}</span>
                  )}
                </div>

                <div className={cn('lg:col-span-5 flex flex-col justify-center', flip && 'lg:order-1')}>
                  <p className="eyebrow">{catLabel(displayCategory(r.category))}</p>
                  <h2 className="mt-4 font-display text-display-md text-balance">
                    <Link href={`/rooms/${r.slug}`} className="hover:text-teal transition-colors">
                      {r.name}
                    </Link>
                  </h2>
                  {r.tagline && <p className="mt-4 text-lede opacity-85 max-w-md">{r.tagline}</p>}

                  <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-[0.95rem] opacity-80">
                    <li className="inline-flex items-center gap-2">
                      <Users size={17} aria-hidden /> {labels.upTo} {r.maxGuests} {labels.guestsUnit}
                    </li>
                    {r.bedConfig && (
                      <li className="inline-flex items-center gap-2">
                        <BedDouble size={17} aria-hidden /> {r.bedConfig}
                      </li>
                    )}
                    {r.sizeSqm ? (
                      <li className="inline-flex items-center gap-2">
                        <Maximize2 size={16} aria-hidden /> {r.sizeSqm} m²
                      </li>
                    ) : null}
                  </ul>

                  {showPrices && (
                    <p className="mt-8">
                      <span className="text-sm opacity-60 block">{r.live?.nightly ? labels.tonight ?? 'Tonight from' : labels.from ?? 'From'}</span>
                      <span className="font-display text-4xl">{formatGhs(r.live?.nightly ?? roomStartingRateGhs(r.slug, r.price))}</span>
                      <span className="opacity-60"> {labels.night ?? 'a night'}</span>
                    </p>
                  )}
                  {r.live?.roomsLeft != null && r.live.roomsLeft <= 3 && (
                    <p className="mt-3 w-fit rounded-full bg-sunshine/60 px-3.5 py-1.5 text-sm font-semibold">
                      {r.live.roomsLeft === 0 ? labels.full : (labels.left ?? 'Only {n} left tonight').replace('{n}', String(r.live.roomsLeft))}
                    </p>
                  )}

                  <div className="mt-8 flex flex-wrap gap-3">
                    {r.available ? (
                      <Link href={`/rooms/${r.slug}#dates`} className="inline-flex h-12 items-center rounded-full bg-teal px-7 font-semibold text-cream transition-colors hover:bg-teal-700">
                        {labels.cardCta}
                      </Link>
                    ) : (
                      <span aria-disabled="true" className="inline-flex h-12 items-center rounded-full bg-forest/10 px-7 font-semibold opacity-60 cursor-not-allowed">
                        {labels.occupied}
                      </span>
                    )}
                    <Link href={`/rooms/${r.slug}`} className="inline-flex h-12 items-center rounded-full px-6 font-semibold ring-1 ring-inset ring-forest/25 transition-colors hover:bg-forest hover:text-cream">
                      {labels.view}
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
