import type { Metadata } from 'next';
import { SmoothImage as Image } from '@/components/shared/SmoothImage';
import { WellnessEnquiryForm } from '@/components/marketing/WellnessEnquiryForm';
import { BookButton } from '@/components/shared/BookButton';
import { Tide } from '@/components/ui/Tide';
import { SeaBand } from '@/components/ui/SeaBand';
import { WaveMark } from '@/components/ui/WaveMark';
import { prose } from '@/lib/content/media';
import { cn } from '@/lib/utils';
import { TreatmentsExplorer, type TreatmentCard } from '@/components/wellness/TreatmentsExplorer';
import { RetreatRhythm } from '@/components/wellness/RetreatRhythm';
import { getT } from '@/lib/i18n/server';
import { listPublicTreatments } from '@/lib/cms/treatments';
import { getSetting } from '@/lib/cms/settings';
import {
  TREATMENTS_FALLBACK,
  treatmentPriceGhs,
  ESCAPES,
  RETREAT_TIERS,
  formatGhs,
  waPrefill,
  type EscapeKey,
} from '@/lib/pricing';

export const metadata: Metadata = {
  title: 'Wellness',
  description:
    'Here is your permission to pause, Restore your energy, and just be. Spa, coaching, yoga by the sea, a herbal tea bar and slow days at KoSa Beach Resort, Elmina, Ghana.',
};

export const dynamic = 'force-dynamic';

const BASE = 'https://ubsgvfouroqkgqufzeat.supabase.co/storage/v1/object/public/kosa-public';
// New edited wellness photography (media/wellness/, June 2026).
const WELLNESS = `${BASE}/media/wellness`;

const HERO_IMG = `${WELLNESS}/banner.webp`;
const DAY_IMG = `${WELLNESS}/wellness-day-v2.webp`;

// Each offering becomes a full-width, magazine-style spread (image one side,
// copy the other), alternating left/right down the page. Each has one grounding
// sensory sentence so the visitor can picture being there.
const OFFERINGS = [
  { key: 'journeys', titleKey: 'wellnessPage.journeys.title', bodyKey: 'wellnessPage.journeys.body', senseKey: 'wellnessPage.journeys.sense', img: `${WELLNESS}/wellness-journeys-v2.webp` },
  { key: 'coaching', titleKey: 'wellnessPage.coaching.title', bodyKey: 'wellnessPage.coaching.body', senseKey: 'wellnessPage.coaching.sense', img: `${WELLNESS}/wellness-coaching-v2.webp` },
  { key: 'spa', titleKey: 'wellnessPage.spa.title', bodyKey: 'wellnessPage.spa.body', senseKey: 'wellnessPage.spa.sense', img: `${WELLNESS}/spa-services.webp` },
  { key: 'tea', titleKey: 'wellnessPage.tea.title', bodyKey: 'wellnessPage.tea.body', senseKey: 'wellnessPage.tea.sense', img: `${WELLNESS}/kosa-tea-bar.webp` },
  { key: 'yoga', titleKey: 'wellnessPage.yoga.title', bodyKey: 'wellnessPage.yoga.body', senseKey: 'wellnessPage.yoga.sense', img: `${WELLNESS}/yoga-by-the-sea.webp` },
] as const;

// A flowing day, not a table.
const DAY = [
  { timeKey: 'wellnessPage.day.s1.time', textKey: 'wellnessPage.day.s1.text' },
  { timeKey: 'wellnessPage.day.s2.time', textKey: 'wellnessPage.day.s2.text' },
  { timeKey: 'wellnessPage.day.s3.time', textKey: 'wellnessPage.day.s3.text' },
  { timeKey: 'wellnessPage.day.s4.time', textKey: 'wellnessPage.day.s4.text' },
  { timeKey: 'wellnessPage.day.s5.time', textKey: 'wellnessPage.day.s5.text' },
  { timeKey: 'wellnessPage.day.s6.time', textKey: 'wellnessPage.day.s6.text' },
  { timeKey: 'wellnessPage.day.s7.time', textKey: 'wellnessPage.day.s7.text' },
] as const;

