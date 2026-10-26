'use client';

// Guest details for a direct booking. Sends them to /api/booking, which checks
// the price again with Cloudbeds and then opens Paystack (pay now) or creates
// the reservation (pay later).

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2, Lock } from 'lucide-react';
import { useT } from '@/lib/i18n';
import { formatGhs } from '@/lib/pricing';
import { cn } from '@/lib/utils';

const COUNTRIES =
  'AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI CV KH CM CA CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HK HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG KP MK NO OM PK PW PS PA PG PY PE PH PL PT PR QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA KR SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW'.split(' ');

export interface ReserveTarget {
  roomTypeId: string;
  name: string;
  total: number;
  nights: number;
}

export function ReserveForm({
  room,
  stay,
  modes,
  sea,
  onClose,
  onGone,
}: {
  room: ReserveTarget;
  stay: { checkIn: string; checkOut: string; adults: number; children: number };
  modes: { payNow: boolean; payLater: boolean };
  sea: boolean;
  onClose: () => void;
  onGone: () => void;
}) {
  const { t, locale } = useT();
  const [pay, setPay] = useState<'now' | 'later'>(modes.payNow ? 'now' : 'later');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<string | null>(null);

  const countries = useMemo(() => {
    let names: Intl.DisplayNames | null = null;
    try {
      names = new Intl.DisplayNames([locale === 'zh' ? 'zh-CN' : locale], { type: 'region' });
    } catch {
      /* older browsers: show codes */
    }
    return COUNTRIES.map((c) => ({ code: c, name: names?.of(c) ?? c })).sort((a, b) => a.name.localeCompare(b.name, locale));
  }, [locale]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? '').trim();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomTypeId: room.roomTypeId,
          ...stay,
          pay,
          website: v('website'),
          guest: {
            firstName: v('firstName'),
            lastName: v('lastName'),
            email: v('email'),
            phone: v('phone'),
            country: v('country'),
            arrivalTime: v('arrivalTime'),
            requests: v('requests') || undefined,
          },
        }),
      });
      const json = (await res.json()) as { mode?: string; url?: string; ref?: string; error?: string };
      if (res.status === 409) {
        onGone();
        return;
      }
      if (!res.ok) throw new Error(json.error || t('stay.error'));
      if (json.mode === 'pay' && json.url) {
        window.location.assign(json.url);
        return;
      }
      setDone(v('email'));
      if (json.ref && json.ref !== 'thanks') window.location.assign(`/book/confirmed?ref=${encodeURIComponent(json.ref)}`);
    } catch (err) {
      setError((err as Error).message || t('stay.error'));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="mt-4 rounded-2xl p-5" role="status">
        <p className="font-display text-2xl">{t('booked.reservedTitle')}</p>
        <p className="mt-2">{t('booked.reservedBody').replace('{email}', done)}</p>
      </div>
    );
  }

  const muted = sea ? 'text-cream/70' : 'opacity-70';

  return (
    <form onSubmit={submit} className={cn('-mx-2 mt-4 grid gap-4 rounded-2xl p-4 sm:mx-0 md:p-6', sea ? 'bg-night/40' : 'bg-sand/60')}>
      <p className="font-display text-2xl">{t('stay.yourDetails')}</p>
      {/* Honeypot, hidden from people */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-4 sm:grid-cols-2">
        <Label text={t('stay.firstName')} muted={muted}>
          <input name="firstName" required maxLength={60} autoComplete="given-name" className="field" />
        </Label>
        <Label text={t('stay.lastName')} muted={muted}>
          <input name="lastName" required maxLength={60} autoComplete="family-name" className="field" />
        </Label>
        <Label text={t('stay.email')} muted={muted}>
          <input name="email" type="email" required maxLength={120} autoComplete="email" className="field" />
        </Label>
        <Label text={t('stay.phone')} muted={muted}>
          <input name="phone" type="tel" required minLength={6} maxLength={30} autoComplete="tel" placeholder="+233" className="field" />
        </Label>
        <Label text={t('stay.country')} muted={muted}>
          <select name="country" defaultValue="GH" required className="field">
            {countries.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </Label>
        <Label text={t('stay.arrival')} muted={muted}>
          <input name="arrivalTime" type="time" className="field" />
        </Label>
      </div>
      <Label text={t('stay.requests')} muted={muted}>
        <textarea name="requests" rows={2} maxLength={800} className="field min-h-[4.5rem] py-3" />
      </Label>

      {modes.payNow && modes.payLater && (
        <fieldset className="grid gap-3 sm:grid-cols-2">
          {(['now', 'later'] as const).map((m) => (
            <label
              key={m}
              className={cn(
                'flex cursor-pointer gap-3 rounded-xl p-4 ring-1 ring-inset transition-colors',
                pay === m ? (sea ? 'ring-sunshine bg-cream/[0.06]' : 'ring-teal bg-cream') : sea ? 'ring-cream/20' : 'ring-forest/15',
              )}
            >
              <input type="radio" name="pay" value={m} checked={pay === m} onChange={() => setPay(m)} className="mt-1 accent-teal" />
              <span>
                <span className="block font-semibold">{t(m === 'now' ? 'stay.payNow' : 'stay.payLater')}</span>
                <span className={cn('block text-sm', muted)}>{t(m === 'now' ? 'stay.payNowNote' : 'stay.payLaterNote')}</span>
              </span>
            </label>
          ))}
        </fieldset>
      )}

      <div className={cn('flex flex-wrap items-center justify-between gap-4 border-t pt-4', sea ? 'border-cream/15' : 'border-forest/10')}>
        <div>
          <p className={cn('text-sm', muted)}>{t('stay.total')}</p>
          <p className="font-display text-2xl">{formatGhs(room.total)}</p>
          <p className={cn('text-xs', muted)}>
            {room.name}, {room.nights} {t('book.nightsUnit')}
          </p>
        </div>
        <div className="flex w-full flex-row-reverse flex-wrap items-center justify-end gap-3 sm:w-auto sm:flex-row">
          <button type="button" onClick={onClose} className={cn('h-12 rounded-full px-5 font-medium', sea ? 'hover:bg-cream/10' : 'hover:bg-forest/5')}>
            {t('stay.back')}
          </button>
          <button
            type="submit"
            disabled={busy}
            className={cn(
              'inline-flex h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 font-semibold transition-colors disabled:opacity-60 sm:flex-none',
              sea ? 'bg-sunshine text-forest-900 hover:bg-cream' : 'bg-teal text-cream hover:bg-teal-700',
            )}
          >
            {busy ? <Loader2 size={17} className="animate-spin" aria-hidden /> : pay === 'now' ? <Lock size={16} aria-hidden /> : null}
            {busy ? t('stay.sending') : pay === 'now' ? t('stay.continuePay') : t('stay.confirmReserve')}
          </button>
        </div>
      </div>
      {pay === 'now' && <p className={cn('-mt-2 text-sm', muted)}>{t('stay.payNowNote')}</p>}
      <p className={cn('text-xs', muted)}>
        <Link href="/legal/terms" className="underline underline-offset-2">{t('stay.terms')}</Link>
      </p>
      {error && <p className="text-sm font-semibold text-coral-600" role="alert">{error}</p>}
    </form>
  );
}

function Label({ text, muted, children }: { text: string; muted: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={cn('text-sm', muted)}>{text}</span>
      {children}
    </label>
  );
}
