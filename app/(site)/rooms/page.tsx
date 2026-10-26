import type { Metadata } from 'next';
import { MessageCircle } from 'lucide-react';
import { PageHero } from '@/components/shared/PageHero';
import { RoomsExplorer } from '@/components/rooms/RoomsExplorer';
import { SeaBand } from '@/components/ui/SeaBand';
import { listRoomsWithLive } from '@/lib/cms/rooms-live';
import { getT } from '@/lib/i18n/server';
import { site } from '@/lib/site';
import { getSetting } from '@/lib/cms/settings';
import { media, sentences } from '@/lib/content/media';

export const metadata: Metadata = {
  title: 'Rooms & Accommodation',
  description:
    'Your place by the sea. Garden retreats to ocean-facing suites at KoSa Beach Resort, Elmina, Ghana, designed for true rest.',
};

export const dynamic = 'force-dynamic';

export default async function RoomsPage() {
  const { t } = await getT();
  const [rooms, pricing] = await Promise.all([listRoomsWithLive(), getSetting('pricing')]);
  const showPrices = !pricing.hideRoomPrices;
  const wa = `${site.socials.whatsapp}?text=${encodeURIComponent(site.contact.whatsappMessage)}`;
  const intro = sentences(t('roomsPage.intro'));

  return (
    <>
      <PageHero eyebrow={t('nav.stay')} title={t('roomsPage.headline')} subtitle={intro[0]} image={media.rooms.luxuryDoubleSea} sky="morning" height="lg" />

      {intro.length > 1 && (
        <section data-sky="morning" className="container-page py-20 md:py-28">
          <p className="font-display text-display-sm max-w-4xl text-balance">
            {intro.slice(1).map((s) => (/[.!?]$/.test(s) ? s : `${s}.`)).join(' ')}
          </p>
        </section>
      )}

      <section data-sky="morning" className="container-page pb-24 md:pb-32">
        <RoomsExplorer
          rooms={rooms}
          showPrices={showPrices}
          labels={{
            searchPlaceholder: t('roomsPage.searchPlaceholder'),
            all: t('rooms.filter.all'),
            suite: t('rooms.filter.suite'),
            palmSide: t('rooms.filter.palmSide'),
            beachView: t('rooms.filter.beachView'),
            upTo: t('roomsPage.upTo'),
            guestsUnit: t('roomsPage.guestsUnit'),
            cardCta: t('roomsPage.cardCta'),
            view: t('rooms.view'),
            resultsOne: t('roomsPage.resultsOne'),
            resultsMany: t('roomsPage.resultsMany'),
            empty: t('roomsPage.searchEmpty'),
            occupied: t('roomsPage.occupied'),
            bookingUrl: site.bookingUrl,
            from: t('homeRooms.from'),
            night: t('homeRooms.night'),
            tonight: t('roomLive.tonight'),
            left: t('stay.tonightLeft'),
            full: t('stay.soldOutTonight'),
          }}
        />
      </section>

      <SeaBand>
          <div className="container-page grid gap-12 lg:grid-cols-12 lg:items-end pt-6">
            <div className="lg:col-span-6">
              <h2 className="font-display text-display-md text-balance">{t('roomsPage.bookDirect')}</h2>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href="/book" className="inline-flex h-14 items-center rounded-full bg-sunshine px-8 font-semibold text-forest-900 transition-colors hover:bg-cream">
                  {t('common.bookYourStay')}
                </a>
                <a href={wa} target="_blank" rel="noreferrer" className="inline-flex h-14 items-center gap-2.5 rounded-full px-7 font-semibold ring-1 ring-inset ring-cream/50 transition-colors hover:bg-cream hover:text-teal-700">
                  <MessageCircle size={18} aria-hidden /> {t('common.whatsapp')}
                </a>
              </div>
            </div>
            <ul className="lg:col-span-5 lg:col-start-8 grid gap-4 text-lg">
              {[t('roomsPage.confidence.rate'), t('roomsPage.confidence.cancel'), t('roomsPage.confidence.welcome'), t('roomsPage.confidence.desk')].map((item) => (
                <li key={item} className="flex gap-4 border-t border-cream/20 pt-4">
                  <svg width="22" height="10" viewBox="0 0 22 10" className="mt-2.5 shrink-0 text-sunshine" aria-hidden>
                    <path d="M1 8 C4 8 5 2 8 2 S12 8 15 8 18 2 21 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
      </SeaBand>
    </>
  );
}
