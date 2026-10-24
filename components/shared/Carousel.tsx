'use client';

// Calm image carousel with a liquid-glass lightbox.
//
// - Crossfade/slide between slides with gentle easing.
// - Optional autoplay that pauses on hover/focus and while the lightbox is open.
// - Glass nav arrows + dots; swipe on touch.
// - Click any slide to "pop" it into a full-screen glass viewer with zoom and
//   keyboard / arrow navigation.
//
// Drop-in for any image set. Falls back to a single still when one image.

import { SmoothImage as Image } from '@/components/shared/SmoothImage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  images: string[];
  alt?: string;
  /** aspect ratio for the inline carousel, e.g. "aspect-[4/3]" */
  aspect?: string;
  className?: string;
  rounded?: string;
  sizes?: string;
  autoplay?: boolean;
  intervalMs?: number;
  /** show the little dot indicators */
  dots?: boolean;
  /** enable click-to-open lightbox */
  lightbox?: boolean;
  priority?: boolean;
};

export function Carousel({
  images,
  alt = '',
  aspect = 'aspect-[4/3]',
  className,
  rounded = 'rounded-lg',
  sizes = '(min-width:1024px) 50vw, 100vw',
  autoplay = false,
  intervalMs = 5200,
  dots = true,
  lightbox = true,
  priority = false,
}: Props) {
  const slides = images.filter(Boolean);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [hovering, setHovering] = useState(false);
  const n = slides.length;

  const goTo = useCallback(
    (next: number, d: number) => {
      setDir(d);
      setIndex(((next % n) + n) % n);
    },
    [n],
  );
  const next = useCallback(() => goTo(index + 1, 1), [index, goTo]);
  const prev = useCallback(() => goTo(index - 1, -1), [index, goTo]);

  // Autoplay (paused on hover and while the lightbox is open).
  useEffect(() => {
    if (!autoplay || n < 2 || hovering || open) return;
    const id = setInterval(next, intervalMs);
    return () => clearInterval(id);
  }, [autoplay, n, hovering, open, next, intervalMs]);

  // Lightbox keyboard + scroll lock.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setZoom(false);
      } else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, next, prev]);

  if (n === 0) return null;

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60) next();
    else if (info.offset.x > 60) prev();
  };

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d * 40, scale: 1.01 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (d: number) => ({ opacity: 0, x: d * -40, scale: 1.01 }),
  };

  return (
    <>
      <div
        className={cn('relative overflow-hidden branded-img group', aspect, rounded, className)}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <AnimatePresence custom={dir} initial={false} mode="popLayout">
          <motion.div
            key={index}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            drag={n > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={onDragEnd}
            className={cn('absolute inset-0', lightbox && 'cursor-zoom-in')}
            onClick={() => lightbox && setOpen(true)}
          >
            <Image
              src={slides[index]}
              alt={alt}
              fill
              priority={priority && index === 0}
              sizes={sizes}
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {n > 1 && (
          <>
            <GlassArrow side="left" onClick={(e) => { e.stopPropagation(); prev(); }} />
            <GlassArrow side="right" onClick={(e) => { e.stopPropagation(); next(); }} />
            {dots && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Go to image ${i + 1}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      goTo(i, i > index ? 1 : -1);
                    }}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300 backdrop-blur-md',
                      i === index ? 'w-6 bg-cream' : 'w-1.5 bg-cream/50 hover:bg-cream/80',
                    )}
                  />
                ))}
              </div>
            )}
            <span className="absolute top-3 right-3 z-10 font-sans text-xs font-medium text-cream bg-night/40 backdrop-blur-md rounded-full px-2.5 py-1 border border-cream/15">
              {index + 1}/{n}
            </span>
          </>
        )}
      </div>

      {/* Liquid-glass lightbox */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 md:p-8 bg-night/90 backdrop-blur-xl"
            onClick={() => {
              setOpen(false);
              setZoom(false);
            }}
          >
            <div className="absolute top-0 inset-x-0 flex items-center justify-between p-5 text-cream/90">
              <span className="font-sans text-sm">
                {alt} · {index + 1}/{n}
              </span>
              <div className="flex items-center gap-2">
                <GlassButton onClick={(e) => { e.stopPropagation(); setZoom((z) => !z); }} label="Zoom">
                  {zoom ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
                </GlassButton>
                <GlassButton onClick={() => { setOpen(false); setZoom(false); }} label="Close">
                  <X size={18} />
                </GlassButton>
              </div>
            </div>

            {n > 1 && (
              <button
                aria-label="Previous"
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 md:left-6 grid place-items-center h-12 w-12 rounded-full bg-cream/10 hover:bg-cream/20 border border-cream/20 backdrop-blur-md text-cream transition-colors"
              >
                <ChevronLeft size={26} />
              </button>
            )}

            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'relative branded-img rounded-pebble overflow-hidden shadow-2xl',
                zoom ? 'w-[92vw] h-[86vh] cursor-zoom-out' : 'max-w-5xl w-full aspect-[4/3] cursor-zoom-in',
              )}
              onClick={(e) => { e.stopPropagation(); setZoom((z) => !z); }}
            >
              <Image src={slides[index]} alt={alt} fill sizes="100vw" className={zoom ? 'object-contain' : 'object-cover'} />
            </motion.div>

            {n > 1 && (
              <button
                aria-label="Next"
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 md:right-6 grid place-items-center h-12 w-12 rounded-full bg-cream/10 hover:bg-cream/20 border border-cream/20 backdrop-blur-md text-cream transition-colors"
              >
                <ChevronRight size={26} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function GlassArrow({ side, onClick }: { side: 'left' | 'right'; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      aria-label={side === 'left' ? 'Previous' : 'Next'}
      onClick={onClick}
      className={cn(
        'absolute top-1/2 -translate-y-1/2 z-10 grid place-items-center h-10 w-10 rounded-full',
        'bg-cream/15 hover:bg-cream/30 border border-cream/25 backdrop-blur-md text-cream',
        'opacity-0 group-hover:opacity-100 transition-all duration-300',
        side === 'left' ? 'left-3' : 'right-3',
      )}
    >
      {side === 'left' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
    </button>
  );
}

function GlassButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="grid place-items-center h-10 w-10 rounded-full bg-cream/10 hover:bg-cream/20 border border-cream/20 backdrop-blur-md text-cream transition-colors"
    >
      {children}
    </button>
  );
}
