import { z } from 'zod';
import * as chrono from 'chrono-node';
import { prisma } from '@/lib/prisma';
import { getKnowledge, searchKnowledgeScored, FALLBACK_CONTACT } from '@/lib/knowledge';
import { directBookingModes } from '@/lib/booking/direct';
import { bookingEngineUrl, cloudbedsConfigured, getStayRates, getTonight, isoDate, addDays, nightsBetween } from '@/lib/cloudbeds/client';
import { formatGhs } from '@/lib/pricing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  message: z.string().min(1).max(4000),
  sessionId: z.string().min(4).max(80),
  guestEmail: z.string().email().optional(),
  reservationId: z.string().optional(),
});

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

const BOOKING_WORDS = /\b(room|rooms|suite|book|booking|reserve|reservation|available|availability|vacancy|price|prices|rate|rates|cost|night|nights|stay)\b/i;
const GREETING = /^\s*(hi|hello|hey|hiya|good (morning|afternoon|evening)|akwaaba|hola|bonjour|hallo|你好)\b[\s!.?]*$/i;
const THANKS = /^\s*(thanks|thank you|thx|ty|medaase|merci|gracias|danke)\b/i;

const WA_LINK = FALLBACK_CONTACT;

/** Rooms and prices, read live from Cloudbeds. Returns null when Cloudbeds can't be reached. */
async function roomsReply(texts: string[]): Promise<string | null> {
  if (!cloudbedsConfigured()) return null;
  const stay = extractStay(texts);
  if (stay) {
    const rates = await getStayRates(stay);
    const nights = nightsBetween(stay.checkIn, stay.checkOut);
    const who = `${stay.adults} adult${stay.adults > 1 ? 's' : ''}${stay.children ? `, ${stay.children} child${stay.children > 1 ? 'ren' : ''}` : ''}`;
    const when = `${stay.checkIn} to ${stay.checkOut} (${nights} night${nights > 1 ? 's' : ''}, ${who})`;
    const m = directBookingModes();
    const href = m.payNow || m.payLater
      ? `/book?${new URLSearchParams({ checkIn: stay.checkIn, checkOut: stay.checkOut, adults: String(stay.adults), children: String(stay.children) })}`
      : bookingEngineUrl(stay);
    if (!rates.length) return `Nothing is available for ${when}. Try moving a day either side, or ${WA_LINK} and the team will help.`;
    const lines = rates.map((r) => `- ${r.roomTypeName}: ${formatGhs(r.nightly)} a night, ${formatGhs(r.total)} total (${r.roomsAvailable} left)`).join('\n');
    const assumed = stay.explicitOut ? '' : '\nI assumed one night. Tell me your check-out date if that is not right.';
    return `Here is what is free for ${when}:\n${lines}${assumed}\n\n[Book these dates](${href}). A 30% deposit confirms the booking.`;
  }
  const tonight = await getTonight();
  const intro = 'Tell me your check-in and check-out dates and how many guests, and I will check live prices. ';
  if (!tonight.length) return `${intro}Tonight looks fully booked, but other dates may be open.`;
  return `${intro}For tonight:\n${tonight.map((r) => `- ${r.roomTypeName}: ${formatGhs(r.nightly)} a night (${r.roomsAvailable} left)`).join('\n')}`;
}

const WELCOME = `Akwaaba! I'm Abena. I can tell you about our rooms and live prices, dining, the spa, experiences, getting here, check-in, payments and more. Try "rooms for 5 to 8 November, 2 adults", or ask me anything about KoSa.`;

/** Abena answers only from KoSa's own information and live Cloudbeds rooms. No AI model is involved. */
async function answer(message: string, recentUserText: string[]): Promise<{ text: string; ids: string[]; flagged: boolean }> {
  if (GREETING.test(message)) return { text: WELCOME, ids: [], flagged: false };
  if (THANKS.test(message)) return { text: 'You are most welcome. Life is better at the beach.', ids: [], flagged: false };

  const wantsRooms = BOOKING_WORDS.test(message) || Boolean(extractStay([message]));
  if (wantsRooms) {
    const live = await roomsReply(recentUserText).catch(() => null);
    if (live) return { text: live, ids: ['cloudbeds'], flagged: false };
  }

  const knowledge = await getKnowledge().catch(() => []);
  const hits = searchKnowledgeScored(knowledge, message, 3);
  const top = hits[0];
  if (!top || top.score < 4) {
    const body = wantsRooms
      ? `For rooms and prices, see [our booking page](/book), or ${WA_LINK}.`
      : `I don't have that one. ${WA_LINK} and the team will answer you properly.`;
    return { text: body, ids: [], flagged: true };
  }
  const picked = hits.filter((h, i) => i === 0 || (i === 1 && h.score >= top.score * 0.7));
  const text = picked.map((h) => `${h.doc.title}\n${h.doc.content}`).join('\n\n');
  return { text, ids: picked.map((h) => h.doc.id), flagged: false };
}

export async function POST(req: Request) {
  let parsed: z.infer<typeof schema>;
  try {
    parsed = schema.parse(await req.json());
  } catch {
    return new Response('Invalid request', { status: 400 });
  }
  const { message, sessionId, guestEmail, reservationId } = parsed;

  let agentIsActive = false;
  let history: string[] = [];
  try {
    const upserted = await prisma.chatSession.upsert({
      where: { sessionId },
      create: { sessionId, guestEmail },
      update: { guestEmail, reservationId },
      select: { status: true },
    });
    agentIsActive = upserted.status === 'AGENT_ACTIVE';
    await prisma.chatMessage.create({ data: { sessionId, role: 'USER', content: message } });
    if (!agentIsActive) {
      const recent = await prisma.chatMessage.findMany({ where: { sessionId, role: 'USER' }, orderBy: { createdAt: 'desc' }, take: 3 });
      history = recent.reverse().slice(0, -1).map((m: { content: string }) => m.content);
    }
  } catch (e) {
    console.warn('[chat] DB skip:', (e as Error).message);
  }

  // When a team member has taken over, only save the message. They reply from the admin dashboard.
  if (agentIsActive) return Response.json({ agentMode: true }, { status: 202 });

  const out = await answer(message, [...history.slice(-2), message]).catch(() => ({
    text: `Something went wrong on my side. ${WA_LINK} and the team will help.`,
    ids: [] as string[],
    flagged: true,
  }));

  try {
    await prisma.chatMessage.create({ data: { sessionId, role: 'ASSISTANT', content: out.text, sources: out.ids, flagged: out.flagged } });
  } catch {}

  return new Response(out.text, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache, no-transform' } });
}
