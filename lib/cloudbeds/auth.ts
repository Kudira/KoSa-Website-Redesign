// Cloudbeds OAuth 2.0 client stores tokens in Prisma CloudbedsToken model
import { prisma } from '@/lib/prisma';

const CB_BASE = 'https://hotels.cloudbeds.com/api/v1.1';
const CB_AUTH = 'https://hotels.cloudbeds.com/api/v1.1/oauth';

export class CloudbedsAuthError extends Error {}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number; // seconds
  token_type: string;
  scope?: string;
}

export async function exchangeCodeForToken(code: string) {
  const res = await fetch(`${CB_AUTH}/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.CLOUDBEDS_CLIENT_ID || '',
      client_secret: process.env.CLOUDBEDS_CLIENT_SECRET || '',
      redirect_uri: process.env.CLOUDBEDS_REDIRECT_URI || '',
      code,
    }),
  });
  if (!res.ok) throw new CloudbedsAuthError(`Cloudbeds token exchange failed: ${res.status}`);
  return (await res.json()) as TokenResponse;
}

export async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(`${CB_AUTH}/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.CLOUDBEDS_CLIENT_ID || '',
      client_secret: process.env.CLOUDBEDS_CLIENT_SECRET || '',
      refresh_token: refreshToken,
    }),
  });
  if (!res.ok) throw new CloudbedsAuthError(`Cloudbeds refresh failed: ${res.status}`);
  return (await res.json()) as TokenResponse;
}

export async function saveToken(t: TokenResponse) {
  const propertyId = process.env.CLOUDBEDS_PROPERTY_ID || '';
  const expiresAt = new Date(Date.now() + t.expires_in * 1000 - 60_000);
  // Single-row table: upsert by propertyId
  const existing = await prisma.cloudbedsToken.findFirst({ where: { propertyId } });
  if (existing) {
    return prisma.cloudbedsToken.update({
      where: { id: existing.id },
      data: { accessToken: t.access_token, refreshToken: t.refresh_token, expiresAt, scope: t.scope },
    });
  }
  return prisma.cloudbedsToken.create({
    data: {
      accessToken: t.access_token,
      refreshToken: t.refresh_token,
      expiresAt,
      propertyId,
      scope: t.scope,
    },
  });
}

export async function getAccessToken(): Promise<string> {
  const envToken = process.env.CLOUDBEDS_ACCESS_TOKEN;
  if (envToken) return envToken;

  const propertyId = process.env.CLOUDBEDS_PROPERTY_ID || '';
  const stored = await prisma.cloudbedsToken.findFirst({ where: { propertyId } });
  if (!stored) throw new CloudbedsAuthError('No Cloudbeds token saved. Complete OAuth at /api/cloudbeds/callback');
  if (stored.expiresAt.getTime() > Date.now() + 5_000) return stored.accessToken;
  const refreshed = await refreshAccessToken(stored.refreshToken);
  const saved = await saveToken(refreshed);
  return saved.accessToken;
}

export async function cloudbedsFetch<T = unknown>(
  path: string,
  init: RequestInit & { params?: Record<string, string | number | undefined> } = {},
): Promise<T> {
  const token = await getAccessToken();
  const url = new URL(`${CB_BASE}${path}`);
  if (init.params) {
    for (const [k, v] of Object.entries(init.params)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudbeds ${path} → ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}
