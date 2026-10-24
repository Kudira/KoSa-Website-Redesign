import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendMail } from '@/lib/email';
import { site } from '@/lib/site';

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  subject: z.string().max(160).optional(),
  message: z.string().min(8).max(4000),
  website: z.string().max(0).optional(), // honeypot
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    if (data.website) return NextResponse.json({ ok: true });

    try {
      await prisma.contactEnquiry.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          subject: data.subject,
          message: data.message,
        },
      });
    } catch (e) {
      console.warn('[contact] DB write skipped:', (e as Error).message);
    }

    await sendMail({
      to: site.contact.email,
      subject: `New enquiry · ${data.subject ?? data.name}`,
      text: `From: ${data.name} <${data.email}>\nPhone: ${data.phone ?? '-'}\n\n${data.message}`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof z.ZodError ? 'Please check your details.' : 'Could not send.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