// Per-category fallback, only used if a treatment ever loses its own CMS image
// (all treatments now carry their own photo, editable at /admin/wellness).
const CATEGORY_IMG: Record<string, string> = {
  'KoSa Health Spa': `${WELLNESS}/spa-services.webp`,
  'O2 Wellness': `${WELLNESS}/wellness-journeys.webp`,
};
const DEFAULT_TREATMENT_IMG = `${WELLNESS}/spa-services.webp`;

export default async function WellnessPage() {
  const { t } = getT();
  const [cmsTreatments, pricing] = await Promise.all([
    listPublicTreatments(),
    getSetting('pricing'),
  ]);
  const showWellnessPrices = !pricing.hideWellnessPrices;

  // The CMS helper returns placeholder rows when the database is empty; prefer
  // the real spa menu in that case.
  const realTreatments = cmsTreatments.filter((tr) => !tr.id.startsWith('fallback-'));
  const treatments = (realTreatments.length ? realTreatments : TREATMENTS_FALLBACK).map((tr) => ({
    id: 'id' in tr ? tr.id : tr.slug,
    slug: tr.slug,
    name: tr.name,
    description: 'description' in tr ? tr.description ?? null : null,
    durationMin: tr.durationMin,
    category: tr.category ?? null,
    image: 'image' in tr ? tr.image : null,
    priceGhs: treatmentPriceGhs(tr.slug, 'price' in tr ? tr.price : undefined),
  }));

  // Collapse duplicate-duration entries into one card with variants.
  const baseName = (name: string) => name.replace(/\s*\(\s*\d+\s*min\s*\)\s*$/i, '').trim();
  const treatmentGroups: TreatmentCard[] = (() => {
    const map = new Map<string, TreatmentCard>();
    for (const tr of treatments) {
      const name = baseName(tr.name);
      const key = `${tr.category ?? ''}::${name.toLowerCase()}`;
      const existing = map.get(key);
      if (existing) {
        existing.variants.push({ durationMin: tr.durationMin, priceGhs: tr.priceGhs });
        if (!existing.description && tr.description) existing.description = tr.description;
      } else {
        map.set(key, {
          key,
          name,
          category: tr.category,
          description: tr.description,
          image: tr.image ?? (tr.category ? CATEGORY_IMG[tr.category] : null) ?? DEFAULT_TREATMENT_IMG,
          variants: [{ durationMin: tr.durationMin, priceGhs: tr.priceGhs }],
        });
      }
    }
    for (const g of map.values()) g.variants.sort((a, b) => a.durationMin - b.durationMin);
    return Array.from(map.values());
  })();

  const packageNames = [
    ...(Object.keys(ESCAPES) as EscapeKey[]).map((k) => `${ESCAPES[k].name} Escape (1 Day)`),
    'The Signature Rotation Retreat',
    'Tide Reset Retreat — For Him',
    'Saltwater Bloom Retreat — For Her',
    'Private Wellness Consultation (Design My Own)',
  ];
  const programmes = [
    ...packageNames,
    ...OFFERINGS.map((o) => t(o.titleKey)),
    ...treatmentGroups.map((tr) => tr.name),
  ];

  return (
    <>
      {/* Arrival: one line on the photograph, nothing else */}
      <section data-sky="dawn" className="relative h-[100svh] min-h-[600px] w-full overflow-hidden text-cream">
        <Image src={HERO_IMG} alt="" fill priority sizes="100vw" className="object-cover branded-img" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,31,39,0.35)_0%,rgba(0,31,39,0)_35%,rgba(0,31,39,0.55)_100%)]" />
        <div className="relative h-full container-page flex flex-col justify-end pb-40 md:pb-48">
          <p className="eyebrow mb-6">{t('nav.wellness')}</p>
          <h1 className="font-display text-display-xl max-w-5xl text-balance">{prose(t('wellnessPage.hero.line'))}</h1>
        </div>
        <Tide below="var(--sky)" echo size="lg" className="absolute bottom-[-1px] left-0" />
      </section>

      <section data-sky="dawn" className="container-page py-20 md:py-28">
        <p className="eyebrow mb-8">{t('wellnessPage.approach.eyebrow')}</p>
        <p className="font-display text-display-md max-w-5xl text-balance">{prose(t('wellnessPage.approach.body1'))}</p>
      </section>

      {/* Offerings as alternating spreads, each with one sensory line */}
      <section data-sky="morning" className="container-page pb-10">
        <ol>
          {OFFERINGS.map((o, i) => (
            <li key={o.key} className="grid gap-8 py-14 md:py-20 lg:grid-cols-12 lg:gap-14 lg:items-center border-t border-forest/10">
              <div className={cn('relative aspect-[4/5] md:aspect-[4/3] overflow-hidden lg:col-span-7', i % 2 ? 'lg:order-2 rounded-pebble' : 'rounded-t-[12rem] rounded-b-pebble')}>
                <Image src={o.img} alt={t(o.titleKey)} fill sizes="(min-width:1024px) 58vw, 100vw" className="object-cover branded-img" />
              </div>
              <div className={cn('lg:col-span-5', i % 2 && 'lg:order-1')}>
                <p className="eyebrow">{t('wellnessPage.offerings.eyebrow')}</p>
                <h2 className="mt-4 font-display text-display-md">{t(o.titleKey)}</h2>
                <p className="mt-5 text-lede opacity-85">{prose(t(o.bodyKey))}</p>
                <p className="mt-6 font-display italic text-xl opacity-75 border-l-2 border-coral pl-5">{prose(t(o.senseKey))}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* A wellness day, with the palm grove keeping you company */}
      <section data-sky="noon" className="container-page py-24 md:py-32">
        <div className="max-w-3xl mb-14">
          <p className="eyebrow mb-5">{t('wellnessPage.day.eyebrow')}</p>
          <h2 className="font-display text-display-md">{t('wellnessPage.day.heading')}</h2>
          <p className="mt-5 text-lede opacity-85">{prose(t('wellnessPage.day.intro'))}</p>
        </div>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-start">
          <ol className="lg:col-span-7">
            {DAY.map((step) => (
              <li key={step.timeKey} className="grid gap-2 border-t border-forest/15 py-6 md:grid-cols-[9rem_1fr] md:gap-8">
                <span className="font-display text-2xl tabular-nums">{t(step.timeKey)}</span>
                <p className="text-lg leading-relaxed opacity-90">{prose(t(step.textKey))}</p>
              </li>
            ))}
          </ol>
          <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-28">
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-pebble">
              <Image src={DAY_IMG} alt={t('wellnessPage.day.heading')} fill sizes="38vw" className="object-cover branded-img" />
            </div>
          </div>
        </div>
      </section>

      {/* One-day escapes */}
      <section data-sky="golden" className="container-page py-24 md:py-32">
        <div className="grid gap-8 lg:grid-cols-12 mb-14">
          <div className="lg:col-span-6">
            <p className="eyebrow mb-5">One-day escapes</p>
            <h2 className="font-display text-display-md">Signature day journeys</h2>
          </div>
          <p className="lg:col-span-5 lg:col-start-8 text-lede opacity-85 self-end">
            Three ways to spend a single unhurried day at O2. Each includes treatments, a fresh juice elixir where noted, and a wholesome meal.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {(Object.keys(ESCAPES) as EscapeKey[]).map((key, i) => {
            const esc = ESCAPES[key];
            return (
              <article key={key} className={cn('flex flex-col rounded-pebble p-7 md:p-8', i === 1 ? 'bg-forest text-cream' : 'bg-cream/70')}>
                <p className="text-sm opacity-70">{esc.theme}</p>
                <h3 className="mt-2 font-display text-4xl">{esc.name}</h3>
                <ul className="mt-6 flex-1">
                  {esc.items.map((item) => (
                    <li key={item.name} className="flex items-baseline gap-3 py-2 text-[0.95rem]">
                      <span>{item.name}</span>
                      <span aria-hidden className="flex-1 translate-y-[-4px] border-b border-dotted border-current opacity-30" />
                      <span className="tabular-nums opacity-80">{formatGhs(item.ghs)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-baseline gap-3">
                  <span className="font-display text-4xl">{formatGhs(esc.priceGhs)}</span>
                  <span className="text-sm line-through opacity-50">{formatGhs(esc.originalGhs)}</span>
                </div>
                <BookButton
                  category="PACKAGE"
                  itemName={`${esc.name} Escape`}
                  message={waPrefill.escape(esc.name)}
                  source="wellness/escapes"
                  className={cn(
                    'mt-6 inline-flex h-12 items-center justify-center rounded-full px-6 font-semibold transition-colors',
                    i === 1 ? 'bg-sunshine text-forest-900 hover:bg-cream' : 'bg-forest text-cream hover:bg-forest-700',
                  )}
                >
                  Reserve this escape
                </BookButton>
              </article>
            );
          })}
        </div>
      </section>

      {/* Multi-day retreats, out at sea */}
      <SeaBand>
        <div className="container-page pt-6">
          <div className="grid gap-8 lg:grid-cols-12 mb-14">
            <div className="lg:col-span-6">
              <p className="eyebrow mb-5">Multi-day retreats</p>
              <h2 className="font-display text-display-md">Give it room to breathe</h2>
            </div>
            <p className="lg:col-span-5 lg:col-start-8 text-lede text-cream/85 self-end">
              The Signature Rotation carries Relaxation, Detox and Beauty days across a longer stay, with room and full board included throughout.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3 mb-20">
            {RETREAT_TIERS.map((tier) => (
              <div key={tier.days} className="rounded-pebble bg-cream/[0.08] ring-1 ring-inset ring-cream/15 p-7">
                <p className="font-display text-6xl leading-none">
                  {tier.days}
                  <span className="ml-2 font-sans text-base text-cream/70">days</span>
                </p>
                <p className="mt-3 text-cream/70">{tier.rotation}</p>
                <p className="mt-6 font-display text-3xl text-sunshine">{formatGhs(tier.spaGhs)}</p>
                <p className="mt-1 text-sm text-cream/65">{formatGhs(tier.totalGhs)} total, including {tier.days} nights</p>
              </div>
            ))}
          </div>
          <RetreatRhythm />
          <p className="mt-6 text-sm text-cream/60">The Signature Rotation extends to 7 or 10-day journeys; see the tiers above.</p>
        </div>
      </SeaBand>

      {/* Treatments */}
      {treatmentGroups.length > 0 && (
        <section data-sky="golden" className="container-page py-24 md:py-32">
          <div className="max-w-3xl mb-10">
            <h2 className="font-display text-display-md">{t('wellnessPage.treatmentsHeading')}</h2>
            <p className="mt-5 text-lede opacity-85">{prose(t('wellnessPage.treatmentsIntro'))}</p>
          </div>
          <TreatmentsExplorer treatments={treatmentGroups} showPrices={showWellnessPrices} labels={{ all: t('rooms.filter.all'), book: t('wellnessPage.treatment.book') }} />
        </section>
      )}

      {/* Design your own */}
      <section data-sky="dusk" className="container-page py-24 md:py-32">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-5">Beyond the menu</p>
            <h2 className="font-display text-display-lg text-balance">Or, let&rsquo;s design yours</h2>
            <p className="mt-6 text-lede opacity-85">
              Not every guest fits a set journey. Sit with our wellness team for a private consultation, and we&rsquo;ll build something around what you actually need, pulled from our full treatment menu.
            </p>
            <ol className="mt-10">
              {[
                { h: 'Consult', p: 'A private session to talk through goals, sensitivities, and time on property.' },
                { h: 'Design', p: 'We build your itinerary from the same menu behind every package above.' },
                { h: 'Arrive and exhale', p: 'Your rhythm is ready when you check in, with nothing left to plan.' },
              ].map((s, i) => (
                <li key={s.h} className="flex gap-5 border-t border-forest-900/15 py-5">
                  <span className="font-display text-3xl tabular-nums opacity-60">{i + 1}</span>
                  <div>
                    <h3 className="font-semibold text-lg">{s.h}</h3>
                    <p className="mt-1 opacity-75">{s.p}</p>
                  </div>
                </li>
              ))}
            </ol>
            <BookButton
              category="OTHER"
              itemName="Private Wellness Consultation"
              message={waPrefill.consultation()}
              source="wellness/closing"
              className="mt-8 inline-flex h-14 items-center rounded-full bg-forest-900 px-8 font-semibold text-cream transition-colors hover:bg-forest"
            >
              Book a consultation
            </BookButton>
            <p className="mt-4 flex items-center gap-3 text-sm opacity-75">
              <WaveMark className="text-coral-700" /> Private Wellness Consultation, GHS 200, credited toward your custom itinerary.
            </p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <WellnessEnquiryForm programmes={programmes} />
          </div>
        </div>
      </section>
    </>
  );
}
