'use client';

// Choose dates, see what is free right now (live from Cloudbeds), then reserve
// right here (when direct booking is switched on) or continue to the Cloudbeds
// booking engine with those dates already filled in.
// With `roomSlug`, the chosen room is shown first and the rest as alternatives.

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { SmoothImage as Image } from '@/components/shared/SmoothImage';
import { useT } from '@/lib/i18n';
import { formatGhs } from '@/lib/pricing';
import { site } from '@/lib/site';
import { cn } from '@/lib/utils';
import { ReserveForm } from '@/components/booking/ReserveForm';

interface LiveRoom {
  roomTypeId: string;
  name: string;
  slug: string | null;
  image: string | null;
  nightly: number;
  total: number;
  currency: string;
  roomsLeft: number;
}
interface Result {
  configured: boolean;
  nights?: number;
  bookingUrl: string;
  rooms: LiveRoom[];
  direct?: { payNow: boolean; payLater: boolean };
  error?: string;
}

const iso = (d: Date) => d.toISOString().slice(0, 10);
const plus = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

export function StayPicker({
  roomSlug,
  roomName,
  initial,
  tone = 'light',
  className,
}: {
  roomSlug?: string;
  roomName?: string;
  initial?: { checkIn?: string; checkOut?: string; adults?: string; children?: string };
  tone?: 'light' | 'sea';
  className?: string;
}) {
  const { t } = useT();
  const today = useMemo(() => iso(new Date()), []);
  const [checkIn, setCheckIn] = useState(initial?.checkIn || iso(plus(new Date(), 7)));
  const [checkOut, setCheckOut] = useState(initial?.checkOut || iso(plus(new Date(), 9)));
  const [adults, setAdults] = useState(Number(initial?.adults || 2));
  const [children, setChildren] = useState(Number(initial?.children || 0));
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<Result | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [gone, setGone] = useState(false);

  // Keep check-out after check-in.
  useEffect(() => {
    if (checkOut <= checkIn) setCheckOut(iso(plus(new Date(checkIn), 1)));
  }, [checkIn, checkOut]);

  async function search() {
    setState('loading');
    setOpen(null);
    try {
      const q = new URLSearchParams({ checkIn, checkOut, adults: String(adults), children: String(children) });
      const res = await fetch(`/api/cloudbeds/availability?${q}`);
      const json = (await res.json()) as Result;
      if (!res.ok) throw new Error(json.error || 'Could not check availability.');
      setResult(json);
      setState('done');
    } catch (e) {
      setResult({ configured: false, bookingUrl: site.bookingUrl, rooms: [], error: (e as Error).message });
      setState('error');
    }
  }

  // Search once on mount when dates came in from the URL.
  useEffect(() => {
    if (initial?.checkIn && initial?.checkOut) void search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sea = tone === 'sea';
  const mine = result?.rooms.find((r) => r.slug === roomSlug);
  const others = result?.rooms.filter((r) => r !== mine) ?? [];
  const direct = Boolean(result?.direct?.payNow || result?.direct?.payLater);
  const btn = cn('inline-flex h-11 shrink-0 items-center justify-center rounded-full px-5 font-semibold transition-colors', sea ? 'bg-sunshine text-forest-900 hover:bg-cream' : 'bg-forest text-cream hover:bg-forest-700');

  return (
    <div className={cn('rounded-pebble p-6 md:p-8', sea ? 'bg-cream/[0.08] ring-1 ring-inset ring-cream/15' : 'bg-cream/75 ring-1 ring-forest/10', className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void search();
        }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.7fr_0.7fr_auto] lg:items-end"
      >
        <Field label={t('book.checkIn')} sea={sea}>
          <input type="date" min={today} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="field" required />
        </Field>
        <Field label={t('book.checkOut')} sea={sea}>
          <input type="date" min={iso(plus(new Date(checkIn), 1))} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="field" required />
        </Field>
        <Field label={t('book.adults')} sea={sea}>
          <select value={adults} onChange={(e) => setAdults(Number(e.target.value))} className="field">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </Field>
        <Field label={t('book.children')} sea={sea}>
          <select value={children} onChange={(e) => setChildren(Number(e.target.value))} className="field">
            {[0, 1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </Field>
        <button
          type="submit"
          disabled={state === 'loading'}
          className={cn(
            'inline-flex h-[3.25rem] items-center justify-center gap-2 rounded-full px-7 font-semibold transition-colors disabled:opacity-60 sm:col-span-2 lg:col-span-1',
            sea ? 'bg-sunshine text-forest-900 hover:bg-cream' : 'bg-teal text-cream hover:bg-teal-700',
          )}
        >
          {state === 'loading' && <Loader2 size={17} className="animate-spin" aria-hidden />}
          {state === 'loading' ? t('stay.checking') : t('stay.check')}
        </button>
      </form>

      <div aria-live="polite">
        {state === 'done' && result && (
          <div className="mt-8">
            {!result.configured ? (
              <EngineLink href={result.bookingUrl} sea={sea} label={t('stay.seeEngine')} />
            ) : result.rooms.length === 0 ? (
              <div>
                <p className="text-lg">{t('stay.none')}</p>
                <a
                  href={`${site.socials.whatsapp}?text=${encodeURIComponent(`Hi KoSa! I'm looking for a room from ${checkIn} to ${checkOut} for ${adults} adult${adults > 1 ? 's' : ''}${children ? ` and ${children} child${children > 1 ? 'ren' : ''}` : ''}, but the website shows nothing free. Do you have anything close to those dates?`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex h-12 items-center rounded-full bg-forest px-6 font-semibold text-cream"
                >
                  {t('common.whatsapp')}
                </a>
              </div>
            ) : (
              <>
                <p className={cn('text-sm', sea ? 'text-cream/70' : 'opacity-65')}>
                  {t('stay.live')}, {result.nights} {t('book.nightsUnit')}
                </p>
                {gone && <p className="mt-3 text-lg font-semibold text-coral-600" role="alert">{t('stay.gone')}</p>}
                {roomSlug && !mine && <p className="mt-3 text-lg">{t('stay.notThis').replace('{room}', roomName ?? '')}</p>}
                <ul className="mt-4 grid gap-3">
                  {[...(mine ? [mine] : []), ...others].map((r) => (
                    <li key={r.roomTypeId} className={cn('rounded-2xl p-4', sea ? 'bg-cream/[0.06]' : 'bg-cream', r === mine && (sea ? 'ring-2 ring-sunshine' : 'ring-2 ring-teal'))}>
                     <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      {r.image && (
                        <div className="relative h-20 w-full shrink-0 overflow-hidden rounded-xl sm:w-28">
                          <Image src={r.image} alt="" fill sizes="112px" className="object-cover branded-img" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-display text-xl leading-tight">
                          {r.slug ? <Link href={`/rooms/${r.slug}`} className="hover:underline underline-offset-4">{r.name}</Link> : r.name}
                        </p>
                        <p className={cn('mt-1 text-sm', sea ? 'text-cream/70' : 'opacity-70')}>
                          {formatGhs(r.nightly)} {t('homeRooms.night')} · {formatGhs(r.total)} {t('book.total').toLowerCase()}
                        </p>
                        {r.roomsLeft > 0 && r.roomsLeft <= 3 && (
                          <p className="mt-1 text-sm font-semibold text-coral-600">{t('stay.left').replace('{n}', String(r.roomsLeft))}</p>
                        )}
                      </div>
                      {direct ? (
                        open !== r.roomTypeId && (
                          <button type="button" onClick={() => { setOpen(r.roomTypeId); setGone(false); }} className={btn}>
                            {t('stay.reserve')}
                          </button>
                        )
                      ) : (
                        <a href={result.bookingUrl} target="_blank" rel="noreferrer" className={btn}>
                          {t('stay.bookDates')}
                        </a>
                      )}
                     </div>
                      {direct && open === r.roomTypeId && result.direct && (
                        <ReserveForm
                          room={{ roomTypeId: r.roomTypeId, name: r.name, total: r.total, nights: result.nights ?? 1 }}
                          stay={{ checkIn, checkOut, adults, children }}
                          modes={result.direct}
                          sea={sea}
                          onClose={() => setOpen(null)}
                          onGone={() => { setGone(true); void search(); }}
                        />
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
        {state === 'error' && result && (
          <div className="mt-6">
            <p className="text-sm opacity-75">{result.error}</p>
            <EngineLink href={result.bookingUrl} sea={sea} label={t('stay.seeEngine')} />
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, sea, children }: { label: string; sea: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={cn('text-sm', sea ? 'text-cream/75' : 'opacity-70')}>{label}</span>
      {children}
    </label>
  );
}

function EngineLink({ href, sea, label }: { href: string; sea: boolean; label: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={cn('mt-3 inline-flex h-12 items-center rounded-full px-6 font-semibold', sea ? 'bg-sunshine text-forest-900' : 'bg-teal text-cream')}>
      {label}
    </a>
  );
}
