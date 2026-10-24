// GET    /api/admin/settings/[key] fetch a single settings section
// PUT    /api/admin/settings/[key] upsert the section
// Each `key` has its own zod schema (see lib/admin/schemas/settings.ts).

import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/admin/auth';
import { settingsKeySchemas, isSettingsKey } from '@/lib/admin/schemas/settings';
import { badRequest, notFound, ok, serverError, zodError } from '@/lib/admin/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Ctx {
  params: { key: string };
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const guard = await requireRole(['OWNER', 'EDITOR', 'SUPPORT']);
  if (guard instanceof NextResponse) return guard;

  if (!isSettingsKey(params.key)) return notFound('Unknown settings key');

  const row = await prisma.siteSetting.findUnique({ where: { key: params.key } });
  return ok({ key: params.key, value: row?.value ?? {} });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const guard = await requireRole(['OWNER', 'EDITOR']);
  if (guard instanceof NextResponse) return guard;

  if (!isSettingsKey(params.key)) return notFound('Unknown settings key');

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest('Invalid JSON body');
  }

  const schema = settingsKeySchemas[params.key];
  const parsed = schema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);

  try {
    const row = await prisma.siteSetting.upsert({
      where: { key: params.key },
      create: {
        key: params.key,
        value: parsed.data as unknown as object,
        updatedBy: guard.user.id,
      },
      update: {
        value: parsed.data as unknown as object,
        updatedBy: guard.user.id,
      },
    });
    return ok({ key: row.key, value: row.value });
  } catch (e) {
    return serverError((e as Error).message);
  }
}
