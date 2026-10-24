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
    // Verify the session exists
    const existing = await prisma.chatSession.findUnique({
      where: { id: params.id },
      select: { id: true, sessionId: true, agentId: true, status: true },
    });
    if (!existing) return notFound();

    // Take over: mark agent fields, update status
    const session = await prisma.chatSession.update({
      where: { id: params.id },
      data: {
        agentId: user.id,
        agentName: user.name ?? user.email,
        agentJoinedAt: new Date(),
        status: 'AGENT_ACTIVE',
      },
    });

    // Insert a SYSTEM message so the customer knows a human has joined
    await prisma.chatMessage.create({
      data: {
        sessionId: existing.sessionId,
        role: 'SYSTEM',
        content: `__AGENT_JOIN__${user.name ?? user.email}`,
      },
    });

    return ok({ session, agentName: user.name ?? user.email });
  } catch (e) {
    return serverError((e as Error).message);
  }
}
