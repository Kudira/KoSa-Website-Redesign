'use client';

// Dusk. Three ways to stay, chosen by how many nights you can give yourself.

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useT } from '@/lib/i18n';
import type { DictKey } from '@/lib/i18n/dictionaries';
import { PACKAGES, formatGhs, type PackageKey } from '@/lib/pricing';
import { sentences, prose } from '@/lib/content/media';
import { site } from '@/lib/site';
import { cn } from '@/lib/utils';

const KEYS: PackageKey[] = ['weekend', 'short', 'full'];

export function Stays() {
  const { t } = useT();
  const [key, setKey] = useState<PackageKey>('weekend');
  const p = PACKAGES[key];

  return (
    <section data-sky="golden" className="relative py-24 md:py-36">
      <div className="container-page grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow mb-5">{t('home.itineraries.eyebrow')}</p>
          <h2 className="font-display text-display-lg text-balance">{t('home.itineraries.heading')}</h2>
          <p className="mt-6 text-lede opacity-85 max-w-md">{prose(t('home.itineraries.closing'))}</p>

          <div role="tablist" aria-label={t('home.itineraries.eyebrow')} className="mt-12 flex gap-3">
            {KEYS.map((k) => {
              const on = k === key;
              return (
                <button
                  key={k}
                  role="tab"
                  aria-selected={on}
                  aria-controls="stay-panel"
                  onClick={() => setKey(k)}
                  className={cn(
                    'flex flex-col items-start rounded-pebble px-5 py-4 md:px-7 md:py-5 text-left transition-colors duration-500',
                    on ? 'bg-forest text-cream' : 'ring-1 ring-inset ring-forest/25 hover:bg-forest/5',
                  )}
                >
                  <span className="font-display text-4xl md:text-5xl leading-none tabular-nums">{PACKAGES[k].nights}</span>
                  <span className="mt-1 text-sm opacity-80">{t(`home.itineraries.${k}` as DictKey).split('·')[0].trim()}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div id="stay-panel" role="tabpanel" className="lg:col-span-6 lg:col-start-7 min-h-[28rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <h3 className="font-display text-display-md text-balance">{t(`home.itineraries.${key}.title` as DictKey)}</h3>
              <ul className="mt-8 space-y-4">
                {sentences(t(`home.itineraries.${key}.body` as DictKey)).map((s, i) => (
                  <li key={i} className="flex gap-4 text-lg leading-relaxed">
                    <svg width="22" height="10" viewBox="0 0 22 10" className="mt-2.5 shrink-0 text-coral-600" aria-hidden>
                      <path d="M1 8 C4 8 5 2 8 2 S12 8 15 8 18 2 21 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="opacity-90">{s}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10 rounded-pebble bg-cream/60 p-6 md:p-7">
                <p className="font-display text-3xl">
                  {t('homeRooms.from')} {formatGhs(p.fromGhs)}
                </p>
                <p className="mt-1 opacity-75">
                  {p.nights} {t('book.nightsUnit')}. {t('stays.includes')} {p.inclusions}.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href={site.bookingUrl} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center rounded-full bg-forest px-7 font-semibold text-cream transition-colors hover:bg-forest-700">
                    {t('home.itineraries.bookNow')}
                  </a>
                  <Link href="/plan" className="inline-flex h-12 items-center rounded-full px-5 font-semibold ring-1 ring-inset ring-forest/30 transition-colors hover:bg-forest/5">
                    {t('home.itineraries.cta')}
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
