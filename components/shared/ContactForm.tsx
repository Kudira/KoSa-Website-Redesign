'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMemo, useState } from 'react';
import { Loader2, Check } from 'lucide-react';
import { Button } from './Button';
import { useT } from '@/lib/i18n';

type FormValues = {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  website?: string;
};

export function ContactForm() {
  const { t } = useT();
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Rebuild schema when locale changes so validation messages localize too
  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, t('contact.error.name')),
        email: z.string().email(t('contact.error.email')),
        phone: z.string().optional(),
        subject: z.string().optional(),
        message: z.string().min(8, t('contact.error.message')),
        website: z.string().max(0).optional(), // honeypot
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('contact.error.generic'));
      setSent(true);
      reset();
    } catch (e) {
      setServerError(e instanceof Error ? e.message : t('contact.error.generic'));
    }
  }

  if (sent) {
    return (
      <div className="bg-cream rounded-pebble p-10 text-center shadow-xl">
        <div className="mx-auto h-14 w-14 rounded-full bg-primary/20 text-primary grid place-items-center mb-5">
          <Check size={28} />
        </div>
        <h3 className="font-display text-2xl text-forest">{t('contact.thankTitle')}</h3>
        <p className="mt-2 text-forest/70">{t('contact.thankBody')}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-pebble bg-cream/70 p-6 md:p-9 ring-1 ring-forest/10 space-y-5"
    >
      <input type="text" {...register('website')} className="hidden" tabIndex={-1} autoComplete="off" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label={t('contact.name')} error={errors.name?.message}>
          <input
            {...register('name')}
            className="field"
          />
        </Field>
        <Field label={t('contact.email')} error={errors.email?.message}>
          <input
            type="email"
            {...register('email')}
            className="field"
          />
        </Field>
        <Field label={t('contact.phone')}>
          <input
            {...register('phone')}
            className="field"
          />
        </Field>
        <Field label={t('contact.subject')}>
          <input
            {...register('subject')}
            className="field"
          />
        </Field>
      </div>
      <Field label={t('contact.message')} error={errors.message?.message}>
        <textarea
          {...register('message')}
          rows={6}
          className="field resize-y"
        />
      </Field>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting} size="lg">
        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
        {isSubmitting ? t('contact.sending') : t('contact.send')}
      </Button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-sans text-sm text-forest/60">{label}</span>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}
