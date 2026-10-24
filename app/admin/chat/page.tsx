import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { LiveChat } from './LiveChat';

export const metadata: Metadata = { title: 'Live Chat · Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function ChatPage() {
  const sessions = await prisma.chatSession.findMany({
    orderBy: { lastMessageAt: 'desc' },
    take: 100,
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { content: true, role: true, createdAt: true },
      },
      _count: { select: { messages: true } },
    },
  });

  // Serialize Prisma Date fields to ISO strings for the client component
  const serialized = sessions.map((s) => ({
    ...s,
    lastMessageAt: s.lastMessageAt.toISOString(),
    agentJoinedAt: s.agentJoinedAt?.toISOString() ?? null,
    createdAt: s.createdAt.toISOString(),
    resolvedAt: s.resolvedAt?.toISOString() ?? null,
    messages: s.messages.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    })),
  }));

  return <LiveChat initialSessions={serialized as Parameters<typeof LiveChat>[0]['initialSessions']} />;
}
