import type { Metadata } from 'next';
import { PageHero } from '@/components/shared/PageHero';
import { BookingFlow } from '@/components/booking/BookingFlow';
import { ShieldCheck, BadgeCheck, MessageCircle } from 'lucide-react';
import { getT } from '@/lib/i18n/server';
import { media } from '@/lib/content/media';

export const metadata: Metadata = {
  title: 'Book Your Stay',
  description: 'Reserve your stay at KoSa Beach Resort secure booking, best-rate guarantee, instant confirmation',
};

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: { checkIn?: string; checkOut?: string; adults?: string; children?: string; room?: string };
}

export default function BookPage({ searchParams }: Props) {
  const { t } = getT();
  return (
    <>
      <PageHero
        eyebrow={t('bookPage.eyebrow')}
        title={t('bookPage.title')}
        subtitle={t('bookPage.subtitle')}
        image={media.arrival}
        height="sm"
        sky="morning"
      />
      <section data-sky="morning" className="py-16">
        <div className="container-page">
          <BookingFlow initial={searchParams} />

          <div className="mt-16 flex flex-wrap gap-x-10 gap-y-3 opacity-85">
            <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-teal" /> {t('booking.badgeSecure')}</div>
            <div className="flex items-center gap-2"><BadgeCheck size={16} className="text-teal" /> {t('booking.badgeBestRate')}</div>
            <div className="flex items-center gap-2"><MessageCircle size={16} className="text-teal" /> {t('common.whatsapp')}</div>
          </div>
        </div>
      </section>
    </>
  );
}
