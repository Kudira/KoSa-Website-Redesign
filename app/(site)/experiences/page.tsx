import type { Metadata } from 'next';
import { wa } from '@/lib/whatsapp';
import Link from 'next/link';
import { SmoothImage as Image } from '@/components/shared/SmoothImage';
import { PageHero } from '@/components/shared/PageHero';
import { SeaBand } from '@/components/ui/SeaBand';
import { WaveMark } from '@/components/ui/WaveMark';
import { getT } from '@/lib/i18n/server';
import { listPublicExperiences } from '@/lib/cms/experiences';
import { EXPERIENCE_DETAILS, formatGhs } from '@/lib/pricing';
import { BookButton } from '@/components/shared/BookButton';
import { listPublicDailyActivities, groupByDay, DAY_ORDER } from '@/lib/cms/daily-activities';
import { listPublicStayEnhancements, groupByCategory } from '@/lib/cms/stay-enhancements';
import { getSetting } from '@/lib/cms/settings';
import { DailyActivitiesRail, type RailDay } from '@/components/experiences/DailyActivitiesRail';
import { media, prose, sentences } from '@/lib/content/media';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Experiences & Activities',
  description:
    'Ghana begins here. On-property calm and guided journeys into Cape Coast, Elmina, Kakum and the fishing villages from KoSa Beach Resort.',
};

export const dynamic = 'force-dynamic';

const DAY_LABEL: Record<string, string> = {
  MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday', FRIDAY: 'Friday', SATURDAY: 'Saturday', SUNDAY: 'Sunday',
};

const SIGNATURE = [
  { key: 'ampenyi', t: 'experiencesPage.signature.ampenyi.title', b: 'experiencesPage.signature.ampenyi.body' },
  { key: 'elmina', t: 'experiencesPage.signature.elmina.title', b: 'experiencesPage.signature.elmina.body' },
  { key: 'capeCoast', t: 'experiencesPage.signature.capeCoast.title', b: 'experiencesPage.signature.capeCoast.body' },
  { key: 'kakum', t: 'experiencesPage.signature.kakum.title', b: 'experiencesPage.signature.kakum.body' },
  { key: 'horse', t: 'experiencesPage.signature.horse.title', b: 'experiencesPage.signature.horse.body' },
] as const;

