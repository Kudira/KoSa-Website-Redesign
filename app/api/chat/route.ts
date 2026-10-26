import { z } from 'zod';
import * as chrono from 'chrono-node';
import { prisma } from '@/lib/prisma';
import { getKnowledge, searchKnowledge, roomIndex, FALLBACK_CONTACT } from '@/lib/knowledge';
import { getAvailability, availabilityToPrompt } from '@/lib/cms/availability';
import { directBookingModes } from '@/lib/booking/direct';
import { bookingEngineUrl, cloudbedsConfigured, getStayRates, getTonight, isoDate, addDays, nightsBetween } from '@/lib/cloudbeds/client';
import { formatGhs } from '@/lib/pricing';
import { streamOpenRouter, type ChatMsg } from '@/lib/ai/openrouter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  message: z.string().min(1).max(4000),
  sessionId: z.string().min(4).max(80),
  guestEmail: z.string().email().optional(),
  reservationId: z.string().optional(),
});

const FALLBACK_KB = `KoSa Beach Resort, Beach Road No.1, Ampenyi, near Elmina, Ghana.
- Check-in from 2pm, check-out by 11am, 24-hour front desk.
- Fully cashless: Mobile Money, card on POS, Paystack links, bank transfer, QR.
- Restaurant 7am to 9pm daily; Kooki Beach Bar until 10pm.
- Live availability and booking: /book
- WhatsApp +233 24 437 5432, info@ko-sa.com.`;

const SYSTEM_BASE = `You are Abena, the digital concierge for KoSa Beach Resort in Ampenyi, near Elmina, Ghana. KoSa's line is "Life is better at the beach." Your tone is warm, calm and a little playful, never corporate: every reply should feel like an exhale.

RULES
- Answer only from RESORT KNOWLEDGE and LIVE ROOMS below. Never invent prices, policies, amenities, room names or links.
- Rooms: quote prices and availability only from LIVE ROOMS when it is present. If the guest has not given dates, ask for check-in and check-out dates and number of guests so you can check live availability. To book a room, share the booking link from LIVE ROOMS exactly as written, or send them to /book.
- Experiences, packages, spa treatments, retreats, add-ons, events, dining reservations, transfers and group stays are booked on WhatsApp. Share the matching WhatsApp link from RESORT KNOWLEDGE exactly as written (keep the [label](url) format). Never write your own WhatsApp link.
- KoSa is fully cashless. Never say cash is accepted.
- If you do not know something, say so kindly and share this link: ${FALLBACK_CONTACT}
- Reply in the guest's language. Keep simple answers to two or three short sentences; go longer only when planning a trip.
- When rooms are scarce (3 or fewer left) you may say so plainly to help the guest decide, but never pressure.`;

