import type { Metadata } from 'next';
import { ShieldCheck, BadgeCheck, MessageCircle } from 'lucide-react';
import { PageHero } from '@/components/shared/PageHero';
import { StayPicker } from '@/components/booking/StayPicker';
import { getT } from '@/lib/i18n/server';
import { media } from '@/lib/content/media';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Book Your Stay',
  description: 'Check live availability and book KoSa Beach Resort direct: best rate, secure payment, instant confirmation.',
};

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: { checkIn?: string; checkOut?: string; adults?: string; children?: string; room?: string };
}

export default async function BookPage({ searchParams }: Props) {
  const { t } = await getT();
  const wa = `${site.socials.whatsapp}?text=${encodeURIComponent("Hi KoSa! I'd like help booking a stay. My dates are [check-in] to [check-out], for [number] guests.")}`;
  return (
    <>
      <PageHero eyebrow={t('bookPage.eyebrow')} title={t('bookPage.title')} subtitle={t('bookPage.subtitle')} image={media.arrival} height="sm" sky="morning" />
      <section data-sky="morning" className="container-page py-16 md:py-24">
        <h2 className="font-display text-display-sm mb-8">{t('stay.heading')}</h2>
        <StayPicker initial={searchParams} />
        <p className="mt-6 opacity-80">{t('stay.deposit')}</p>
        <ul className="mt-10 flex flex-wrap gap-x-10 gap-y-3 opacity-85">
          <li className="flex items-center gap-2"><ShieldCheck size={18} className="text-teal" aria-hidden /> {t('booking.badgeSecure')}</li>
          <li className="flex items-center gap-2"><BadgeCheck size={18} className="text-teal" aria-hidden /> {t('booking.badgeBestRate')}</li>
          <li>
            <a href={wa} target="_blank" rel="noreferrer" className="flex items-center gap-2 link-tide">
              <MessageCircle size={18} className="text-teal" aria-hidden /> {t('common.whatsapp')}
            </a>
          </li>
        </ul>
      </section>
    </>
  );
}
