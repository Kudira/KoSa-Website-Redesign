// Paystack, server-side only. The secret key lives in PAYSTACK_SECRET_KEY on
// Vercel and never reaches the browser. Amounts are sent in pesewas (GHS x 100).

import 'server-only';
import crypto from 'crypto';

const API = process.env.PAYSTACK_API_BASE || 'https://api.paystack.co';

export function paystackConfigured() {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

async function call<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      cache: 'no-store',
    });
    const json = (await res.json()) as { status?: boolean; data?: T; message?: string };
    if (!res.ok || !json.status) {
      console.warn('[paystack]', path, json.message);
      return null;
    }
    return json.data ?? null;
  } catch (e) {
    console.warn('[paystack]', path, (e as Error).message);
    return null;
  }
}

export async function startPayment(p: { email: string; amountGhs: number; reference: string; callbackUrl: string; metadata?: Record<string, unknown> }) {
  return call<{ authorization_url: string; reference: string }>('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email: p.email,
      amount: Math.round(p.amountGhs * 100),
      currency: 'GHS',
      reference: p.reference,
      callback_url: p.callbackUrl,
      metadata: p.metadata,
    }),
  });
}

export interface VerifiedPayment {
  status: string; // 'success' when paid
  amount: number; // pesewas
  currency: string;
  reference: string;
  channel?: string;
}

export async function verifyPayment(reference: string) {
  return call<VerifiedPayment>(`/transaction/verify/${encodeURIComponent(reference)}`);
}

/** Paystack signs webhooks with HMAC-SHA512 of the raw body using the secret key. */
export function validWebhookSignature(rawBody: string, signature: string | null) {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key || !signature) return false;
  const expected = crypto.createHmac('sha512', key).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
