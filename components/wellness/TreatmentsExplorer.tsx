'use client';

// Wellness treatments browser: filter by offering type (category) and page
// through the results two cards at a time. Each card carries an image, a short
// description and its duration/price variants, plus a direct WhatsApp booking
// CTA (Change Request §Wellness). Horizontal scroll-snap rail = swipe on touch,
// prev/next arrows on desktop.

import { useMemo, useRef, useState } from 'react';
import { wa } from '@/lib/whatsapp';
import { ChevronLeft, ChevronRight, Flower2 } from 'lucide-react';
import { SmoothImage as Image } from '@/components/shared/SmoothImage';
import { BookButton } from '@/components/shared/BookButton';
import { formatGhs } from '@/lib/pricing';

export type TreatmentCard = {
  key: string;
  name: string;
  category: string | null;
  description: string | null;
  image: string | null;
  variants: { durationMin: number; priceGhs: number }[];
};

export function TreatmentsExplorer({
  treatments,
  showPrices,
  labels,
}: {
  treatments: TreatmentCard[];
  showPrices: boolean;
  labels: { all: string; book: string };
}) {
  const categories = useMemo(() => {
    const seen: string[] = [];
    for (const t of treatments) {
      if (t.category && !seen.includes(t.category)) seen.push(t.category);
    }
    return seen;
  }, [treatments]);

  const [active, setActive] = useState<string>('ALL');
  const railRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () => (active === 'ALL' ? treatments : treatments.filter((t) => t.category === active)),
    [treatments, active],
  );

  const scrollByCard = (dir: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: dir * rail.clientWidth * 0.9, behavior: 'smooth' });
  };

  const tabs = [{ id: 'ALL', label: labels.all }, ...categories.map((c) => ({ id: c, label: c }))];

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActive(tab.id);
              railRef.current?.scrollTo({ left: 0 });
            }}
            aria-pressed={active === tab.id}
            className={`h-11 rounded-full px-5 text-[0.95rem] font-medium transition-colors duration-500 ${
              active === tab.id ? 'bg-forest text-cream' : 'ring-1 ring-inset ring-forest/20 hover:bg-forest/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative">
        {/* Two cards at a time, swipeable on touch */}
        <div
          ref={railRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {filtered.map((tr) => (
            <article
              key={tr.key}
              className="snap-start shrink-0 w-[85%] sm:w-[calc(50%-12px)] bg-cream/80 rounded-pebble overflow-hidden ring-1 ring-forest/10 flex flex-col"
            >
              <div className="relative aspect-[16/10] branded-img overflow-hidden bg-gradient-to-br from-teal-100 to-sand">
                {tr.image ? (
                  <Image
                    src={tr.image}
                    alt={tr.name}
                    fill
                    sizes="(min-width:640px) 45vw, 85vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-teal/40">
                    <Flower2 size={40} />
                  </div>
                )}
                {tr.category && (
                  <span className="absolute top-4 left-4 text-sm font-medium bg-cream/90 text-forest px-3.5 py-1.5 rounded-full">
                    {tr.category}
                  </span>
                )}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-display text-2xl">{tr.name}</h3>
                {tr.description && (
                  <p className="mt-2 font-sans text-sm text-forest/75 leading-relaxed">
                    {tr.description}
                  </p>
                )}
                <ul className="mt-4 space-y-1.5">
                  {tr.variants.map((v) => (
                    <li
                      key={v.durationMin}
                      className="flex items-baseline justify-between gap-3 text-[0.95rem] border-b border-forest/10 pb-2 last:border-0"
                    >
                      <span className="">{v.durationMin} min</span>
                      {showPrices && <span className="font-semibold tabular-nums">{formatGhs(v.priceGhs)}</span>}
                    </li>
                  ))}
                </ul>
                <BookButton
                  category="TREATMENT"
                  itemName={tr.name}
                  message={wa.treatment({ name: tr.name, durationMin: tr.variants[0]?.durationMin, priceGhs: showPrices ? tr.variants[0]?.priceGhs : undefined })}
                  source="wellness/treatments"
                  className="mt-6 self-start inline-flex h-11 items-center gap-2 rounded-full bg-forest text-cream font-semibold px-5 hover:bg-forest-700 transition-colors"
                >
                  {labels.book}
                </BookButton>
              </div>
            </article>
          ))}
        </div>

        {/* Prev / next (desktop) */}
        {filtered.length > 2 && (
          <div className="hidden sm:flex gap-3 mt-8">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="Previous treatments"
              className="grid place-items-center h-11 w-11 rounded-full ring-1 ring-inset ring-forest/25 hover:bg-forest hover:text-cream transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="More treatments"
              className="grid place-items-center h-11 w-11 rounded-full ring-1 ring-inset ring-forest/25 hover:bg-forest hover:text-cream transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
