'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { LOCALE_META, SUPPORTED_LOCALES, type Locale } from '@/lib/i18n/dictionaries';
import { Flag } from '@/components/shared/Flag';
import { cn } from '@/lib/utils';

interface Props {
  /** Visual treatment controls colors against the surrounding navbar surface */
  tone?: 'cream' | 'umber';
  /** Compact pill (default) vs full-width inline button (for mobile menus) */
  variant?: 'pill' | 'block';
  className?: string;
}

/**
 * Animated, accessible language switcher with a dropdown popup.
 *
 * Features:
 * - Spring-animated open/close
 * - Active locale highlight + check mark
 * - Click outside / Escape to close
 * - Full keyboard nav (ArrowUp/Down, Enter, Esc)
 * - Native language label + locale code badge
 * - aria-haspopup, aria-expanded, role="menu" / "menuitemradio"
 * - Honors prefers-reduced-motion (framer-motion does this automatically)
 */
export function LanguageSwitcher({ tone = 'cream', variant = 'pill', className }: Props) {
  const { t, locale, setLocale } = useT();
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<number>(
    Math.max(0, SUPPORTED_LOCALES.indexOf(locale)),
  );
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlighted((h) => (h + 1) % SUPPORTED_LOCALES.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlighted((h) => (h - 1 + SUPPORTED_LOCALES.length) % SUPPORTED_LOCALES.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        select(SUPPORTED_LOCALES[highlighted]);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setHighlighted(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setHighlighted(SUPPORTED_LOCALES.length - 1);
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, highlighted]);

  // Keep highlight aligned with the active locale when (re)opening
  useEffect(() => {
    if (open) {
      setHighlighted(Math.max(0, SUPPORTED_LOCALES.indexOf(locale)));
    }
  }, [open, locale]);

  function select(next: Locale) {
    setLocale(next);
    setOpen(false);
    buttonRef.current?.focus();
  }

  const meta = LOCALE_META[locale];

  const isCream = tone === 'cream';
  const triggerClasses = cn(
    'relative inline-flex items-center gap-2 font-sans text-[0.95rem] font-medium transition-colors',
    variant === 'pill'
      ? cn(
          'rounded-full h-11 px-4',
          isCream
            ? 'text-cream hover:bg-cream/10'
            : 'text-forest hover:bg-forest/5',
        )
      : cn(
          'w-full justify-between rounded-2xl px-4 py-3 border',
          isCream
            ? 'border-cream/15 text-cream/90 hover:bg-cream/10'
            : 'border-forest/20 text-forest hover:bg-forest/5',
        ),
    className,
  );

  return (
    <div ref={rootRef} className={cn('relative', variant === 'block' && 'w-full')}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('common.selectLanguage')}
        onClick={() => setOpen((v) => !v)}
        className={triggerClasses}
      >
        <Globe size={14} className="opacity-80" />
        <Flag country={meta.country} size={20} className="shadow-sm ring-1 ring-black/10" />
        <span className="font-medium">{meta.code}</span>
        <motion.span
          aria-hidden
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="inline-flex"
        >
          <ChevronDown size={14} className="opacity-70" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            key="lang-menu"
            role="listbox"
            aria-label={t('common.selectLanguage')}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className={cn(
              'absolute z-50 mt-2 min-w-[200px] origin-top rounded-pebble overflow-hidden border',
              'bg-cream/98 backdrop-blur-md border-umber/10 shadow-[0_20px_50px_-15px_rgba(26,26,26,0.3)]',
              variant === 'pill' ? 'right-0' : 'right-0 left-0',
            )}
          >
            {/* Decorative gold sliver */}
            <span aria-hidden className="block h-[2px] w-full bg-gradient-to-r from-transparent via-primary to-transparent" />

            {SUPPORTED_LOCALES.map((code, idx) => {
              const m = LOCALE_META[code];
              const active = locale === code;
              const isHighlighted = idx === highlighted;
              return (
                <li key={code} role="none">
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setHighlighted(idx)}
                    onClick={() => select(code)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                      'focus:outline-none',
                      isHighlighted ? 'bg-primary/12' : 'bg-transparent',
                      active ? 'text-forest' : 'text-forest/85 hover:text-forest',
                    )}
                  >
                    <Flag country={m.country} size={26} className="shadow-sm ring-1 ring-black/10 shrink-0" />
                    <span className="flex-1 flex flex-col">
                      <span className="font-display text-base leading-tight">{m.native}</span>
                      <span className="font-sans text-sm text-forest/55">
                        {m.label} · {m.code}
                      </span>
                    </span>
                    {active ? (
                      <motion.span
                        layoutId="lang-active-check"
                        className="text-primary"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      >
                        <Check size={16} strokeWidth={3} />
                      </motion.span>
                    ) : (
                      <span className="w-4" aria-hidden />
                    )}
                  </button>
                </li>
              );
            })}

            <div className="px-4 pt-1 pb-3 border-t border-umber/8">
              <p className="font-sans text-sm text-forest/45">
                {t('common.selectLanguage')}
              </p>
            </div>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
