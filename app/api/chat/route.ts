import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { searchKnowledge } from '@/lib/knowledge';
import { getAvailability, availabilityToPrompt } from '@/lib/cms/availability';
import { streamOpenRouter, type ChatMsg } from '@/lib/ai/openrouter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  message: z.string().min(1).max(4000),
  sessionId: z.string().min(4).max(80),
  guestEmail: z.string().email().optional(),
  reservationId: z.string().optional(),
});

const FALLBACK_KB = `KoSa Beach Resort Elmina, Ghana.
- Check-in 14:00, Check-out 11:00.
- Free WiFi, beachfront, pool, spa, restaurant.
- Rooms from GHS 980/night up to GHS 2,200/night.
- 9 room types, beachfront access.
- Distance from Accra airport (ACC): ~150km, 2.5hr drive. Resort shuttle available on request.
- Accepts GHS, USD, EUR, card, and Mobile Money (MTN MoMo, Vodafone Cash, AirtelTigo).
- Cancellation: free up to 48 hours before arrival.
- WhatsApp +233 24 437 5432 info@ko-sa.com.`;

const SYSTEM_BASE = `You are Abena, the warm and knowledgeable digital concierge for KoSa Beach Resort in Elmina, Ghana. You embody the resort's philosophy: "Simply, Belong." You are helpful, gracious, and culturally grounded. You speak in warm, unhurried language never robotic or corporate.

RULES:
- Only answer using the provided RESORT KNOWLEDGE context.
- If you don't know something, say warmly: "Let me connect you with our team who can help with that." Then a colleague will follow up.
- For booking requests: direct to /book on the website.
- Never invent prices, policies, or amenities.
- For room availability, rely ONLY on the CURRENT ROOM AVAILABILITY block. Never promise a room that is Occupied, and if the resort is fully booked, say so warmly and do not offer a room.
- Respond in the language the guest uses.
- Keep replies concise for simple questions; elaborate only for trip planning.`;

function buildSystem(context: string, availability: string) {
  return `${SYSTEM_BASE}\n\n${availability}\n\nRESORT KNOWLEDGE:\n${context}`;
}

export async function POST(req: Request) {
  let parsed: z.infer<typeof schema>;
  try {
    parsed = schema.parse(await req.json());
  } catch {
    return new Response('Invalid request', { status: 400 });
  }
  const { message, sessionId, guestEmail, reservationId } = parsed;

  // Retrieve context from in-memory knowledge base
  const docs = searchKnowledge(message, 5);
  const context = docs.length
    ? docs.map((d) => `[${d.category}] ${d.title}\n${d.content}`).join('\n\n')
    : FALLBACK_KB;

  // Live availability so the concierge is aware of bookings on every message.
  const availability = availabilityToPrompt(await getAvailability());

  // Persist user message + ensure session
  let agentIsActive = false;
  try {
    const upserted = await prisma.chatSession.upsert({
      where: { sessionId },
      create: { sessionId, guestEmail },
      update: { guestEmail, reservationId },
      select: { status: true },
    });
    agentIsActive = upserted.status === 'AGENT_ACTIVE';
    await prisma.chatMessage.create({
      data: { sessionId, role: 'USER', content: message },
    });
  } catch (e) {
    console.warn('[chat] DB skip:', (e as Error).message);
  }

  // When an agent has taken over, save the user message but do NOT call AI.
  // The agent will respond directly via the admin dashboard.
  if (agentIsActive) {
    return Response.json({ agentMode: true }, { status: 202 });
  }

  // Pull recent history for context
  let history: ChatMsg[] = [];
  try {
    const recent = await prisma.chatMessage.findMany({
      where: { sessionId, role: { in: ['USER', 'ASSISTANT'] } },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });
    history = recent
      .reverse()
      .slice(0, -1) // exclude the just-saved user message
      .map((m: { role: string; content: string }) => ({
        role: (m.role === 'USER' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.content,
      }));
  } catch {}

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    const reply =
      "I'm Abena our AI concierge isn't fully configured yet, but I can already help with the basics. " +
      `Here's what I know:\n\n${FALLBACK_KB}\n\n${availability}\n\nFor live booking, please visit /book or WhatsApp +233 24 437 5432.`;
    return streamPlain(reply, async (full) => {
      try {
        await prisma.chatMessage.create({
          data: { sessionId, role: 'ASSISTANT', content: full, flagged: true },
        });
      } catch {}
    });
  }

  const messages: ChatMsg[] = [
    { role: 'system', content: buildSystem(context, availability) },
    ...history,
    { role: 'user', content: message },
  ];

  const encoder = new TextEncoder();
  let full = '';

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const delta of streamOpenRouter({ messages, maxTokens: 1024, temperature: 0.7 })) {
          full += delta;
          controller.enqueue(encoder.encode(delta));
        }
      } catch (e) {
        console.error('[chat] OpenRouter error:', (e as Error).message);
        const friendly =
          full.length === 0
            ? "I'm having a small moment of trouble reaching the concierge brain. Please try again, or WhatsApp +233 24 437 5432."
            : '\n\n(Apologies I lost the thread for a moment.)';
        controller.enqueue(encoder.encode(friendly));
        full += friendly;
      } finally {
        controller.close();
        try {
          await prisma.chatMessage.create({
            data: {
              sessionId,
              role: 'ASSISTANT',
              content: full,
              sources: docs.map((d) => d.id),
            },
          });
        } catch {}
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
    },
  });
}

function streamPlain(text: string, onDone: (full: string) => Promise<void>) {
  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream({
      async start(c) {
        const words = text.split(/(\s+)/);
        for (const w of words) {
          c.enqueue(encoder.encode(w));
          await new Promise((r) => setTimeout(r, 20));
        }
        c.close();
        await onDone(text);
      },
    }),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
}
