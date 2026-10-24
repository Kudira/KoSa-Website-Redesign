import type { Metadata } from 'next';
import { MessageCircle } from 'lucide-react';
import { SmoothImage as Image } from '@/components/shared/SmoothImage';
import { PageHero } from '@/components/shared/PageHero';
import { SeaBand } from '@/components/ui/SeaBand';
import { Tide } from '@/components/ui/Tide';
import { BookButton } from '@/components/shared/BookButton';
import { getT } from '@/lib/i18n/server';
import { site } from '@/lib/site';
import { waPrefill } from '@/lib/pricing';
import { media, prose } from '@/lib/content/media';

export const metadata: Metadata = {
  title: 'Our Story',
  description:
    'Two decades by the sea. The story and values behind KoSa Beach Resort, part of the Akwaaba Stays Hospitality Group.',
};

export const dynamic = 'force-dynamic';

const VALUES = [
  { titleKey: 'aboutPage.values.authenticity.title', bodyKey: 'aboutPage.values.authenticity.body' },
  { titleKey: 'aboutPage.values.community.title', bodyKey: 'aboutPage.values.community.body' },
  { titleKey: 'aboutPage.values.wellness.title', bodyKey: 'aboutPage.values.wellness.body' },
  { titleKey: 'aboutPage.values.sustainability.title', bodyKey: 'aboutPage.values.sustainability.body' },
  { titleKey: 'aboutPage.values.legacy.title', bodyKey: 'aboutPage.values.legacy.body' },
] as const;

// A fixed scatter of stars for the turtle section.
const STARS = Array.from({ length: 28 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 91.7 + n * 47.3) * 9301.17) % 1 + 1) % 1;
  return { x: r(1) * 100, y: r(2) * 55, s: r(3) > 0.7 ? 2.5 : 1.5 };
});

export default function AboutPage() {
  const { t } = getT();
  const wa = `${site.socials.whatsapp}?text=${encodeURIComponent(site.contact.whatsappMessage)}`;

  return (
    <>
      <PageHero eyebrow={t('nav.story')} title={t('about.title')} image={media.about} sky="dawn" height="lg" />

      {/* The story */}
      <section data-sky="dawn" className="container-page py-20 md:py-28 grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="font-display text-display-sm text-pretty">{prose(t('aboutPage.opening'))}</p>
          <div className="mt-10 space-y-6 text-lede opacity-85 max-w-prose">
            <p>{prose(t('aboutPage.enrichedSetting'))}</p>
            <p>{prose(t('aboutPage.enrichedEco'))}</p>
            <p>{prose(t('aboutPage.continued'))}</p>
          </div>
        </div>
        <div className="lg:col-span-4 lg:col-start-9">
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-pebble lg:sticky lg:top-28">
            <Image src={media.gallery.beach0} alt={t('alt.aboutSea')} fill sizes="(min-width:1024px) 32vw, 92vw" className="object-cover branded-img" />
          </div>
        </div>
      </section>

      {/* Mission and vision, from the brand guide */}
      <SeaBand>
        <div className="container-page grid gap-16 pt-6 md:grid-cols-2 md:gap-12">
          <div>
            <p className="eyebrow mb-6">{t('about.missionLabel')}</p>
            <p className="font-display text-display-sm text-balance">{t('about.mission')}</p>
          </div>
          <div className="md:mt-28">
            <p className="eyebrow mb-6">{t('about.visionLabel')}</p>
            <p className="font-display text-display-sm text-balance">{t('about.vision')}</p>
          </div>
        </div>
      </SeaBand>

      {/* Values */}
      <section data-sky="morning" className="container-page py-24 md:py-32">
        <h2 className="font-display text-display-lg mb-12">{t('aboutPage.values')}</h2>
        <ul>
          {VALUES.map((v) => (
            <li key={v.titleKey} className="grid gap-3 border-t border-forest/15 py-8 md:grid-cols-12 md:gap-10 md:py-10">
              <h3 className="font-display text-display-sm md:col-span-5">{t(v.titleKey)}</h3>
              <p className="text-lede opacity-85 md:col-span-6 md:col-start-7">{prose(t(v.bodyKey))}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* The sea turtle project, at night */}
      <section data-sky="night" className="relative text-cream">
        <Tide above="var(--sky)" below="#032A36" echo size="lg" />
        <div className="relative overflow-hidden bg-night py-20 md:py-32">
        <div aria-hidden className="absolute inset-0">
          {STARS.map((s, i) => (
            <span key={i} className="absolute rounded-full bg-cream motion-safe:animate-twinkle" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${(i % 7) * 0.7}s` }} />
          ))}
        </div>
        <div className="relative container-page grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <p className="eyebrow mb-5">Wild Seas Conservation Ghana</p>
            <h2 className="font-display text-display-lg text-balance">{t('aboutPage.seaTurtle.title')}</h2>
            <p className="mt-6 text-lede text-cream/85">{prose(t('aboutPage.seaTurtle.body'))}</p>
            <BookButton
              category="EXPERIENCE"
              itemName="Sea Turtle Night Walk"
              message={waPrefill.turtleWalk()}
              source="about/turtles"
              className="mt-9 inline-flex h-14 items-center rounded-full bg-sand px-8 font-semibold text-night transition-colors hover:bg-cream"
            >
              {t('aboutPage.seaTurtle.cta')}
            </BookButton>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <div className="relative aspect-[4/5] overflow-hidden rounded-pebble">
              <Image src={media.gallery.beach11} alt="" fill sizes="(min-width:1024px) 38vw, 92vw" className="object-cover branded-img brightness-[0.8]" />
            </div>
          </div>
        </div>
        </div>
        <Tide above="#032A36" below="var(--sky)" size="md" />
      </section>

      {/* Come and see */}
      <section data-sky="dusk" className="container-page py-24 md:py-36">
        <h2 className="font-display text-display-xl max-w-4xl text-balance">{t('aboutPage.closing.headline')}</h2>
        <p className="mt-6 text-lede opacity-85 max-w-xl">{prose(t('aboutPage.closing.body'))}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <a href={site.bookingUrl} target="_blank" rel="noreferrer" className="inline-flex h-14 items-center rounded-full bg-forest-900 px-8 font-semibold text-cream transition-colors hover:bg-forest">
            {t('aboutPage.closing.ctaBook')}
          </a>
          <a href={wa} target="_blank" rel="noreferrer" className="inline-flex h-14 items-center gap-2.5 rounded-full px-7 font-semibold ring-1 ring-inset ring-forest-900/30 transition-colors hover:bg-forest-900 hover:text-cream">
            <MessageCircle size={18} aria-hidden /> {t('aboutPage.closing.ctaGet')}
          </a>
        </div>
      </section>
    </>
  );
}
