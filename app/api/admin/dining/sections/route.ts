import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/admin/auth';
import { menuSectionInputSchema } from '@/lib/admin/schemas/dining';
import { sanitizeTranslations } from '@/lib/admin/i18n';
import { badRequest, ok, serverError, zodError } from '@/lib/admin/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const guard = await requireRole(['OWNER', 'EDITOR']);
  if (guard instanceof NextResponse) return guard;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest('Invalid JSON body');
  }

  const parsed = menuSectionInputSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);
  const data = parsed.data;

  try {
    const section = await prisma.menuSection.create({
      data: {
        venueId: data.venueId,
        name: data.name,
        description: data.description,
        sortOrder: data.sortOrder,
        translations: sanitizeTranslations(data.translations),
      },
    });
    return ok({ section }, 201);
  } catch (e) {
    return serverError((e as Error).message);
  }
}
