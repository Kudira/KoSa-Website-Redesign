'use client';

// Daily activities as a dynamic, swipeable rail: one day per card, each card
// roughly two-thirds of the viewport so the next day peeks in and invites a
// swipe (Change Request §Experiences). Prev/next arrows on desktop, native
// horizontal scroll-snap on touch.

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SmoothImage as Image } from '@/components/shared/SmoothImage';

export type RailActivity = {
  id: string;
  time: string;
  title: string;
  description: string | null;
  tag: string | null;
  isFree: boolean;
};
export type RailDay = { day: string; label: string; image?: string; activities: RailActivity[] };

export function DailyActivitiesRail({
  days,
  freeLabel,
}: {
  days: RailDay[];
  freeLabel: string;
}) {
  const railRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: dir * rail.clientWidth * 0.66, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div
        ref={railRef}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {days.map((d) => (
          <div
            key={d.day}
            className="snap-start shrink-0 w-[88%] sm:w-[62%] lg:w-[44%] bg-cream/80 rounded-pebble overflow-hidden ring-1 ring-forest/10"
          >
            <div className="relative h-44 bg-teal-700 branded-img text-cream">
              {d.image && (
                <Image src={d.image} alt={d.label} fill sizes="(min-width:1024px) 60vw, 88vw" className="object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-teal-900/85 via-teal-900/30 to-teal-900/10" />
              <div className="absolute inset-x-0 bottom-0 px-7 py-4 flex items-baseline justify-between">
                <p className="font-display text-4xl drop-shadow-[0_1px_10px_rgba(0,0,0,0.4)]">{d.label}</p>

              </div>
            </div>
            <div className="divide-y divide-forest/10">
              {d.activities.map((a) => (
                <div key={a.id} className="px-7 py-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-xl tabular-nums text-teal">
                      {a.time}
                    </p>
                    {a.isFree && (
                      <span className="text-sm font-medium bg-sunshine/30 text-forest px-3 py-1 rounded-full">
                        {freeLabel}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 font-sans font-semibold text-lg leading-snug">{a.title}</h3>
                  {a.description && (
                    <p className="mt-1.5 opacity-75 leading-relaxed">
                      {a.description}
                    </p>
                  )}
                  {a.tag && <p className="mt-2 text-sm text-coral-700">{a.tag}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden sm:flex gap-3 mt-8">
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="Previous day"
          className="grid place-items-center h-11 w-11 rounded-full ring-1 ring-inset ring-forest/25 hover:bg-forest hover:text-cream transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="Next day"
          className="grid place-items-center h-11 w-11 rounded-full ring-1 ring-inset ring-forest/25 hover:bg-forest hover:text-cream transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
