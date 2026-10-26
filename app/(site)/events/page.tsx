import type { Metadata } from 'next';
import Link from 'next/link';
import { SmoothImage as Image } from '@/components/shared/SmoothImage';
import { PageHero } from '@/components/shared/PageHero';
import { SeaBand } from '@/components/ui/SeaBand';
import { getT } from '@/lib/i18n/server';
import { EventEnquiryForm } from '@/components/marketing/EventEnquiryForm';
import { EventsExplorer } from '@/components/events/EventsExplorer';
import { listPublicEvents } from '@/lib/cms/events';
import { media, prose } from '@/lib/content/media';

export const metadata: Metadata = {
  title: 'Events & Activities',
  description:
    'Cooking classes, drumming and dancing, batik and bead making, castle and Kakum tours, naming ceremonies and more at KoSa Beach Resort, Ghana.',
};

export const dynamic = 'force-dynamic';

export default async function EventsPage() {
  const { t } = getT();
  const events = await listPublicEvents().catch(() => []);

  const gatherings = [
    { img: media.events.one, title: t('eventsPage.weddings.title'), body: t('eventsPage.weddings.body'), shape: 'rounded-t-full rounded-b-pebble' },
    { img: media.wellness.journeys, title: t('eventsPage.retreats.title'), body: t('eventsPage.retreats.body'), shape: 'rounded-pebble' },
    { img: media.events.two, title: t('eventsPage.corporate.title'), body: t('eventsPage.corporate.body'), shape: 'rounded-pebble' },
  ];

  return (
    <>
      <PageHero eyebrow={t('nav.events')} title={t('eventsPage.headline')} subtitle={prose(t('eventsPage.intro'))} image={media.events.three} sky="morning" height="lg">
        <a href="#enquiry" className="inline-flex h-12 items-center rounded-full bg-teal px-7 font-semibold text-cream transition-colors hover:bg-teal-700">
          {t('eventsPage.corporate.cta')}
        </a>
      </PageHero>

      {events.length > 0 && (
        <section data-sky="morning" className="container-page py-20 md:py-28">
          <EventsExplorer
            events={events.map((e) => ({
              id: e.id,
              slug: e.slug,
              title: e.title,
              category: e.category,
              description: e.description,
              image: e.image,
              transportIncluded: e.transportIncluded,
              priceNote: e.priceNote,
            }))}
            labels={{
              all: t('rooms.filter.all'),
              enquire: t('eventsPage.enquire'),
              transport: t('eventsPage.transport'),
              empty: t('eventsPage.empty'),
            }}
          />
        </section>
      )}

      {/* Bigger gatherings */}
      <section data-sky="golden" className="container-page py-24 md:py-32">
        <div className="grid gap-14 md:grid-cols-3 md:gap-8">
          {gatherings.map((g, i) => (
            <article key={g.title} className={i === 1 ? 'md:mt-24' : ''}>
              <div className={`relative aspect-[4/5] overflow-hidden ${g.shape}`}>
                <Image src={g.img} alt={g.title} fill sizes="(min-width:768px) 31vw, 92vw" className="object-cover branded-img" />
              </div>
              <h2 className="mt-7 font-display text-display-sm">{g.title}</h2>
              <p className="mt-4 opacity-85 leading-relaxed">{prose(g.body)}</p>
              {i === 2 && (
                <Link href="/groups" className="mt-5 inline-flex font-semibold link-tide">
                  {t('nav.groups')}
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>

      <SeaBand id="enquiry">
        <div className="container-page grid gap-12 pt-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="font-display text-display-md text-balance">{t('eventsPage.corporate.cta')}</h2>
            <p className="mt-5 text-lede text-cream/80">{t('eventsPage.form.response')}.</p>
          </div>
          <div className="lg:col-span-7">
            <EventEnquiryForm />
          </div>
        </div>
      </SeaBand>
    </>
  );
}
