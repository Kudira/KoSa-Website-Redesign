'use client';

// Dusk. One guest at a time, in their own words. Only real, published reviews
// from the admin are shown; if there are none, the section stays out of the way.

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useT } from '@/lib/i18n';
import type { PublicTestimonial } from '@/lib/cms/types';

export function Voices({ testimonials }: { testimonials: PublicTestimonial[] }) {
  const { t } = useT();
  const [i, setI] = useState(0);
  if (!testimonials.length) return null;
  const q = testimonials[i];
  const go = (d: number) => setI((v) => (v + d + testimonials.length) % testimonials.length);

  return (
    <section data-sky="dusk" className="relative py-28 md:py-44">
      <div className="container-page">
        <p className="eyebrow mb-10">{t('voices.eyebrow')}</p>
        <div className="min-h-[18rem] md:min-h-[22rem]">
          <AnimatePresence mode="wait">
            <motion.figure
              key={q.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <blockquote className="font-display text-display-md max-w-5xl text-balance">“{q.quote}”</blockquote>
              <figcaption className="mt-8 text-lg">
                <span className="font-semibold">{q.guestName}</span>
                {q.country && <span className="opacity-70">, {q.country}</span>}
                {q.source && <span className="opacity-60"> {t('testimonials.via')} {q.source}</span>}
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>
        {testimonials.length > 1 && (
          <div className="mt-10 flex items-center gap-3">
            <button type="button" onClick={() => go(-1)} aria-label={t('voices.prev')} className="grid h-12 w-12 place-items-center rounded-full ring-1 ring-inset ring-forest-900/30 hover:bg-forest-900 hover:text-cream transition-colors">
              <ArrowLeft size={18} />
            </button>
            <button type="button" onClick={() => go(1)} aria-label={t('voices.next')} className="grid h-12 w-12 place-items-center rounded-full ring-1 ring-inset ring-forest-900/30 hover:bg-forest-900 hover:text-cream transition-colors">
              <ArrowRight size={18} />
            </button>
            <span className="ml-3 text-sm tabular-nums opacity-70">
              {i + 1} / {testimonials.length}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
