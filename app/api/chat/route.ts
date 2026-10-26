// Abena, the website concierge. No AI model: answers come from KoSa's own
// information (lib/knowledge) and live Cloudbeds rooms; anything else goes to
// the team on WhatsApp. When a team member takes over a chat in the admin,
// messages are only saved and the team replies from there.

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getKnowledge, FALLBACK_CONTACT_LINK } from '@/lib/knowledge';
import { abenaReply, errorReply, type Lang } from '@/lib/knowledge/abena';
import { directBookingModes } from '@/lib/booking/direct';
import { bookingEngineUrl, cloudbedsConfigured, getStayRates, getTonight } from '@/lib/cloudbeds/client';
import { formatGhs } from '@/lib/pricing';
import { getServerLocale } from '@/lib/i18n/server';
import { loadContent } from '@/lib/content/load';
import { site } from '@/lib/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  message: z.string().min(1).max(4000),
  sessionId: z.string().min(4).max(80),
  guestEmail: z.string().email().optional(),
  reservationId: z.string().optional(),
});

export async function POST(req: Request) {
  let parsed: z.infer<typeof schema>;
  try {
    parsed = schema.parse(await req.json());
  } catch {
    return new Response('Invalid request', { status: 400 });
  }
  const { message, sessionId, guestEmail, reservationId } = parsed;
  await loadContent();
  const lang = getServerLocale() as Lang;

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
      const recent = await prisma.chatMessage.findMany({ where: { sessionId, role: 'USER' }, orderBy: { createdAt: 'desc' }, take: 4 });
      history = recent.reverse().slice(0, -1).map((m: { content: string }) => m.content);
    }
  } catch (e) {
    console.warn('[chat] DB skip:', (e as Error).message);
  }

  if (agentIsActive) return Response.json({ agentMode: true }, { status: 202 });

  const whatsapp = FALLBACK_CONTACT_LINK();
  const live = cloudbedsConfigured();
  const out = await abenaReply(message, history, lang, {
    docs: () => getKnowledge().catch(() => []),
    stayRates: async (s) => (live ? getStayRates(s) : null),
    tonight: async () => (live ? getTonight() : null),
    bookingHref: (s) => {
      const m = directBookingModes();
      return m.payNow || m.payLater
        ? `/book?${new URLSearchParams({ checkIn: s.checkIn, checkOut: s.checkOut, adults: String(s.adults), children: String(s.children) })}`
        : bookingEngineUrl(s);
    },
    whatsapp,
    phone: site.contact.phone,
    email: site.contact.email,
    formatMoney: formatGhs,
  }).catch((e) => {
    console.error('[chat] reply failed', (e as Error).message);
    return { text: errorReply(lang, whatsapp), ids: [] as string[], flagged: true };
  });

  try {
    await prisma.chatMessage.create({ data: { sessionId, role: 'ASSISTANT', content: out.text, sources: out.ids, flagged: out.flagged } });
  } catch {}

  return new Response(out.text, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache, no-transform' } });
}
