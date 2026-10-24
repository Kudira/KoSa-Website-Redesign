// Server-side i18n helper for React Server Components and route handlers.
// Reads the locale cookie set by the client provider and returns a `t()` function.
// Pair with the client `useT()` for hybrid SSR/CSR rendering.

import { cookies } from 'next/headers';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  SUPPORTED_LOCALES,
  translate,
  type DictKey,
  type Locale,
} from './dictionaries';

export function getServerLocale(): Locale {
  try {
    const c = cookies().get(LOCALE_COOKIE)?.value;
    if (c && (SUPPORTED_LOCALES as readonly string[]).includes(c)) {
      return c as Locale;
    }
  } catch {
    // cookies() throws when called outside a request scope; fall through.
  }
  return DEFAULT_LOCALE;
}

/**
 * Returns `{ t, locale }` for use in Server Components.
 * Example:
 *   const { t } = getT();
 *   return <h1>{t('rooms.headline')}</h1>;
 */
export function getT() {
  const locale = getServerLocale();
  const t = (key: DictKey) => translate(locale, key);
  return { t, locale };
}
