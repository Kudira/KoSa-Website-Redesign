'use client';

// Filterable grid of events/activities (pulled from the Events CMS, sourced
// from ko-sa.com/activities). Category chips filter client-side; cards show an
// image, category, description, transport badge and a WhatsApp enquiry CTA.

import { useMemo, useState } from 'react';
import { wa } from '@/lib/whatsapp';
import { SmoothImage as Image } from '@/components/shared/SmoothImage';
import { Bus, CalendarHeart } from 'lucide-react';
import { BookButton } from '@/components/shared/BookButton';

export interface PublicEvent {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  image: string | null;
  transportIncluded: boolean;
  priceNote: string | null;
}

interface Labels {
  all: string;
  enquire: string;
  transport: string;
  empty: string;
}

export function EventsExplorer({ events, labels }: { events: PublicEvent[]; labels: Labels }) {
  // Categories present in the data, in first-seen order.
  const categories = useMemo(() => {
    const seen: string[] = [];
    for (const e of events) if (!seen.includes(e.category)) seen.push(e.category);
    return seen;
  }, [events]);

  const [active, setActive] = useState<string>('all');
  const filtered = useMemo(
    () => (active === 'all' ? events : events.filter((e) => e.category === active)),
    [events, active],
  );

  return (
    <div>
      {/* Category filter chips */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-12">
          {['all', ...categories].map((cat) => {
            const isActive = active === cat;
            return (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                aria-pressed={isActive}
                className={`h-11 rounded-full px-5 text-[0.95rem] font-medium transition-colors duration-500 ${
              isActive ? 'bg-forest text-cream' : 'ring-1 ring-inset ring-forest/20 hover:bg-forest/5'
            }`}
              >
                {cat === 'all' ? labels.all : cat}
              </button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="py-16 font-display text-3xl opacity-70">{labels.empty}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {filtered.map((e) => (
            <article
              key={e.id}
              className="group flex flex-col"
            >
              <div className="relative aspect-[4/3] branded-img overflow-hidden rounded-pebble kosa-img-fallback">
                {e.image ? (
                  <Image
                    src={e.image}
                    alt={e.title}
                    fill
                    sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-[1.6s] ease-tide group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-teal/30">
                    <CalendarHeart size={40} />
                  </div>
                )}
                <span className="absolute top-4 left-4 text-sm font-medium bg-cream/90 text-forest px-3.5 py-1.5 rounded-full">
                  {e.category}
                </span>
              </div>
              <div className="pt-6 flex flex-col flex-1">
                <h3 className="font-display text-2xl leading-tight">{e.title}</h3>
                <p className="mt-3 opacity-80 leading-relaxed flex-1">{e.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm opacity-70">
                  {e.transportIncluded && (
                    <span className="inline-flex items-center gap-1.5">
                      <Bus size={13} /> {labels.transport}
                    </span>
                  )}
                  {e.priceNote && <span>{e.priceNote}</span>}
                </div>
                <BookButton
                  category="EVENT"
                  itemName={e.title}
                  message={wa.event({ title: e.title, priceNote: e.priceNote, transportIncluded: e.transportIncluded })}
                  source="events"
                  className="mt-5 self-start inline-flex h-11 items-center gap-2 rounded-full bg-forest text-cream font-semibold px-5 hover:bg-forest-700 transition-colors"
                >
                  {labels.enquire}
                </BookButton>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
