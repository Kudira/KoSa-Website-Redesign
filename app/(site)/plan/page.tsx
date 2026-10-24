import type { Metadata } from 'next';
import Link from 'next/link';
import { SmoothImage as Image } from '@/components/shared/SmoothImage';
import { Plane, CalendarRange } from 'lucide-react';
import { SeaBand } from '@/components/ui/SeaBand';
import { WaveMark } from '@/components/ui/WaveMark';
import { media, prose, sentences } from '@/lib/content/media';
import { PACKAGES, formatGhs } from '@/lib/pricing';
import { PageHero } from '@/components/shared/PageHero';
import { getT } from '@/lib/i18n/server';
import { FaqAccordion } from '@/components/marketing/FaqAccordion';
import { listPublicExperiences } from '@/lib/cms/experiences';
import { listPublicWellnessPackages } from '@/lib/cms/wellness-packages';
import { site } from '@/lib/site';
import { waPrefill, type PackageKey } from '@/lib/pricing';
import { BookButton } from '@/components/shared/BookButton';

// Tailwind chips per package category (graceful default for unknown values).
const CATEGORY_COLORS: Record<string, string> = {
  Leisure: 'bg-teal-100 text-teal-800',
  Wellness: 'bg-forest-100 text-forest-700',
  Romance: 'bg-coral-100 text-coral-700',
  Celebration: 'bg-sunshine-100 text-sunshine-700',
  Culture: 'bg-sand-200 text-forest-700',
  'Day Visit': 'bg-cream text-forest-700',
  Eco: 'bg-forest-50 text-forest-700',
};

const ITINERARIES: {
  key: PackageKey;
  labelKey: 'home.itineraries.weekend' | 'home.itineraries.short' | 'home.itineraries.full';
  titleKey: 'home.itineraries.weekend.title' | 'home.itineraries.short.title' | 'home.itineraries.full.title';
  bodyKey: 'home.itineraries.weekend.body' | 'home.itineraries.short.body' | 'home.itineraries.full.body';
}[] = [
  { key: 'weekend', labelKey: 'home.itineraries.weekend', titleKey: 'home.itineraries.weekend.title', bodyKey: 'home.itineraries.weekend.body' },
  { key: 'short', labelKey: 'home.itineraries.short', titleKey: 'home.itineraries.short.title', bodyKey: 'home.itineraries.short.body' },
  { key: 'full', labelKey: 'home.itineraries.full', titleKey: 'home.itineraries.full.title', bodyKey: 'home.itineraries.full.body' },
];

export const metadata: Metadata = {
  title: 'Plan Your Stay',
  description:
    'Everything you need to arrive ready what to do, getting here, airport transfers and FAQs for KoSa Beach Resort, Ghana',
};

export const dynamic = 'force-dynamic';

const FAQS = [
  { q: 'planPage.faq.checkin.q', a: 'planPage.faq.checkin.a' },
  { q: 'planPage.faq.cancellation.q', a: 'planPage.faq.cancellation.a' },
  { q: 'planPage.faq.airport.q', a: 'planPage.faq.airport.a' },
  { q: 'planPage.faq.halal.q', a: 'planPage.faq.halal.a' },
  { q: 'planPage.faq.children.q', a: 'planPage.faq.children.a' },
  { q: 'planPage.faq.payment.q', a: 'planPage.faq.payment.a' },
  { q: 'planPage.faq.swim.q', a: 'planPage.faq.swim.a' },
  { q: 'planPage.faq.wellness.q', a: 'planPage.faq.wellness.a' },
] as const;

