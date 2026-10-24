'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { DEFAULT_LOCALE, LOCALE_COOKIE, SUPPORTED_LOCALES, type Locale, type DictKey, translate } from './dictionaries';

// ─── Cookie helpers ──────────────────────────────────────────────────────────

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : null;
}

function writeCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return;
  const exp = new Date(Date.now() + days * 86400 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${exp}; path=/; SameSite=Lax`;
}

function getInitialLocale(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;
  const cookie = readCookie(LOCALE_COOKIE);
  if (cookie && (SUPPORTED_LOCALES as readonly string[]).includes(cookie)) {
    return cookie as Locale;
  }
  const nav = navigator.language?.toLowerCase().slice(0, 2);
  if (nav && (SUPPORTED_LOCALES as readonly string[]).includes(nav)) {
    return nav as Locale;
  }
  return DEFAULT_LOCALE;
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
});

/**
 * Wrap the app with this provider (once in layout) so every `useT()` shares
 * a single reactive locale. Changing language updates all consumers instantly.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocaleState(getInitialLocale());
  }, []);

  const setLocale = useCallback(
    (next: Locale) => {
      writeCookie(LOCALE_COOKIE, next);
      setLocaleState(next);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = next;
      }
      // Server components read the locale from the cookie at request time.
      // A soft refresh re-renders them with the new cookie so the whole page
      // (not just client components) updates instantly, no full reload.
      router.refresh();
    },
    [router],
  );

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * Client-side i18n hook. All consumers share a single locale from LocaleProvider.
 * Returns `t()` translator, current `locale`, and `setLocale()`.
 */
export function useT() {
  const { locale, setLocale } = useContext(LocaleContext);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'en' ? 'fr' : 'en');
  }, [locale, setLocale]);

  const t = useCallback((key: DictKey) => translate(locale, key), [locale]);

  return { t, locale, setLocale, toggleLocale };
}

export type { Locale, DictKey };
export { SUPPORTED_LOCALES, DEFAULT_LOCALE };
