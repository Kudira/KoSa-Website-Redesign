'use client';

import { SmoothImage as Image } from '@/components/shared/SmoothImage';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useT } from '@/lib/i18n';
import type { PublicGalleryItem } from '@/lib/cms/types';

const PAGE = 12;
// Filter order (only tabs that actually have photos are shown).
const TAGS = ['dishes', 'breakfast', 'drinks', 'moments'] as const;
type Tag = (typeof TAGS)[number];

// Derive a food sub-type straight from where the photo lives in the bucket /
// its filename - no extra DB field needed, so it stays in sync with the images.
function foodTag(url: string): Tag {
  const u = url.toLowerCase();
  const file = u.split('/').pop() ?? '';
  if (u.includes('/media/drinks/') || file.startsWith('drinks')) return 'drinks';
  if (file.startsWith('breakfast')) return 'breakfast';
  if (u.includes('/media/dining-life/') || file.startsWith('people')) return 'moments';
  return 'dishes';
}

export function FoodGallery({ items }: { items: PublicGalleryItem[] }) {
  const { t } = useT();
  const [active, setActive] = useState<'all' | Tag>('all');
  const [count, setCount] = useState(PAGE);
  const [open, setOpen] = useState<number | null>(null);

  const tagged = useMemo(() => items.map((i) => ({ ...i, tag: foodTag(i.imageUrl) })), [items]);

  // Which filter tabs to render, in fixed order.
  const tabs = useMemo(() => TAGS.filter((tag) => tagged.some((i) => i.tag === tag)), [tagged]);

  const filtered = useMemo(
    () => (active === 'all' ? tagged : tagged.filter((i) => i.tag === active)),
    [tagged, active],
  );
  const visible = filtered.slice(0, count);

  useEffect(() => setCount(PAGE), [active]);

  const close = useCallback(() => setOpen(null), []);
  const go = useCallback(
    (dir: number) => setOpen((i) => (i === null ? null : (i + dir + filtered.length) % filtered.length)),
    [filtered.length],
  );
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, close, go]);

  if (!tagged.length) return null;

  return (
    <section data-sky="golden" className="py-24 md:py-32">
      <div className="container-page">
        <div className="max-w-3xl mb-10">
          <span className="eyebrow">
            {t('diningPage.gallery.eyebrow')}
          </span>
          <h2 className="mt-4 font-display text-display-md">{t('diningPage.gallery.title')}</h2>
          <p className="mt-4 text-lede opacity-85">{t('diningPage.gallery.body')}</p>
        </div>

        {tabs.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {(['all', ...tabs] as const).map((tab) => {
              const isActive = active === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActive(tab)}
                  aria-pressed={isActive}
                  className={`h-11 rounded-full px-5 text-[0.95rem] font-medium transition-colors duration-500 ${
                    isActive ? 'bg-forest text-cream' : 'ring-1 ring-inset ring-forest/20 hover:bg-forest/5'
                  }`}
                >
                  {tab === 'all' ? t('rooms.filter.all') : t(`diningPage.gallery.filter.${tab}`)}
                </button>
              );
            })}
          </div>
        )}

        <motion.div layout className="columns-2 md:columns-3 lg:columns-4 gap-4 [column-fill:_balance]">
          <AnimatePresence>
            {visible.map((item, i) => (
              <motion.button
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: (i % PAGE) * 0.03 }}
                onClick={() => setOpen(i)}
                className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-pebble branded-img bg-sand-light"
                aria-label={item.caption ?? item.alt ?? `Open food image ${i + 1}`}
              >
                <Image
                  src={item.imageUrl}
                  alt={item.alt ?? item.caption ?? `KoSa food image ${i + 1}`}
                  width={item.width ?? 900}
                  height={item.height ?? 1200}
                  sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
                  wrapperClassName="block w-full"
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-night/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>

        {count < filtered.length && (
          <div className="mt-12">
            <button
              onClick={() => setCount((c) => c + PAGE)}
              className="inline-flex h-12 items-center gap-2 rounded-full px-6 font-semibold ring-1 ring-inset ring-forest/25 hover:bg-forest hover:text-cream transition-colors"
            >
              {t('gallery.loadMore')}
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {open !== null && filtered[open] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-8 bg-night/90 backdrop-blur-xl"
            onClick={close}
          >
            <div className="absolute top-0 inset-x-0 flex items-center justify-between p-5 text-cream/90">
              <span className="font-sans text-sm">
                {filtered[open].caption ?? ''} · {open + 1}/{filtered.length}
              </span>
              <button
                aria-label={t('a11y.close')}
                onClick={close}
                className="grid place-items-center h-10 w-10 rounded-full bg-cream/10 hover:bg-cream/20 border border-cream/20 backdrop-blur-md transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <button
              aria-label={t('a11y.previous')}
              className="absolute left-3 md:left-6 grid place-items-center h-12 w-12 rounded-full bg-cream/10 hover:bg-cream/20 border border-cream/20 backdrop-blur-md text-cream transition-colors"
              onClick={(e) => { e.stopPropagation(); go(-1); }}
            >
              <ChevronLeft size={26} />
            </button>

            <motion.div
              key={filtered[open].id}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="relative branded-img rounded-lg overflow-hidden shadow-2xl max-w-5xl w-full aspect-[4/3]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={filtered[open].imageUrl} alt={filtered[open].alt ?? ''} fill sizes="100vw" className="object-cover" />
            </motion.div>

            <button
              aria-label={t('a11y.next')}
              className="absolute right-3 md:right-6 grid place-items-center h-12 w-12 rounded-full bg-cream/10 hover:bg-cream/20 border border-cream/20 backdrop-blur-md text-cream transition-colors"
              onClick={(e) => { e.stopPropagation(); go(1); }}
            >
              <ChevronRight size={26} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
