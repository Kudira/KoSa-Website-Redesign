'use client';

// Group/event enquiry form content brief §02 page 06.
// Posts to /api/contact with a structured subject + message so it lands in the
// admin Enquiries inbox.

import { useState } from 'react';
import { useT } from '@/lib/i18n';

export function EventEnquiryForm({ defaultType = 'Wedding' }: { defaultType?: string } = {}) {
  const { t } = useT();
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    type: defaultType,
    dates: '',
    guests: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      setError(t('eventsPage.form.error'));
      return;
    }
    setSubmitting(true);
    try {
      const message = [
        `Event type: ${form.type}`,
        form.company && `Company: ${form.company}`,
        form.dates && `Dates: ${form.dates}`,
        form.guests && `Guests: ${form.guests}`,
        '',
        form.message,
      ]
        .filter(Boolean)
        .join('\n');
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: `Event enquiry · ${form.type}`,
          message,
        }),
      });
      if (!res.ok) throw new Error(t('eventsPage.form.sendError'));
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="bg-cream/10 border border-cream/20 rounded-pebble p-8 text-center">
        <p className="font-display text-2xl text-sunshine">{t('eventsPage.form.thankYou')}</p>
        <p className="mt-2 font-sans text-cream/80">{t('eventsPage.form.response')}</p>
      </div>
    );
  }

  const field = 'field';

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <label className="block">
        <span className="text-sm text-cream/75">{t('eventsPage.form.name')}</span>
        <input className={`mt-1 ${field}`} value={form.name} onChange={(e) => set('name', e.target.value)} required />
      </label>
      <label className="block">
        <span className="text-sm text-cream/75">{t('common.email')}</span>
        <input type="email" className={`mt-1 ${field}`} value={form.email} onChange={(e) => set('email', e.target.value)} required />
      </label>
      <label className="block">
        <span className="text-sm text-cream/75">{t('eventsPage.form.company')}</span>
        <input className={`mt-1 ${field}`} value={form.company} onChange={(e) => set('company', e.target.value)} />
      </label>
      <label className="block">
        <span className="text-sm text-cream/75">{t('eventsPage.form.type')}</span>
        <select className={`mt-1 ${field}`} value={form.type} onChange={(e) => set('type', e.target.value)}>
          <option value="Tour group">{t('groups.optTour')}</option>
          <option value="School or educational trip">{t('groups.optSchool')}</option>
          <option value="Wedding">{t('eventsPage.form.optWedding')}</option>
          <option value="Wellness retreat">{t('eventsPage.form.optRetreat')}</option>
          <option value="Corporate offsite">{t('eventsPage.form.optCorporate')}</option>
          <option value="Other celebration">{t('eventsPage.form.optOther')}</option>
        </select>
      </label>
      <label className="block">
        <span className="text-sm text-cream/75">{t('eventsPage.form.dates')}</span>
        <input className={`mt-1 ${field}`} value={form.dates} onChange={(e) => set('dates', e.target.value)} placeholder={t('eventsPage.form.datesPlaceholder')} />
      </label>
      <label className="block">
        <span className="text-sm text-cream/75">{t('eventsPage.form.guests')}</span>
        <input className={`mt-1 ${field}`} value={form.guests} onChange={(e) => set('guests', e.target.value)} placeholder={t('eventsPage.form.guestsPlaceholder')} />
      </label>
      <label className="block md:col-span-2">
        <span className="text-sm text-cream/75">{t('eventsPage.form.message')}</span>
        <textarea rows={4} className={`mt-1 ${field}`} value={form.message} onChange={(e) => set('message', e.target.value)} />
      </label>
      {error && <p className="md:col-span-2 text-sm text-sunshine">{error}</p>}
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-14 items-center rounded-full bg-sunshine px-8 font-semibold text-forest-900 hover:bg-cream transition-colors disabled:opacity-50"
        >
          {submitting ? t('eventsPage.form.sending') : t('eventsPage.corporate.cta')}
        </button>
      </div>
    </form>
  );
}
