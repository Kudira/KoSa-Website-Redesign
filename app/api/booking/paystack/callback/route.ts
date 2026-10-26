// Paystack sends the guest back here after paying.
// GET /api/booking/paystack/callback?reference=...

import { NextResponse } from 'next/server';
import { finalizePaid } from '@/lib/booking/direct';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const ref = url.searchParams.get('reference') || url.searchParams.get('trxref') || '';
  if (ref) await finalizePaid(ref).catch((e) => console.error('[booking] finalize failed', (e as Error).message));
  return NextResponse.redirect(new URL(`/book/confirmed?ref=${encodeURIComponent(ref)}`, url.origin));
}