/** Find stay dates and guest counts in what the guest has written. */
function extractStay(texts: string[]) {
  const ref = new Date();
  const year = ref.getUTCFullYear();
  // Holiday words chrono does not know.
  let text = texts.join(' \n ')
    .replace(/\b(christmas|xmas|no[eë]l|navidad|kerst(?:mis)?|weihnachten)\b/gi, `24 December ${year}`)
    .replace(/\b(new year'?s?(?: eve)?|nouvel an|año nuevo|oud en nieuw|silvester)\b/gi, `31 December ${year}`);
  // "the 5th to the 8th of November" → "5 November to 8 November"
  text = text.replace(
    /(\d{1,2})(?:st|nd|rd|th)?\s*(?:to|until|till|-|–)\s*(?:the\s*)?(\d{1,2})(?:st|nd|rd|th)?\s*(?:of\s+)?(jan\w*|feb\w*|mar\w*|apr\w*|may|jun\w*|jul\w*|aug\w*|sep\w*|oct\w*|nov\w*|dec\w*)/gi,
    (_m, a, b, mon) => `${a} ${mon} to ${b} ${mon}`,
  );
  const results = chrono.parse(text, ref, { forwardDate: true });
  let checkIn: Date | undefined;
  let checkOut: Date | undefined;
  for (const r of results) {
    if (!checkIn) checkIn = r.start.date();
    if (r.end) checkOut = r.end.date();
    else if (checkIn && r.start.date() > checkIn) checkOut = r.start.date();
  }
  const nightsMatch = text.match(/(\d+)\s*(?:nights?|nuits?|noches?|nachten|nächte|晚)/i);
  if (checkIn && !checkOut && nightsMatch) checkOut = addDays(checkIn, Number(nightsMatch[1]));
  const adults = Number(text.match(/(\d+)\s*(?:adults?|people|persons?|guests?|of us|adultes?|personas?|personen|erwachsene)/i)?.[1] ?? 2);
  const children = Number(text.match(/(\d+)\s*(?:kids?|children|child|enfants?|niños?|kinderen|kinder)/i)?.[1] ?? 0);
  if (!checkIn) return null;
  if (!checkOut || checkOut <= checkIn) checkOut = addDays(checkIn, 1);
  const today = isoDate(new Date());
  const ci = isoDate(checkIn);
  if (ci < today) return null;
  return { checkIn: ci, checkOut: isoDate(checkOut), adults: Math.min(12, Math.max(1, adults)), children: Math.min(10, children), explicitOut: Boolean(results.some((r) => r.end) || nightsMatch) };
}

async function liveRoomsBlock(texts: string[]): Promise<string> {
  if (!cloudbedsConfigured()) {
    return availabilityToPrompt(await getAvailability()) + '\nFor live prices and booking, send guests to /book.';
  }
  const stay = extractStay(texts);
  if (stay) {
    const rates = await getStayRates(stay);
    const nights = nightsBetween(stay.checkIn, stay.checkOut);
    const m = directBookingModes();
    // With direct booking on, keep guests on the website: /book opens with their dates and they reserve there.
    const href = m.payNow || m.payLater
      ? `/book?${new URLSearchParams({ checkIn: stay.checkIn, checkOut: stay.checkOut, adults: String(stay.adults), children: String(stay.children) })}`
      : bookingEngineUrl(stay);
    const link = `[Book these dates](${href})`;
    const head = `LIVE ROOMS (from Cloudbeds) for ${stay.checkIn} to ${stay.checkOut}, ${nights} night${nights > 1 ? 's' : ''}, ${stay.adults} adult${stay.adults > 1 ? 's' : ''}${stay.children ? `, ${stay.children} child${stay.children > 1 ? 'ren' : ''}` : ''}${stay.explicitOut ? '' : ' (check-out assumed; confirm with the guest)'}:`;
    if (!rates.length) return `${head}\nNothing is available for these dates. Suggest moving a day either side or asking the team on WhatsApp.`;
    const lines = rates.map((r) => `- ${r.roomTypeName}: ${formatGhs(r.nightly)} a night, ${formatGhs(r.total)} total, ${r.roomsAvailable} left`).join('\n');
    return `${head}\n${lines}\nBooking link for these dates: ${link}`;
  }
  const tonight = await getTonight();
  if (!tonight.length) return 'LIVE ROOMS: tonight appears fully booked. Ask the guest for their dates so you can check.';
  return `LIVE ROOMS (from Cloudbeds) for tonight only:\n${tonight.map((r) => `- ${r.roomTypeName}: ${formatGhs(r.nightly)} a night, ${r.roomsAvailable} left`).join('\n')}\nThe guest has not given dates yet: ask for them before quoting a stay price.`;
}

function buildSystem(context: string, availability: string) {
  const today = new Date().toISOString().slice(0, 10);
  return `${SYSTEM_BASE}\n\nToday is ${today}.\n\n${availability}\n\nRESORT KNOWLEDGE:\n${context}`;
}

export async function POST(req: Request) {
  let parsed: z.infer<typeof schema>;
  try {
    parsed = schema.parse(await req.json());
  } catch {
    return new Response('Invalid request', { status: 400 });
  }
  const { message, sessionId, guestEmail, reservationId } = parsed;

  // Knowledge: confirmed facts, admin content and Cloudbeds, then the most relevant docs.
  const knowledge = await getKnowledge().catch(() => []);

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

  const recentUserText = [...history.filter((m) => m.role === 'user').slice(-2).map((m) => m.content), message];
  const docs = searchKnowledge(knowledge, recentUserText.join(' '), 6);
  const context = (docs.length ? docs.map((d) => `[${d.category}] ${d.title}\n${d.content}`).join('\n\n') : FALLBACK_KB) + `\n\nAll room types:\n${roomIndex(knowledge)}`;
  const availability = await liveRoomsBlock(recentUserText).catch(() => 'LIVE ROOMS: unavailable right now. Send guests to /book.');

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
