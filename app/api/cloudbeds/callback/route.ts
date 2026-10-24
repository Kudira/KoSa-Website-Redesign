import { NextResponse } from 'next/server';
import { exchangeCodeForToken, saveToken } from '@/lib/cloudbeds/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'missing code' }, { status: 400 });
  try {
    const tok = await exchangeCodeForToken(code);
    await saveToken(tok);
    return NextResponse.redirect(new URL('/admin?cloudbeds=connected', req.url));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
