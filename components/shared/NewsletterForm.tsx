'use client';

import { useState } from 'react';
import { Loader2, ArrowRight, Check } from 'lucide-react';
import { useT } from '@/lib/i18n';

export function NewsletterForm() {
  const { t } = useT();
  const [email, setEmail] = useState('');
  const [hp, setHp] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (hp) return;
    setState('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('newsletter.failed'));
      setState('success');
      setMsg(t('newsletter.success'));
      setEmail('');
    } catch (err) {
      setState('error');
      setMsg(err instanceof Error ? err.message : t('newsletter.error'));
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className="relative">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('newsletter.placeholder')}
          aria-label={t('newsletter.ariaEmail')}
          className="w-full bg-transparent border border-cream/30 rounded-full pl-5 pr-12 py-3 text-sm placeholder:text-cream/40 focus:border-primary focus:outline-none"
        />
        <input
          type="text"
          name="website"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          aria-label={t('newsletter.ariaSubscribe')}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 grid place-items-center h-9 w-9 rounded-full bg-primary text-forest hover:bg-cream transition-colors"
        >
          {state === 'loading' ? (
            <Loader2 size={16} className="animate-spin" />
          ) : state === 'success' ? (
            <Check size={16} />
          ) : (
            <ArrowRight size={16} />
          )}
        </button>
      </div>
      {msg && (
        <p className={`text-xs ${state === 'error' ? 'text-red-300' : 'text-primary'}`}>{msg}</p>
      )}
    </form>
  );
}
