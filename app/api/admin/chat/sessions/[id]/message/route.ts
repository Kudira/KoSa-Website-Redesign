import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/admin/auth';
import { badRequest, notFound, ok, serverError } from '@/lib/admin/response';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({ content: z.string().min(1).max(4000) });

interface Ctx { params: { id: string } }

export async function POST(req: NextRequest, { params }: Ctx) {
  const guard = await requireRole(['OWNER', 'EDITOR', 'SUPPORT']);
  if (guard instanceof NextResponse) return guard;

  let body: unknown;
  try { body = await req.json(); } catch { return badRequest('Invalid JSON'); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return badRequest('Validation failed');

  try {
    const session = await prisma.chatSession.findUnique({
      where: { id: params.id },
      select: { sessionId: true, agentId: true },
    });
    if (!session) return notFound();

    // Store agent message
    const message = await prisma.chatMessage.create({
      data: {
        sessionId: session.sessionId,
        role: 'ADMIN',
        content: parsed.data.content,
      },
    });

    // Touch lastMessageAt
    await prisma.chatSession.update({
      where: { id: params.id },
      data: { status: 'AGENT_ACTIVE' },
    });

    return ok({ message });
  } catch (e) {
    return serverError((e as Error).message);
  }
}
