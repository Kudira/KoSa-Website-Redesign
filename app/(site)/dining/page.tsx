import type { Metadata } from 'next';
import { SmoothImage as Image } from '@/components/shared/SmoothImage';
import { PageHero } from '@/components/shared/PageHero';
import { SeaBand } from '@/components/ui/SeaBand';
import { getT } from '@/lib/i18n/server';
import { listPublicDiningVenues } from '@/lib/cms/dining';
import { listPublicGallery } from '@/lib/cms/gallery';
import { DiningMenu } from '@/components/dining/DiningMenu';
import { FoodGallery } from '@/components/dining/FoodGallery';
import { BookButton } from '@/components/shared/BookButton';
import { waPrefill } from '@/lib/pricing';
import { media, prose, sentences } from '@/lib/content/media';
import { cn } from '@/lib/utils';
import type { SkyName } from '@/components/ui/Sky';

export const metadata: Metadata = {
  title: 'Dining',
  description:
    'Food the way the coast intended. Fresh, local, Ghanaian cooking: restaurant, bar, breakfast and private dining at KoSa Beach Resort.',
};

export const dynamic = 'force-dynamic';

// Ordered through the day: breakfast, the restaurant, the bar at sundown.
const SECTIONS = [
  { key: 'breakfast', sky: 'morning', titleKey: 'diningPage.breakfast.title', bodyKey: 'diningPage.breakfast.body', hoursKey: 'diningPage.breakfast.hours', image: media.dining.breakfast },
  {
    key: 'restaurant',
    sky: 'noon',
    titleKey: 'diningPage.restaurant.title',
    bodyKey: 'diningPage.restaurant.body',
    hoursKey: 'diningPage.restaurant.hours',
    image: media.dining.restaurant,
    cta: { labelKey: 'diningPage.restaurant.cta', itemName: 'Table reservation', message: waPrefill.reserveTable() },
  },
  { key: 'bar', sky: 'golden', titleKey: 'diningPage.bar.title', nameKey: 'diningPage.bar.name', bodyKey: 'diningPage.bar.body', hoursKey: 'diningPage.bar.hours', image: media.dining.bar },
] as const;

export default async function DiningPage() {
  const { t } = getT();
  const [venues, galleryItems] = await Promise.all([listPublicDiningVenues(), listPublicGallery()]);
  const foodItems = galleryItems.filter((i) => i.category === 'dining');
  const intro = sentences(t('diningPage.intro'));
  const menus = venues.filter((v) => v.sections.some((s) => s.items.length));

  return (
    <>
      <PageHero eyebrow={t('nav.dine')} title={t('diningPage.headline')} subtitle={intro[0]} image={media.dining.hero} sky="morning" height="lg">
        <BookButton
          category="DINING"
          itemName="Table reservation"
          message={waPrefill.reserveTable()}
          source="dining/intro"
          className="inline-flex h-12 items-center rounded-full bg-teal px-7 font-semibold text-cream transition-colors hover:bg-teal-700"
        >
          {t('diningPage.reserveCta')}
        </BookButton>
      </PageHero>

      {intro.length > 1 && (
        <section data-sky="morning" className="container-page py-20 md:py-28">
          <p className="font-display text-display-sm max-w-4xl text-balance">{prose(intro.slice(1).join(' · '))}</p>
        </section>
      )}

      {SECTIONS.map((s, i) => (
        <section key={s.key} data-sky={s.sky as SkyName} className="container-page py-14 md:py-20">
          <article className="grid gap-8 lg:grid-cols-12 lg:gap-14 lg:items-center">
            <div className={cn('relative aspect-[4/3] overflow-hidden lg:col-span-7', i % 2 ? 'lg:order-2 rounded-pebble' : 'rounded-t-[12rem] rounded-b-pebble')}>
              <Image src={s.image} alt={t(s.titleKey)} fill sizes="(min-width:1024px) 58vw, 100vw" className="object-cover branded-img" />
            </div>
            <div className={cn('lg:col-span-5', i % 2 && 'lg:order-1')}>
              <p className="eyebrow">{t(s.hoursKey)}</p>
              <h2 className="mt-4 font-display text-display-md">{t(s.titleKey)}</h2>
              {'nameKey' in s && <p className="mt-2 font-display italic text-2xl opacity-80">{t(s.nameKey)}</p>}
              <p className="mt-5 text-lede opacity-85">{prose(t(s.bodyKey))}</p>
              {'cta' in s && (
                <BookButton
                  category="DINING"
                  itemName={s.cta.itemName}
                  message={s.cta.message}
                  source={`dining/${s.key}`}
                  className="mt-8 inline-flex h-12 items-center rounded-full bg-forest px-7 font-semibold text-cream transition-colors hover:bg-forest-700"
                >
                  {t(s.cta.labelKey)}
                </BookButton>
              )}
            </div>
          </article>
        </section>
      ))}

      {/* Private and beach dining, at sea */}
      <SeaBand className="mt-16">
        <div className="container-page grid gap-12 pt-6 lg:grid-cols-12 lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-pebble lg:col-span-7">
            <Image src={media.dining.privateBeach} alt={t('diningPage.private.title')} fill sizes="(min-width:1024px) 58vw, 100vw" className="object-cover branded-img" />
          </div>
          <div className="lg:col-span-5">
            <p className="eyebrow">{t('diningPage.private.title')}</p>
            <h2 className="mt-4 font-display text-display-md">{t('diningPage.private.lead')}</h2>
            <p className="mt-5 text-lede text-cream/85">{prose(t('diningPage.private.body'))}</p>
            <BookButton
              category="DINING"
              itemName="Private & beach dining"
              message={waPrefill.privateDining()}
              source="dining/private"
              className="mt-8 inline-flex h-14 items-center rounded-full bg-sunshine px-8 font-semibold text-forest-900 transition-colors hover:bg-cream"
            >
              {t('diningPage.private.cta')}
            </BookButton>
          </div>
        </div>
      </SeaBand>

      <FoodGallery items={foodItems} />

      {menus.length > 0 && (
        <section data-sky="dusk" className="py-24 md:py-32">
          <div className="container-page space-y-24">
            {menus.map((v) => (
              <div key={v.id}>
                <div className="mb-10 flex flex-col gap-2 md:flex-row md:items-end md:justify-between border-b border-forest-900/20 pb-8">
                  <div>
                    <h2 className="font-display text-display-md">{v.name}</h2>
                    {v.tagline && <p className="mt-2 text-lede opacity-75">{v.tagline}</p>}
                  </div>
                  {v.hours && <p className="opacity-70">{v.hours}</p>}
                </div>
                <DiningMenu sections={v.sections} labels={{ all: t('rooms.filter.all'), popular: t('diningPage.popular') }} />
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
