// Paystack webhook: finishes the booking even if the guest closes the tab
// before being sent back to the website.
// Set this URL in Paystack → Settings → API Keys & Webhooks:
//   https://<your-domain>/api/booking/paystack/webhook

import { NextResponse } from 'next/server';
import { finalizePaid } from '@/lib/booking/direct';
import { validWebhookSignature } from '@/lib/paystack';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const raw = await req.text();
  if (!validWebhookSignature(raw, req.headers.get('x-paystack-signature'))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    const event = JSON.parse(raw) as { event?: string; data?: { reference?: string } };
    if (event.event === 'charge.success' && event.data?.reference) await finalizePaid(event.data.reference);
  } catch (e) {
    console.error('[booking] webhook failed', (e as Error).message);
  }
  // Always 200 once the signature is valid, so Paystack does not retry forever.
  return NextResponse.json({ ok: true });
}