export default async function PlanPage() {
  const { t } = getT();
  const [experiences, stayPackages] = await Promise.all([
    listPublicExperiences(),
    listPublicWellnessPackages().catch(() => []),
  ]);

  return (
    <>
      <PageHero eyebrow={t('nav.plan')} title={t('planPage.headline')} subtitle={prose(t('planPage.intro'))} image={media.relaxing} sky="morning" height="md" />

      {/* Stay packages */}
      {stayPackages.length > 0 && (
        <section data-sky="morning" className="container-page py-20 md:py-28">
          <div className="grid gap-8 lg:grid-cols-12 mb-14">
            <div className="lg:col-span-6">
              <p className="eyebrow mb-5">{t('planPage.packages.eyebrow')}</p>
              <h2 className="font-display text-display-md">{t('planPage.packages.heading')}</h2>
            </div>
            <p className="lg:col-span-5 lg:col-start-8 text-lede opacity-85 self-end">{prose(t('planPage.packages.intro'))}</p>
          </div>
          <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
            {stayPackages.map((pkg) => (
              <article key={pkg.id} className="group flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden rounded-pebble kosa-img-fallback">
                  {pkg.image ? (
                    <Image src={pkg.image} alt={pkg.name} fill sizes="(min-width:1280px) 31vw, (min-width:768px) 46vw, 92vw" className="object-cover branded-img transition-transform duration-[1.6s] ease-tide group-hover:scale-105" />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-cream/70"><CalendarRange size={44} /></div>
                  )}
                  <span className={`absolute left-4 top-4 rounded-full px-3.5 py-1.5 text-sm font-medium ${CATEGORY_COLORS[pkg.category] ?? 'bg-cream text-forest'}`}>
                    {pkg.category}, {pkg.durationLabel}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-3xl leading-tight">{pkg.name}</h3>
                {pkg.tagline && <p className="mt-2 opacity-75">{pkg.tagline}</p>}
                <ul className="mt-5 flex-1 space-y-2">
                  {pkg.inclusions.slice(0, 6).map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <WaveMark className="mt-2 text-coral-600" />
                      <span className="opacity-85">{item}</span>
                    </li>
                  ))}
                  {pkg.inclusions.length > 6 && <li className="pl-9 text-sm opacity-60">+ {pkg.inclusions.length - 6} more</li>}
                </ul>
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-forest/15 pt-5">
                  <p className="text-sm opacity-65">{t('planPage.packages.enquireRates')}</p>
                  <BookButton
                    category="PACKAGE"
                    itemName={pkg.name}
                    message={`Hi KoSa! I'd like to enquire about the ${pkg.name} package.`}
                    source="plan/packages"
                    className="inline-flex h-11 shrink-0 items-center rounded-full bg-forest px-5 font-semibold text-cream transition-colors hover:bg-forest-700"
                  >
                    {t('planPage.packages.enquire')}
                  </BookButton>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Your stay, your way */}
      <section data-sky="noon" className="container-page py-20 md:py-28">
        <div className="max-w-3xl mb-12">
          <p className="eyebrow mb-5">{t('planPage.itineraries.eyebrow')}</p>
          <h2 className="font-display text-display-md">{t('planPage.itineraries.heading')}</h2>
          <p className="mt-5 text-lede opacity-85">{prose(t('planPage.itineraries.body'))}</p>
        </div>
        <ol>
          {ITINERARIES.map((it) => {
            const p = PACKAGES[it.key];
            return (
              <li key={it.key} className="grid gap-8 border-t border-forest/15 py-12 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <p className="font-display text-7xl leading-none tabular-nums">{p.nights}</p>
                  <p className="mt-2 opacity-70">{t(it.labelKey).split('·')[0].trim()}</p>
                  <p className="mt-6 font-display text-3xl">{t('homeRooms.from')} {formatGhs(p.fromGhs)}</p>
                  <p className="mt-1 text-sm opacity-65">{t('stays.includes')} {p.inclusions}.</p>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <h3 className="font-display text-display-sm">{t(it.titleKey)}</h3>
                  <ul className="mt-6 space-y-3">
                    {sentences(t(it.bodyKey)).map((line, i) => (
                      <li key={i} className="flex gap-4 text-lg">
                        <WaveMark className="mt-2.5 text-coral-600" />
                        <span className="opacity-90">{line}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 italic opacity-70">{prose(t('planPage.itineraries.eachClose'))}</p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <a href={site.bookingUrl} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center rounded-full bg-teal px-6 font-semibold text-cream transition-colors hover:bg-teal-700">
                      {t('planPage.itineraries.bookThis')}
                    </a>
                    <BookButton
                      category="PACKAGE"
                      itemName={`Customise: ${t(it.titleKey)}`}
                      message={waPrefill.customiseStay()}
                      source="plan/itineraries"
                      className="inline-flex h-12 items-center rounded-full px-6 font-semibold ring-1 ring-inset ring-forest/25 transition-colors hover:bg-forest hover:text-cream"
                    >
                      {t('planPage.itineraries.cta2')}
                    </BookButton>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* What to do here */}
      {experiences.length > 0 && (
        <section data-sky="golden" className="container-page py-20 md:py-28">
          <div className="grid gap-8 lg:grid-cols-12 mb-12">
            <p className="eyebrow lg:col-span-4">{t('planPage.experiences.eyebrow')}</p>
            <p className="lg:col-span-7 lg:col-start-6 text-lede opacity-85">{prose(t('planPage.experiences.body'))}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {experiences.map((e, i) => (
              <Link key={e.id} href={`/experiences/${e.slug}`} className="group block">
                <div className={`relative aspect-[3/4] overflow-hidden ${i % 2 ? 'rounded-pebble' : 'rounded-t-full rounded-b-pebble'}`}>
                  {e.image && <Image src={e.image} alt={e.title} fill sizes="(min-width:1024px) 23vw, (min-width:640px) 46vw, 92vw" className="object-cover branded-img transition-transform duration-[1.6s] ease-tide group-hover:scale-105" />}
                </div>
                <p className="mt-4 text-sm opacity-65">{e.label}</p>
                <h3 className="mt-1 font-display text-2xl group-hover:text-teal transition-colors">{e.title}</h3>
              </Link>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/experiences" className="inline-flex h-12 items-center rounded-full bg-forest px-6 font-semibold text-cream transition-colors hover:bg-forest-700">
              {t('planPage.experiences.cta')}
            </Link>
            <BookButton
              category="PACKAGE"
              itemName="Customise my stay"
              message={waPrefill.customiseStay()}
              source="plan/experiences"
              className="inline-flex h-12 items-center rounded-full px-6 font-semibold ring-1 ring-inset ring-forest/25 transition-colors hover:bg-forest hover:text-cream"
            >
              {t('planPage.itineraries.cta2')}
            </BookButton>
          </div>
        </section>
      )}

      {/* Getting here */}
      <SeaBand>
        <div className="container-page grid gap-12 pt-6 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-5">{site.contact.address}</p>
            <h2 className="font-display text-display-md">{t('planPage.getting.title')}</h2>
            <p className="mt-5 text-lede text-cream/85">{prose(t('planPage.getting.body'))}</p>
            <BookButton
              category="TRANSFER"
              itemName="Airport transfer"
              message="Hi KoSa! I'd like to book an airport transfer. My arrival details are:"
              source="plan/getting-here"
              className="mt-8 inline-flex h-14 items-center gap-2.5 rounded-full bg-sunshine px-8 font-semibold text-forest-900 transition-colors hover:bg-cream"
            >
              <Plane size={18} aria-hidden /> {t('planPage.getting.cta')}
            </BookButton>
          </div>
          <div className="lg:col-span-7 aspect-[4/3] overflow-hidden rounded-pebble bg-teal-800">
            <iframe
              title={t('contactPage.mapTitle')}
              className="h-full w-full border-0 saturate-[0.8]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${site.location.lat},${site.location.lng}&z=10&output=embed`}
            />
          </div>
        </div>
      </SeaBand>

      {/* Questions */}
      <section data-sky="dusk" className="container-page py-24 md:py-32 grid gap-12 lg:grid-cols-12">
        <h2 className="font-display text-display-md lg:col-span-4">{t('planPage.faqs.title')}</h2>
        <div className="lg:col-span-8">
          <FaqAccordion items={FAQS.map((f) => ({ q: t(f.q), a: t(f.a) }))} />
        </div>
      </section>
    </>
  );
}
