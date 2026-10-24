import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/admin/auth';
import { notFound, ok, serverError } from '@/lib/admin/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Ctx { params: { id: string } }

export async function POST(_req: NextRequest, { params }: Ctx) {
  const guard = await requireRole(['OWNER', 'EDITOR', 'SUPPORT']);
  if (guard instanceof NextResponse) return guard;
  const { user } = guard;

  try {
    const existing = await prisma.chatSession.findUnique({
      where: { id: params.id },
      select: { id: true, sessionId: true },
    });
    if (!existing) return notFound();

    // Release: clear agent fields, revert to ACTIVE so AI resumes
    const session = await prisma.chatSession.update({
      where: { id: params.id },
      data: {
        agentId: null,
        agentName: null,
        agentJoinedAt: null,
        status: 'ACTIVE',
      },
    });

    // System message so customer knows AI has resumed
    await prisma.chatMessage.create({
      data: {
        sessionId: existing.sessionId,
        role: 'SYSTEM',
        content: `__AGENT_LEAVE__${user.name ?? user.email}`,
      },
    });

    return ok({ session });
  } catch (e) {
    return serverError((e as Error).message);
  }
}
