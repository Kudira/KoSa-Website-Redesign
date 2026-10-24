// Public endpoint: records a service Book/Enquire click before the visitor is
// handed off to WhatsApp. Fire-and-forget from the client (navigator.sendBeacon
// or fetch keepalive), so it must be tolerant and never block the user.

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CATEGORIES = ['TREATMENT', 'ENHANCEMENT', 'PACKAGE', 'EVENT', 'DINING', 'EXPERIENCE', 'TRANSFER', 'OTHER'] as const;

const schema = z.object({
  category: z.enum(CATEGORIES).default('OTHER'),
  itemName: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(4000),
  source: z.string().trim().max(120).optional(),
});

export async function POST(req: Request) {
  // sendBeacon posts a Blob with type text/plain; tolerate both JSON & beacon.
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    try {
      raw = JSON.parse(await req.text());
    } catch {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 });
  }

  try {
    const enquiry = await prisma.serviceEnquiry.create({
      data: {
        category: parsed.data.category,
        itemName: parsed.data.itemName,
        message: parsed.data.message,
        source: parsed.data.source ?? null,
      },
      select: { id: true },
    });
    return NextResponse.json({ ok: true, id: enquiry.id });
  } catch (e) {
    // Never block the WhatsApp hand-off if the DB write fails.
    console.warn('[enquiry] DB write skipped:', (e as Error).message);
    return NextResponse.json({ ok: true });
  }
}