export default async function ExperiencesPage() {
  const { t } = getT();
  const [experiences, allActivities, allEnhancements, pricing] = await Promise.all([
    listPublicExperiences(),
    listPublicDailyActivities().catch(() => []),
    listPublicStayEnhancements().catch(() => []),
    getSetting('pricing'),
  ]);
  const activitiesByDay = groupByDay(allActivities);
  const enhancementsByCategory = groupByCategory(allEnhancements);
  const showEnhancementPrices = !pricing.hideEnhancementPrices;
  const railDays: RailDay[] = DAY_ORDER.map((day) => ({
    day,
    label: DAY_LABEL[day],
    image: (activitiesByDay.get(day) ?? []).find((a) => a.image)?.image ?? undefined,
    activities: (activitiesByDay.get(day) ?? []).map((a) => ({
      id: a.id,
      time: a.time,
      title: a.title,
      description: a.description ?? null,
      tag: a.tag ?? null,
      isFree: a.isFree,
    })),
  })).filter((d) => d.activities.length > 0);

  const intro = sentences(t('experiencesPage.intro'));

  return (
    <>
      <PageHero eyebrow={t('nav.experiences')} title={t('experiencesPage.headline')} subtitle={intro[0]} image={media.experiences.banner} sky="morning" height="lg" />

      {intro.length > 1 && (
        <section data-sky="morning" className="container-page py-20 md:py-28">
          <p className="font-display text-display-sm max-w-4xl text-balance">{prose(intro.slice(1).join(' · '))}</p>
        </section>
      )}

      {/* Two worlds: here, and out there */}
      <section data-sky="noon" className="container-page pb-24 md:pb-32 grid gap-16 md:grid-cols-2 md:gap-10 lg:gap-20">
        {[
          { img: media.experiences.property, title: t('experiencesPage.property.title'), body: t('experiencesPage.property.body'), shape: 'rounded-t-full rounded-b-pebble' },
          { img: media.experiences.ghana, title: t('experiencesPage.ghana.title'), body: t('experiencesPage.ghana.body'), shape: 'rounded-pebble md:mt-40' },
        ].map((w) => (
          <article key={w.title} className={w.shape.includes('mt-40') ? 'md:mt-40' : ''}>
            <div className={cn('relative aspect-[4/5] overflow-hidden', w.shape.replace(' md:mt-40', ''))}>
              <Image src={w.img} alt={w.title} fill sizes="(min-width:768px) 45vw, 92vw" className="object-cover branded-img" />
            </div>
            <h2 className="mt-8 font-display text-display-md">{w.title}</h2>
            <p className="mt-4 text-lede opacity-85 max-w-md">{prose(w.body)}</p>
          </article>
        ))}
      </section>

      {/* Experiences from the admin, as alternating spreads */}
      {experiences.length > 0 && (
        <section data-sky="noon" className="container-page pb-16">
          <ol>
            {experiences.map((e, i) => (
              <li key={e.id} className="grid gap-8 py-14 md:py-20 lg:grid-cols-12 lg:gap-14 border-t border-forest/10">
                <div className={cn('relative aspect-[16/11] overflow-hidden lg:col-span-7', i % 2 ? 'lg:order-2 rounded-pebble' : 'rounded-t-[12rem] rounded-b-pebble')}>
                  {e.image && <Image src={e.image} alt={e.title} fill sizes="(min-width:1024px) 58vw, 100vw" className="object-cover branded-img" />}
                </div>
                <div className={cn('lg:col-span-5 flex flex-col justify-center', i % 2 && 'lg:order-1')}>
                  <p className="eyebrow">{e.label}</p>
                  <h3 className="mt-4 font-display text-display-md text-balance">{e.title}</h3>
                  <p className="mt-4 text-lede opacity-85">{prose(e.description)}</p>
                  {e.duration && <p className="mt-4 text-sm opacity-60">{e.duration}</p>}
                  <Link href={`/experiences/${e.slug}`} className="mt-7 w-fit font-semibold link-tide">
                    {t('experiences.discover')}
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Signature experiences, set like a menu */}
      <section data-sky="golden" className="container-page py-24 md:py-32">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow mb-5">{t('experiencesPage.signature.eyebrow')}</p>
            <h2 className="font-display text-display-md text-balance">{t('experiencesPage.signature.headline')}</h2>
          </div>
          <ul className="lg:col-span-8">
            {SIGNATURE.map((item) => {
              const detail = EXPERIENCE_DETAILS[item.key];
              const name = t(item.t);
              return (
                <li key={item.key} className="grid gap-4 border-t border-forest/20 py-8 md:grid-cols-[1fr_auto] md:gap-10">
                  <div>
                    <h3 className="font-display text-3xl">{name}</h3>
                    <p className="mt-3 opacity-85 leading-relaxed max-w-xl">{prose(t(item.b))}</p>
                    <p className="mt-3 text-sm opacity-60">{detail.duration}</p>
                  </div>
                  <div className="flex items-start gap-5 md:flex-col md:items-end">
                    <p className="font-display text-2xl whitespace-nowrap">
                      {formatGhs(detail.fromGhs)}
                      <span className="block font-sans text-sm opacity-60 md:text-right">{t('experiencesPage.perPerson')}</span>
                    </p>
                    <BookButton
                      category="EXPERIENCE"
                      itemName={name}
                      message={wa.experience({ name, duration: detail.duration, priceGhs: detail.fromGhs })}
                      source="experiences"
                      className="inline-flex h-11 items-center rounded-full bg-forest px-5 font-semibold text-cream transition-colors hover:bg-forest-700"
                    >
                      {t('experiencesPage.tile.book')}
                    </BookButton>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Free daily activities */}
      {railDays.length > 0 && (
        <section data-sky="golden" className="container-page pb-24 md:pb-32">
          <div className="grid gap-8 lg:grid-cols-12 mb-12">
            <div className="lg:col-span-6">
              <p className="eyebrow mb-5">{t('experiencesPage.daily.eyebrow')}</p>
              <h2 className="font-display text-display-md">{t('experiencesPage.daily.heading')}</h2>
            </div>
            <p className="lg:col-span-5 lg:col-start-8 text-lede opacity-85 self-end">{prose(t('experiencesPage.daily.intro'))}</p>
          </div>
          <DailyActivitiesRail days={railDays} freeLabel={t('experiencesPage.daily.free')} />
          <p className="mt-6 text-sm opacity-60">{prose(t('experiencesPage.daily.footnote'))}</p>
        </section>
      )}

      {/* Enhance your stay */}
      {allEnhancements.length > 0 && (
        <section data-sky="dusk" className="py-24 md:py-32">
          <div className="container-page">
            <div className="relative mb-16 overflow-hidden rounded-pebble aspect-[16/9] md:aspect-[21/8]">
              <Image src={media.drumCircle} alt="" fill sizes="100vw" className="object-cover branded-img" />
            </div>
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="eyebrow mb-5">{t('wellnessPage.enhance.eyebrow')}</p>
                <h2 className="font-display text-display-md text-balance">{t('wellnessPage.enhance.heading')}</h2>
                <p className="mt-5 text-lede opacity-85">{prose(t('wellnessPage.enhance.intro'))}</p>
              </div>
              <div className="lg:col-span-8 space-y-14">
                {Array.from(enhancementsByCategory.entries()).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="font-display text-2xl mb-2">{category}</h3>
                    <ul>
                      {items.map((item) => (
                        <li key={item.id} className="flex flex-col gap-3 border-t border-forest-900/15 py-5 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex gap-4">
                            <WaveMark className="mt-2 text-coral-700" />
                            <div>
                              <p className="font-semibold text-lg">{item.name}</p>
                              {item.description && <p className="mt-1 opacity-75">{item.description}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-5 pl-10 sm:pl-0">
                            {showEnhancementPrices && (
                              <p className="font-display text-xl whitespace-nowrap">
                                GHS {item.priceGhs.toLocaleString()}
                                {item.priceTo ? `–${item.priceTo.toLocaleString()}` : ''}
                                {item.priceNote ? <span className="block font-sans text-xs opacity-60">{item.priceNote}</span> : null}
                              </p>
                            )}
                            <BookButton
                              category="ENHANCEMENT"
                              itemName={item.name}
                              message={wa.enhancement({ name: item.name, priceGhs: item.priceGhs, priceTo: item.priceTo })}
                              source="experiences/enhance"
                              className="inline-flex h-10 shrink-0 items-center rounded-full px-4 text-sm font-semibold ring-1 ring-inset ring-forest-900/30 transition-colors hover:bg-forest-900 hover:text-cream"
                            >
                              {t('wellnessPage.enhance.enquire')}
                            </BookButton>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <SeaBand>
        <div className="container-page pt-6 max-w-4xl">
          <p className="font-display text-display-md text-balance">{prose(t('experiencesPage.buildDay'))}</p>
          <BookButton
            category="EXPERIENCE"
            itemName="Build Your Perfect Day"
            message={wa.customiseStay()}
            source="experiences/build-day"
            className="mt-10 inline-flex h-14 items-center rounded-full bg-sunshine px-8 font-semibold text-forest-900 transition-colors hover:bg-cream"
          >
            {t('experiencesPage.buildDay.cta')}
          </BookButton>
        </div>
      </SeaBand>
    </>
  );
}
