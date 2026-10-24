import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/admin/auth';
import { notFound, ok, serverError } from '@/lib/admin/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Ctx { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const guard = await requireRole(['OWNER', 'EDITOR', 'SUPPORT']);
  if (guard instanceof NextResponse) return guard;

  try {
    const session = await prisma.chatSession.findUnique({
      where: { id: params.id },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!session) return notFound();
    return ok({ session });
  } catch (e) {
    return serverError((e as Error).message);
  }
}
