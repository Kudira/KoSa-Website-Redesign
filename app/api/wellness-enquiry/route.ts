// Wellness enquiry - day guests can request a treatment/programme without
// booking a stay. Persists as a ContactEnquiry (subject prefixed) and emails
// the resort. The client also offers a "Send via WhatsApp" shortcut.

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendMail } from '@/lib/email';
import { site } from '@/lib/site';

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  interest: z.string().max(160).optional(), // which programme/treatment
  guestType: z.enum(['day', 'staying']).optional(),
  preferredDate: z.string().max(40).optional(),
  guests: z.string().max(20).optional(),
  message: z.string().max(4000).optional(),
  website: z.string().max(0).optional(), // honeypot
});

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    if (data.website) return NextResponse.json({ ok: true });

    const guestType = data.guestType === 'staying' ? 'Resort guest' : 'Day guest';
    const summary = [
      `Interest: ${data.interest ?? '-'}`,
      `Guest type: ${guestType}`,
      `Preferred date: ${data.preferredDate ?? '-'}`,
      `Guests: ${data.guests ?? '-'}`,
      `Phone: ${data.phone ?? '-'}`,
      '',
      data.message ?? '',
    ].join('\n');

    try {
      await prisma.contactEnquiry.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          subject: `Wellness enquiry · ${data.interest ?? guestType}`,
          message: summary,
        },
      });
    } catch (e) {
      console.warn('[wellness] DB write skipped:', (e as Error).message);
    }

    await sendMail({
      to: site.contact.email,
      subject: `Wellness enquiry · ${data.interest ?? data.name}`,
      text: `From: ${data.name} <${data.email}>\n\n${summary}`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof z.ZodError ? 'Please check your details.' : 'Could not send.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
