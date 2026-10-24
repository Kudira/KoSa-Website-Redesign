// Server-Sent Events stream for the admin live-chat dashboard.
//
// Design: DB-backed polling every 2 s keeps this serverless-compatible
// (no in-memory pub/sub that would break across Vercel instances).
// EventSource on the client auto-reconnects if the 30-second Vercel
// function timeout is reached; the `lastEventId` header carries the
// cursor so we never replay messages.

import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/admin/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const POLL_MS = 2000;
const KEEPALIVE_MS = 15000;

function enc(event: string, data: unknown, id?: string): string {
  const idLine = id ? `id: ${id}\n` : '';
  return `${idLine}event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(req: NextRequest) {
  const guard = await requireRole(['OWNER', 'EDITOR', 'SUPPORT']);
  if (guard instanceof NextResponse) return guard;

  // Last cursor: ISO string sent by the client via Last-Event-ID header
  const rawCursor = req.headers.get('last-event-id');
  let cursor: Date = rawCursor ? new Date(rawCursor) : new Date(Date.now() - 30_000);

  const encoder = new TextEncoder();
  let closed = false;
  req.signal.addEventListener('abort', () => { closed = true; });

  const stream = new ReadableStream({
    async start(controller) {
      const write = (chunk: string) => {
        if (!closed) controller.enqueue(encoder.encode(chunk));
      };

      // --- Initial snapshot: all sessions, most recent first ---
      try {
        const sessions = await prisma.chatSession.findMany({
          orderBy: { lastMessageAt: 'desc' },
          take: 80,
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { content: true, role: true, createdAt: true },
            },
            _count: { select: { messages: true } },
          },
        });
        write(enc('snapshot', { sessions }, new Date().toISOString()));
      } catch { /* non-fatal */ }

      let lastKeepalive = Date.now();

      // --- Polling loop ---
      while (!closed) {
        await new Promise<void>((r) => setTimeout(r, POLL_MS));
        if (closed) break;

        try {
          const now = new Date();

          // Sessions updated since cursor
          const updatedSessions = await prisma.chatSession.findMany({
            where: { lastMessageAt: { gt: cursor } },
            orderBy: { lastMessageAt: 'desc' },
            include: {
              messages: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: { content: true, role: true, createdAt: true },
              },
              _count: { select: { messages: true } },
            },
          });

          // New messages since cursor (for open session panels)
          const newMessages = await prisma.chatMessage.findMany({
            where: { createdAt: { gt: cursor } },
            orderBy: { createdAt: 'asc' },
            take: 50,
          });

          cursor = now;

          if (updatedSessions.length > 0) {
            write(enc('sessions', { sessions: updatedSessions }, now.toISOString()));
          }
          if (newMessages.length > 0) {
            write(enc('messages', { messages: newMessages }, now.toISOString()));
          }

          // Keep-alive comment every 15 s to prevent proxy timeout
          if (Date.now() - lastKeepalive > KEEPALIVE_MS) {
            write(': keepalive\n\n');
            lastKeepalive = Date.now();
          }
        } catch {
          // Transient DB error - keep the connection alive
        }
      }

      try { controller.close(); } catch { /* already closed */ }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
      'Connection': 'keep-alive',
    },
  });
}
