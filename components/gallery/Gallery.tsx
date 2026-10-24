'use client';

import { SmoothImage as Image } from '@/components/shared/SmoothImage';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { useT } from '@/lib/i18n';
import type { PublicGalleryItem } from '@/lib/cms/types';

const PAGE = 12;

// Friendly labels for the category chips (fallback to the raw key, title-cased).
const LABELS: Record<string, string> = {
  beach: 'Beach & Shore',
  resort: 'The Resort',
  rooms: 'Rooms',
  dining: 'Food & Drinks',
  wellness: 'Wellness',
  culture: 'Culture',
  events: 'Events',
};

function label(cat: string): string {
  return LABELS[cat] ?? cat.replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}

export function Gallery({ items: rawItems = [] }: { items?: PublicGalleryItem[] }) {
  const { t } = useT();
  const [open, setOpen] = useState<number | null>(null);
  const [zoom, setZoom] = useState(false);
  const [count, setCount] = useState(PAGE);
  const [active, setActive] = useState<string>('all');

  // Rooms have their own dedicated page, so they are intentionally excluded
  // from the gallery (and from its category filter).
  const items = useMemo(
    () => rawItems.filter((i) => (i.category ?? 'other') !== 'rooms'),
    [rawItems],
  );

  // Categories present in the data, in first-seen order.
  const categories = useMemo(() => {
    const seen: string[] = [];
    for (const it of items) {
      const c = it.category ?? 'other';
      if (!seen.includes(c)) seen.push(c);
    }
    return seen;
  }, [items]);

  const filtered = useMemo(
    () => (active === 'all' ? items : items.filter((i) => (i.category ?? 'other') === active)),
    [items, active],
  );

  const visible = filtered.slice(0, count);

  // Reset paging when the filter changes.
  useEffect(() => setCount(PAGE), [active]);

  const close = useCallback(() => {
    setOpen(null);
    setZoom(false);
  }, []);
  const go = useCallback(
    (dir: number) => {
      setZoom(false);
      setOpen((i) => (i === null ? null : (i + dir + filtered.length) % filtered.length));
    },
    [filtered.length],
  );

  // Keyboard navigation in the lightbox.
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

  return (
    <section data-sky="noon" className="relative py-16 md:py-24">
      <div className="container-page">
        {/* Category filter chips */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-10">
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
                  {cat === 'all' ? t('rooms.filter.all') : label(cat)}
                </button>
              );
            })}
          </div>
        )}

        {visible.length === 0 ? (
          <p className="py-16 font-display text-3xl opacity-70">{t('gallery.empty')}</p>
        ) : (
          <motion.div layout className="columns-2 md:columns-3 lg:columns-4 gap-4 md:gap-6 [column-fill:_balance]">
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
                  className="group relative mb-4 md:mb-6 block w-full break-inside-avoid overflow-hidden rounded-pebble branded-img bg-sand-light"
                  aria-label={item.caption ?? item.alt ?? `Open image ${i + 1}`}
                >
                  <Image
                    src={item.imageUrl}
                    alt={item.alt ?? item.caption ?? `KoSa gallery image ${i + 1}`}
                    width={item.width ?? 900}
                    height={item.height ?? 1200}
                    sizes="(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
                    wrapperClassName="block w-full"
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-night/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {item.caption && (
                    <span className="absolute bottom-3 left-3 right-3 text-left font-sans text-sm text-cream opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                      {item.caption}
                    </span>
                  )}
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {count < filtered.length && (
          <div className="mt-12">
            <Button onClick={() => setCount((c) => c + PAGE)} variant="gold-outline">
              {t('gallery.loadMore')}
            </Button>
          </div>
        )}
      </div>

      {/* Liquid-glass lightbox */}
      <AnimatePresence>
        {open !== null && filtered[open] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-8 bg-night/90 backdrop-blur-xl"
            onClick={close}
          >
            {/* Top bar */}
            <div className="absolute top-0 inset-x-0 flex items-center justify-between p-5 text-cream/90">
              <span className="font-sans text-xs">
                {filtered[open].caption ?? ''} · {open + 1}/{filtered.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  aria-label={zoom ? t('a11y.close') : 'Zoom'}
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoom((z) => !z);
                  }}
                  className="grid place-items-center h-10 w-10 rounded-full bg-cream/10 hover:bg-cream/20 border border-cream/20 backdrop-blur-md transition-colors"
                >
                  {zoom ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
                </button>
                <button
                  aria-label={t('a11y.close')}
                  onClick={close}
                  className="grid place-items-center h-10 w-10 rounded-full bg-cream/10 hover:bg-cream/20 border border-cream/20 backdrop-blur-md transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <button
              aria-label={t('a11y.previous')}
              className="absolute left-3 md:left-6 grid place-items-center h-12 w-12 rounded-full bg-cream/10 hover:bg-cream/20 border border-cream/20 backdrop-blur-md text-cream transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
            >
              <ChevronLeft size={26} />
            </button>

            <motion.div
              key={filtered[open].id}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className={`relative branded-img rounded-pebble overflow-hidden shadow-2xl ${
                zoom ? 'w-[92vw] h-[86vh] cursor-zoom-out' : 'max-w-5xl w-full aspect-[4/3] cursor-zoom-in'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setZoom((z) => !z);
              }}
            >
              <Image
                src={filtered[open].imageUrl}
                alt={filtered[open].alt ?? ''}
                fill
                sizes="100vw"
                className={zoom ? 'object-contain' : 'object-cover'}
              />
            </motion.div>

            <button
              aria-label={t('a11y.next')}
              className="absolute right-3 md:right-6 grid place-items-center h-12 w-12 rounded-full bg-cream/10 hover:bg-cream/20 border border-cream/20 backdrop-blur-md text-cream transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
            >
              <ChevronRight size={26} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
