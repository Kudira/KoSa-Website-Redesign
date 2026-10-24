// GET /api/admin/settings return all known settings (zero-filled defaults)

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/admin/auth';
import { settingsKeySchemas, type SettingsKey } from '@/lib/admin/schemas/settings';
import { ok, serverError } from '@/lib/admin/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const guard = await requireRole(['OWNER', 'EDITOR', 'SUPPORT']);
  if (guard instanceof NextResponse) return guard;

  try {
    const rows = await prisma.siteSetting.findMany();
    const byKey = Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(settingsKeySchemas) as SettingsKey[]) {
      out[key] = byKey[key] ?? {};
    }
    return ok({ settings: out });
  } catch (e) {
    return serverError((e as Error).message);
  }
}
