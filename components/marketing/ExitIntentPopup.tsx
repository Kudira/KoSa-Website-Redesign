'use client';

// Exit-intent newsletter popup. Triggers once per session when the user moves
// their cursor toward the browser chrome (desktop) or on backward swipe
// (mobile). Submits to /api/newsletter and gracefully handles errors. Per the
// content brief §02 → Global Elements.

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { prose } from '@/lib/content/media';
import { useT } from '@/lib/i18n';

const STORAGE_KEY = 'kosa_exit_popup_seen';

export function ExitIntentPopup() {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      /* sessionStorage blocked fall through and still trigger once */
    }

    let armedAt = Date.now();
    const minDelayMs = 8000; // don't fire until the visitor has had a moment

    const onMouseLeave = (e: MouseEvent) => {
      if (Date.now() - armedAt < minDelayMs) return;
      if (e.clientY <= 0) trigger();
    };

    let lastY = window.scrollY;
    const onScroll = () => {
      if (Date.now() - armedAt < minDelayMs) return;
      const y = window.scrollY;
      // Mobile heuristic: a long upward swipe near the top of a long page.
      if (y < 120 && lastY - y > 80) trigger();
      lastY = y;
    };

    function trigger() {
      setOpen(true);
      try {
        sessionStorage.setItem(STORAGE_KEY, '1');
      } catch {
        /* ignore */
      }
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('scroll', onScroll);
    }

    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      setError(t('emailCapture.invalid'));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, source: 'exit-intent' }),
      });
      if (!res.ok) throw new Error(t('emailCapture.error'));
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="false"
          aria-labelledby="exit-popup-headline"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed z-[60] bottom-24 inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[min(560px,calc(100vw-2rem))] rounded-pebble bg-teal-600 text-cream p-7 md:p-8 shadow-[0_30px_80px_-30px_rgba(0,31,39,0.7)] overflow-hidden"
        >
          <button
            type="button"
            aria-label={t('a11y.close')}
            className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full text-cream/70 hover:bg-cream/10 hover:text-cream transition-colors"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>

          {done ? (
            <div className="py-2 pr-10">
              <p className="font-display text-3xl">{prose(t('exit.thanks'))}</p>
              <p className="mt-2 text-cream/80">{prose(t('home.email.body'))}</p>
            </div>
          ) : (
            <>
              <h2 id="exit-popup-headline" className="font-display text-3xl md:text-[2.25rem] leading-tight pr-10">
                {t('exit.headline')}
              </h2>
              <p className="mt-3 text-cream/80 leading-relaxed">{prose(t('exit.body'))}</p>

              <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
                <label className="sr-only" htmlFor="exit-email">{t('newsletter.ariaEmail')}</label>
                <input
                  id="exit-email"
                  type="email"
                  required
                  placeholder={t('exit.placeholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 flex-1 rounded-full bg-cream/10 px-5 text-cream placeholder:text-cream/50 ring-1 ring-inset ring-cream/25 focus:ring-sunshine focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-12 rounded-full bg-sunshine px-6 font-semibold text-forest-900 hover:bg-cream transition-colors disabled:opacity-50"
                >
                  {submitting ? '…' : t('exit.cta')}
                </button>
              </form>
              {error && (
                <p role="alert" className="mt-3 text-sm text-sunshine-100">
                  {error}
                </p>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-4 text-sm text-cream/60 hover:text-cream underline-offset-4 hover:underline"
              >
                {t('exit.dismiss')}
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
