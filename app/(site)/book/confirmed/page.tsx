import type { Metadata } from 'next';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { finalizePaid, stayNights, type BookingRow } from '@/lib/booking/direct';
import { getT } from '@/lib/i18n/server';
import type { DictKey } from '@/lib/i18n/dictionaries';
import { formatGhs } from '@/lib/pricing';
import { site } from '@/lib/site';
import { WaveMark } from '@/components/ui/WaveMark';

export const metadata: Metadata = { title: 'Your booking', robots: { index: false } };
export const dynamic = 'force-dynamic';

type State = 'confirmed' | 'reserved' | 'processing' | 'attention' | 'unpaid' | 'missing';

async function load(ref: string): Promise<{ state: State; b: BookingRow | null }> {
  if (!ref) return { state: 'missing', b: null };
  let b = (await prisma.booking.findUnique({ where: { id: ref } }).catch(() => null)) as BookingRow | null;
  if (!b) return { state: 'missing', b: null };

  // Still waiting on a pay-now booking: check Paystack in case the callback was missed.
  if (b.paymentProvider === 'paystack' && !b.cloudbedsReservationId) {
    await finalizePaid(ref).catch(() => null);
    b = ((await prisma.booking.findUnique({ where: { id: ref } }).catch(() => null)) as BookingRow | null) ?? b;
  }

  const p = b.paymentProvider ?? '';
  if (p === 'paystack:needs-attention') return { state: 'attention', b };
  // Pay-later that Cloudbeds refused: the team has been told and will follow up with a payment link.
  if (p === 'later:needs-attention') return { state: 'reserved', b };
  if (b.cloudbedsReservationId) return { state: b.status === 'CONFIRMED' ? 'confirmed' : 'reserved', b };
  if (p === 'paystack:processing') return { state: 'processing', b };
  return { state: 'unpaid', b };
}

const fmt = (d: Date, locale: string) =>
  new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);

export default async function ConfirmedPage({ searchParams }: { searchParams: { ref?: string } }) {
  const { t, locale } = await getT();
  const { state, b } = await load(searchParams.ref ?? '');
  const title = t(`booked.${state}Title` as DictKey);
  const body = t(`booked.${state}Body` as DictKey).replace('{email}', b?.guestEmail ?? '');
  const wa = `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(
    b ? `Hi KoSa! About my website booking (${b.guestName}, ${b.guestEmail}, reference ${b.id}).` : "Hi KoSa! I need help with a booking I made on the website.",
  )}`;
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  return (
    <section data-sky="morning" className="container-page min-h-[70vh] pt-40 pb-24 md:pt-48">
      {state === 'processing' && <meta httpEquiv="refresh" content="5" />}
      <p className="eyebrow mb-5">{t('booked.eyebrow')}</p>
      <h1 className="font-display text-display-lg max-w-3xl text-balance">{title}</h1>
      <p className="mt-6 max-w-xl text-lede opacity-85">{body}</p>

      {b && state !== 'missing' && state !== 'unpaid' && (
        <dl className="mt-12 grid max-w-3xl gap-x-10 gap-y-6 border-t border-forest/15 pt-8 sm:grid-cols-2">
          {b.cloudbedsReservationId && <Item label={t('booked.number')} value={b.cloudbedsReservationId} />}
          <Item label={t('booked.room')} value={b.roomTypeName ?? ''} />
          <Item label={t('booked.dates')} value={`${fmt(b.checkIn, locale)} – ${fmt(b.checkOut, locale)}, ${stayNights(b)} ${t('book.nightsUnit')}`} />
          <Item label={t('booked.guests')} value={`${b.adults + b.children}`} />
          {b.totalCost != null && <Item label={t('stay.total')} value={formatGhs(Number(b.totalCost))} />}
        </dl>
      )}

      <div className="mt-12 flex flex-wrap gap-3">
        {state === 'unpaid' && b && (
          <Link
            href={`/book?checkIn=${iso(b.checkIn)}&checkOut=${iso(b.checkOut)}&adults=${b.adults}&children=${b.children}`}
            className="inline-flex h-14 items-center rounded-full bg-teal px-8 font-semibold text-cream transition-colors hover:bg-teal-700"
          >
            {t('booked.tryAgain')}
          </Link>
        )}
        <a href={wa} target="_blank" rel="noreferrer" className="inline-flex h-14 items-center gap-2.5 rounded-full px-7 font-semibold ring-1 ring-inset ring-forest/25 transition-colors hover:bg-forest hover:text-cream">
          <MessageCircle size={18} aria-hidden /> {t('booked.whatsapp')}
        </a>
        <Link href="/" className="inline-flex h-14 items-center gap-3 rounded-full px-6 font-medium link-tide">
          <WaveMark className="text-teal" /> {t('booked.home')}
        </Link>
      </div>
    </section>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm opacity-65">{label}</dt>
      <dd className="mt-1 font-display text-2xl">{value}</dd>
    </div>
  );
}
