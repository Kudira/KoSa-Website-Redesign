'use client';

// Wellness enquiry form for day guests and staying guests alike. Submits to
// /api/wellness-enquiry (email + DB) and also offers a one-tap WhatsApp option
// that pre-fills the same details - no stay required.

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMemo, useState } from 'react';
import { Loader2, Check, MessageCircle } from 'lucide-react';
import { Button } from '@/components/shared/Button';
import { useT } from '@/lib/i18n';
import { site } from '@/lib/site';

type FormValues = {
  name: string;
  email: string;
  phone?: string;
  interest?: string;
  guestType?: 'day' | 'staying';
  preferredDate?: string;
  guests?: string;
  message?: string;
  website?: string;
};

export function WellnessEnquiryForm({ programmes = [] }: { programmes?: string[] }) {
  const { t } = useT();
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, t('contact.error.name')),
        email: z.string().email(t('contact.error.email')),
        phone: z.string().optional(),
        interest: z.string().optional(),
        guestType: z.enum(['day', 'staying']).optional(),
        preferredDate: z.string().optional(),
        guests: z.string().optional(),
        message: z.string().optional(),
        website: z.string().max(0).optional(),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { guestType: 'day' } });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const res = await fetch('/api/wellness-enquiry', {
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

  function sendViaWhatsApp() {
    const v = getValues();
    const lines = [
      t('wellnessForm.waIntro'),
      v.interest ? `• ${t('wellnessForm.interest')}: ${v.interest}` : '',
      `• ${t('wellnessForm.guestType')}: ${v.guestType === 'staying' ? t('wellnessForm.staying') : t('wellnessForm.day')}`,
      v.preferredDate ? `• ${t('wellnessForm.date')}: ${v.preferredDate}` : '',
      v.guests ? `• ${t('wellnessForm.guests')}: ${v.guests}` : '',
      v.name ? `• ${t('contact.name')}: ${v.name}` : '',
      v.message ? `\n${v.message}` : '',
    ].filter(Boolean);
    const url = `${site.socials.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noreferrer');
  }

  if (sent) {
    return (
      <div className="bg-cream rounded-pebble p-10 text-center shadow-xl">
        <div className="mx-auto h-14 w-14 rounded-full bg-primary/20 text-primary grid place-items-center mb-5">
          <Check size={28} />
        </div>
        <h3 className="font-display text-2xl text-forest">{t('wellnessForm.thankTitle')}</h3>
        <p className="mt-2 text-forest/70">{t('wellnessForm.thankBody')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-pebble bg-cream/70 p-6 md:p-9 ring-1 ring-forest/10 space-y-5 text-forest">
      <input type="text" {...register('website')} className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label={t('contact.name')} error={errors.name?.message}>
          <input {...register('name')} className={inputCls} />
        </Field>
        <Field label={t('contact.email')} error={errors.email?.message}>
          <input type="email" {...register('email')} className={inputCls} />
        </Field>
        <Field label={t('contact.phone')}>
          <input {...register('phone')} className={inputCls} />
        </Field>
        <Field label={t('wellnessForm.interest')}>
          {programmes.length ? (
            <select {...register('interest')} className={inputCls}>
              <option value="">{t('wellnessForm.choose')}</option>
              {programmes.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
              <option value="Not sure yet">{t('wellnessForm.notSure')}</option>
            </select>
          ) : (
            <input {...register('interest')} className={inputCls} />
          )}
        </Field>
        <Field label={t('wellnessForm.guestType')}>
          <select {...register('guestType')} className={inputCls}>
            <option value="day">{t('wellnessForm.day')}</option>
            <option value="staying">{t('wellnessForm.staying')}</option>
          </select>
        </Field>
        <Field label={t('wellnessForm.date')}>
          <input type="date" {...register('preferredDate')} className={inputCls} />
        </Field>
      </div>

      <Field label={t('wellnessForm.message')}>
        <textarea {...register('message')} rows={4} className={`${inputCls} resize-y`} />
      </Field>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
          {isSubmitting ? t('contact.sending') : t('wellnessForm.submit')}
        </Button>
        <button
          type="button"
          onClick={sendViaWhatsApp}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-teal/40 text-teal font-sans text-xs px-6 py-3 hover:bg-teal hover:text-cream transition-colors"
        >
          <MessageCircle size={15} /> {t('wellnessForm.whatsapp')}
        </button>
      </div>
    </form>
  );
}

const inputCls = 'field';

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-sans text-sm text-forest/60">{label}</span>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}
