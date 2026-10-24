'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/shared/Button';

export default function AdminLoginPage() {
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') || '/admin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    if (res?.error || !res?.ok) {
      setLoading(false);
      setError('Invalid email or password.');
      return;
    }
    // Auth cookie is set by the time signIn resolves. Use a hard navigation so
    // the middleware sees the new session on the very first request - a
    // client-side router.replace() can race the cookie and bounce back to
    // /login (the "click twice" bug). Keep `loading` true through the redirect.
    window.location.assign(callbackUrl);
  }

  return (
    <main className="min-h-screen bg-bg-orange flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link href="/" aria-label="Home" className="inline-block">
            <Image
              src="/logo.png"
              alt="KoSa Beach Resort"
              width={120}
              height={80}
              priority
              className="mx-auto h-16 w-auto object-contain"
            />
          </Link>
          <p className="mt-6 font-poppins text-xs uppercase tracking-tracked text-brown">
            KoSa · Staff
          </p>
          <h1 className="mt-3 font-belleza text-4xl text-umber">Sign in</h1>
          <p className="mt-3 font-raleway text-sm text-umber/70">
            Restricted access. Reservations and content management.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-12 space-y-6 bg-cream p-8 rounded-lg shadow-sm">
          <label className="block">
            <span className="font-poppins text-[11px] uppercase tracking-tracked text-umber/70">
              Email
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full bg-bg-orange border-b-2 border-umber/15 focus:border-primary focus:outline-none py-2 text-umber"
            />
          </label>
          <label className="block">
            <span className="font-poppins text-[11px] uppercase tracking-tracked text-umber/70">
              Password
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full bg-bg-orange border-b-2 border-umber/15 focus:border-primary focus:outline-none py-2 text-umber"
            />
          </label>

          {error && (
            <p
              role="alert"
              className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded"
            >
              {error}
            </p>
          )}

          <Button type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>

          <p className="text-center text-xs text-umber/60">
            Forgot your password? Email{' '}
            <a className="text-primary underline" href="mailto:hello@ko-sa.com">
              hello@ko-sa.com
            </a>
          </p>
        </form>

        <p className="mt-6 text-center">
          <Link href="/" className="text-xs font-poppins uppercase tracking-tracked text-umber/60 hover:text-primary">
            ← Back to ko-sa.com
          </Link>
        </p>
      </div>
    </main>
  );
}
