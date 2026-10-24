import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/admin/auth';
import { menuItemInputSchema } from '@/lib/admin/schemas/dining';
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

  const parsed = menuItemInputSchema.safeParse(body);
  if (!parsed.success) return zodError(parsed.error);
  const data = parsed.data;

  try {
    const item = await prisma.menuItem.create({
      data: {
        sectionId: data.sectionId,
        name: data.name,
        description: data.description,
        price: data.price,
        currency: (data.currency || 'GHS').toUpperCase(),
        dietary: data.dietary,
        isFeatured: data.isFeatured,
        sortOrder: data.sortOrder,
        translations: sanitizeTranslations(data.translations),
      },
    });
    return ok({ item }, 201);
  } catch (e) {
    return serverError((e as Error).message);
  }
}
