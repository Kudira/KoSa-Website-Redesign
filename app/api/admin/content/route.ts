// PUT /api/admin/content: save page edits from /admin/pages.
// Body: { locale, texts: { key: value|null }, values: { path: value|null } }
// An empty value or null removes the edit, so the built-in wording returns.

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/admin/auth';
import { SUPPORTED_LOCALES } from '@/lib/i18n/dictionaries';
import { isEditableKey, valueIsNumber } from '@/lib/content/fields';
import { invalidateContent } from '@/lib/content/load';
import type { ContentData } from '@/lib/content/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const body = z.object({
  locale: z.enum(SUPPORTED_LOCALES),
  texts: z.record(z.string().max(200), z.string().max(20000).nullable()).default({}),
  values: z.record(z.string().max(200), z.union([z.string().max(20000), z.number()]).nullable()).default({}),
});

export async function PUT(req: NextRequest) {
  const guard = await requireRole(['OWNER', 'EDITOR']);
  if (guard instanceof NextResponse) return guard;

  let data: z.infer<typeof body>;
  try {
    data = body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Those changes could not be read. Please try again.' }, { status: 400 });
  }

  const bad = [
    ...Object.keys(data.texts).filter((k) => !isEditableKey('text', k)),
    ...Object.keys(data.values).filter((k) => !isEditableKey('value', k)),
  ];
  if (bad.length) return NextResponse.json({ error: `Unknown field: ${bad[0]}` }, { status: 400 });

  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: 'content' } });
    const cur = ((row?.value ?? {}) as Partial<ContentData>) || {};
    const texts = { ...(cur.texts ?? {}) };
    const forLocale = { ...(texts[data.locale] ?? {}) };
    for (const [k, v] of Object.entries(data.texts)) {
      if (v === null || v.trim() === '') delete forLocale[k];
      else forLocale[k] = v;
    }
    texts[data.locale] = forLocale;

    const values = { ...(cur.values ?? {}) };
    for (const [k, v] of Object.entries(data.values)) {
      if (v === null || (typeof v === 'string' && v.trim() === '')) {
        delete values[k];
        continue;
      }
      if (valueIsNumber(k)) {
        const n = Number(v);
        if (!Number.isFinite(n) || n < 0) return NextResponse.json({ error: `Please enter a number for ${k.split('.').pop()}.` }, { status: 400 });
        values[k] = n;
      } else values[k] = String(v).trim();
    }

    const value = { texts, values };
    await prisma.siteSetting.upsert({
      where: { key: 'content' },
      create: { key: 'content', value, updatedBy: guard.user.id },
      update: { value, updatedBy: guard.user.id },
    });
    invalidateContent();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[content] save failed', (e as Error).message);
    return NextResponse.json({ error: 'Saving failed. Please try again.' }, { status: 500 });
  }
}
