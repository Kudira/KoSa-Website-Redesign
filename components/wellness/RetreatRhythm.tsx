'use client';

// Interactive day-by-day breakdown for the three 3-day retreat journeys
// (Signature Rotation, Tide Reset, Saltwater Bloom). A segmented control
// switches tracks; the day list reveals with a soft rise/fade, mirroring the
// Reveal pattern used across the rest of the site.

import { useState } from 'react';
import { wa } from '@/lib/whatsapp';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BookButton } from '@/components/shared/BookButton';
import { formatGhs, RETREAT_TRACKS, type RetreatTrackKey } from '@/lib/pricing';

const TRACK_ORDER: RetreatTrackKey[] = ['rotation', 'him', 'her'];
const TRACK_LABEL: Record<RetreatTrackKey, string> = {
  rotation: 'Signature Rotation',
  him: 'Tide Reset — For Him',
  her: 'Saltwater Bloom — For Her',
};

export function RetreatRhythm() {
  const [active, setActive] = useState<RetreatTrackKey>('rotation');
  const track = RETREAT_TRACKS[active];
  const reduce = useReducedMotion();

  return (
    <div>
      {/* Segmented control */}
      <div className="flex flex-wrap justify-center gap-2 mb-14">
        {TRACK_ORDER.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            aria-pressed={active === key}
            className={`px-5 py-3 rounded-full font-sans text-xs border transition-all duration-300 ${
              active === key
                ? 'bg-sunshine text-teal-900 border-sunshine shadow-sm'
                : 'bg-cream/10 border-cream/20 text-cream/80 hover:bg-cream/20'
            }`}
          >
            {TRACK_LABEL[key]}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active}
          initial={reduce ? undefined : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="text-center mb-12 max-w-lg mx-auto">
            <p className="font-sans text-sm text-sunshine mb-2">{track.for}</p>
            <h3 className="font-display text-3xl text-cream mb-3">{track.name}</h3>
            <p className="font-sans italic text-cream/70">{track.sense}</p>
          </div>

          <ol className="relative max-w-xl mx-auto pl-9">
            <span aria-hidden className="absolute left-[7px] top-2 bottom-2 w-px bg-cream/20" />
            {track.days.map((day) => (
              <li key={day.label} className="relative pb-9 last:pb-0">
                <span
                  aria-hidden
                  className="absolute -left-9 top-1.5 h-3.5 w-3.5 rounded-full bg-sunshine ring-4 ring-teal-700"
                />
                <p className="font-sans text-sm text-sunshine mb-1.5">
                  {day.label}
                </p>
                <h4 className="font-display text-xl text-cream mb-1.5">{day.title}</h4>
                <p className="font-sans italic text-cream/60 text-sm mb-2">{day.sense}</p>
                <p className="font-sans text-sm text-cream/80">{day.items}</p>
              </li>
            ))}
          </ol>

          <div className="flex flex-wrap justify-center gap-10 mt-12 pt-8 border-t border-cream/15 text-center">
            <div>
              <p className="font-sans text-sm text-cream/50 mb-1.5">
                Spa Journey
              </p>
              <p className="font-display text-2xl text-sunshine">{formatGhs(track.spaGhs)}</p>
            </div>
            <div>
              <p className="font-sans text-sm text-cream/50 mb-1.5">
                With 3 Nights&rsquo; Stay
              </p>
              <p className="font-display text-2xl text-sunshine">{formatGhs(track.totalGhs)}</p>
            </div>
          </div>

          {track.oneDayGhs && (
            <p className="text-center mt-5 font-sans text-sm text-cream/55">
              Also available as a One-Day Escape — {formatGhs(track.oneDayGhs)}.
            </p>
          )}

          <div className="flex justify-center mt-9">
            <BookButton
              category="PACKAGE"
              itemName={track.name}
              message={wa.retreat({ name: track.name, days: track.days.length, priceGhs: track.totalGhs })}
              source="wellness/retreats"
              className="inline-flex items-center gap-2 rounded-full bg-sunshine text-teal-900 font-sans text-sm px-8 py-3.5 hover:bg-sunshine-600 transition-colors"
            >
              Enquire About This Retreat
            </BookButton>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
