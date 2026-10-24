// Lightweight polling endpoint used by the ChatWidget to check for:
//  1. Whether an agent has taken over the session (agentMode + agentName)
//  2. Any new ADMIN or SYSTEM messages since `after` (ISO timestamp)
//
// Designed to be called every ~2.5 s while the widget is open.
// Stateless and cheap: one indexed DB read per call.

import { type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } },
) {
  const url = new URL(req.url);
  const after = url.searchParams.get('after');
  const afterDate = after ? new Date(after) : new Date(0);

  try {
    const session = await prisma.chatSession.findUnique({
      where: { sessionId: params.sessionId },
      select: {
        status: true,
        agentId: true,
        agentName: true,
        agentJoinedAt: true,
      },
    });

    if (!session) {
      return Response.json({ agentMode: false, messages: [] });
    }

    const agentMode = session.status === 'AGENT_ACTIVE';

    // Fetch ADMIN and SYSTEM messages newer than the cursor
    const messages = await prisma.chatMessage.findMany({
      where: {
        sessionId: params.sessionId,
        role: { in: ['ADMIN', 'SYSTEM'] },
        createdAt: { gt: afterDate },
      },
      orderBy: { createdAt: 'asc' },
      select: { id: true, role: true, content: true, createdAt: true },
    });

    return Response.json({
      agentMode,
      agentName: session.agentName ?? null,
      messages,
    });
  } catch {
    return Response.json({ agentMode: false, messages: [] });
  }
}
