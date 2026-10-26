// Loads admin edits (page content and the site-wide settings that shape every
// page) into the content store. Call `await loadContent()` before rendering.
// Kept for a few seconds per server instance so pages stay fast; a save in the
// admin clears it on that instance, and other instances pick it up within ~15s.

import 'server-only';
import { prisma } from '@/lib/prisma';
import { EMPTY_CONTENT, contentState, setContentState, type ContentData } from './store';

const TTL_MS = 15_000;
const KEYS = ['content', 'contact', 'seo', 'maintenance', 'integrations'] as const;

type G = { __kosaContentAt?: number; __kosaContentLoading?: Promise<void> | null; __kosaContent?: ContentData };
const g = globalThis as unknown as G;

export function invalidateContent() {
  g.__kosaContentAt = 0;
}

type Json = Record<string, unknown>;
const str = (v: unknown) => (typeof v === 'string' ? v : undefined);

export async function readContentRows(): Promise<ContentData> {
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: [...KEYS] } } });
  const by = Object.fromEntries(rows.map((r: { key: string; value: unknown }) => [r.key, (r.value ?? {}) as Json]));
  const content = (by.content ?? {}) as Partial<ContentData>;
  const integrations = (by.integrations ?? {}) as Json;
  const maintenance = (by.maintenance ?? {}) as Json;
  const contact = Object.fromEntries(
    Object.entries((by.contact ?? {}) as Json).filter(([, v]) => typeof v === 'string' && v.trim() !== ''),
  ) as Record<string, string>;
  return {
    texts: content.texts ?? {},
    values: content.values ?? {},
    contact,
    seo: (by.seo ?? {}) as ContentData['seo'],
    flags: {
      maintenance: { enabled: maintenance.enabled === true, message: str(maintenance.message) },
      chatEnabled: integrations.chatEnabled !== false,
      newsletterEnabled: integrations.newsletterEnabled !== false,
      googleAnalyticsId: str(integrations.googleAnalyticsId),
      googleTagManagerId: str(integrations.googleTagManagerId),
    },
  };
}

export async function loadContent(): Promise<ContentData> {
  if (g.__kosaContentAt && Date.now() - g.__kosaContentAt < TTL_MS) return contentState();
  if (!g.__kosaContentLoading) {
    g.__kosaContentLoading = readContentRows()
      .then((data) => {
        setContentState(data);
        g.__kosaContentAt = Date.now();
      })
      .catch((e) => {
        console.warn('[content] could not load admin edits:', (e as Error).message);
        if (!g.__kosaContent) setContentState(EMPTY_CONTENT);
        g.__kosaContentAt = Date.now() - TTL_MS + 3_000; // retry soon
      })
      .finally(() => {
        g.__kosaContentLoading = null;
      });
  }
  await g.__kosaContentLoading;
  return contentState();
}
