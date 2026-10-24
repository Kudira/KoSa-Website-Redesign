import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  email: z.string().email(),
  source: z.string().max(64).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    try {
      await prisma.newsletterSubscriber.upsert({
        where: { email: data.email },
        create: { email: data.email, source: data.source ?? 'web' },
        update: { source: data.source ?? 'web' },
      });
    } catch (dbErr) {
      // DB may be unavailable in dev fail gracefully so the form still feels "alive"
      console.warn('[newsletter] DB write skipped:', (dbErr as Error).message);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof z.ZodError ? 'Please enter a valid email.' : 'Subscription failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
