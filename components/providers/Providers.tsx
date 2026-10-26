'use client';

import type { ReactNode } from 'react';
import { LocaleProvider } from '@/lib/i18n';
import { setContentState, type ContentData } from '@/lib/content/store';

export function Providers({ children, content }: { children: ReactNode; content?: ContentData }) {
  // Admin edits from /admin/pages and Settings, read by translate(), media and site.contact.
  if (content) setContentState(content);
  return <LocaleProvider>{children}</LocaleProvider>;
}
