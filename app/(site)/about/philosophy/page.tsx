import type { Metadata } from 'next';
import { SmoothImage as Image } from '@/components/shared/SmoothImage';
import Link from 'next/link';
import { AdinkraIcon, type AdinkraName } from '@/components/shared/AdinkraIcon';
import { PageHero } from '@/components/shared/PageHero';
import { SeaBand } from '@/components/ui/SeaBand';
import { site } from '@/lib/site';
import { media, prose } from '@/lib/content/media';
import { cn } from '@/lib/utils';
import { pageText } from '@/lib/content/page-text';
import { loadContent } from '@/lib/content/load';
import type { SkyName } from '@/components/ui/Sky';

export const metadata: Metadata = {
  title: 'The Five Layers of Self KoSa Philosophy',
  description:
    'KoSa Beach Resort is built on a quiet framework: the five layers of self · Body, breath, mind, knowing, joy the Akan-rooted lens we use to design every stay',
  alternates: { canonical: '/about/philosophy' },
  openGraph: {
    title: 'The Five Layers of Self KoSa',
    description: 'A quiet framework rooted in Akan thought, woven into every part of the resort',
    type: 'article',
  },
};

const LAYER_META = [
  { n: '01', glyph: 'denkyem', pillar: 'Breathe' },
  { n: '02', glyph: 'denkyem', pillar: 'Breathe' },
  { n: '03', glyph: 'asetena', pillar: 'Live' },
  { n: '04', glyph: 'knonsonkonson', pillar: 'Belong' },
  { n: '05', glyph: 'community', pillar: 'Together' },
];

const IMAGES = [media.gallery.wellness2, media.gallery.wellness3, media.gallery.resort10, media.gallery.resort11, media.gallery.resort12];
const LAYER_SKY: SkyName[] = ['dawn', 'morning', 'noon', 'golden', 'dusk'];

export const dynamic = 'force-dynamic';

export default async function PhilosophyPage() {
  await loadContent();
  const c = pageText.philosophy;
  const layers = LAYER_META.map((m, i) => {
    const n = i + 1;
    const pick = (f: 'Twi' | 'Name' | 'Body') => c[`layer${n}${f}` as keyof typeof c] as string;
    return { ...m, twi: pick('Twi'), en: pick('Name'), body: pick('Body') };
  });
  return (
    <>
      <PageHero
        eyebrow={c.eyebrow}
        title={c.title}
        subtitle={c.subtitle}
        image={media.gallery.beach1}
        sky="dawn"
        height="lg"
      />

      <section data-sky="dawn" className="container-page py-20 md:py-28 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow mb-5">{c.introEyebrow}</p>
          <h2 className="font-display text-display-md text-balance">{c.introHeading}</h2>
        </div>
        <p className="lg:col-span-6 lg:col-start-7 text-lede opacity-90 self-end">{c.introBody}</p>
      </section>

      {layers.map((layer, i) => (
        <section key={layer.n} data-sky={LAYER_SKY[i]} aria-labelledby={`layer-${layer.n}`} className="container-page py-16 md:py-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16 lg:items-center">
            <div className={cn('relative lg:col-span-5', i % 2 && 'lg:order-2 lg:col-start-8')}>
              <div className={cn('relative aspect-[4/5] overflow-hidden', i % 2 ? 'rounded-pebble' : 'rounded-t-full rounded-b-pebble')}>
                <Image src={IMAGES[i]} alt={`A scene from KoSa evoking ${layer.en.toLowerCase()}`} fill sizes="(min-width:1024px) 40vw, 92vw" className="object-cover branded-img" />
              </div>
              <AdinkraIcon name={layer.glyph as AdinkraName} size={72} className="absolute -bottom-6 right-6 text-coral" />
            </div>
            <div className={cn('lg:col-span-6', i % 2 ? 'lg:order-1' : 'lg:col-start-7')}>
              <p className="eyebrow">
                Layer {Number(layer.n)} of 5, {layer.pillar.toLowerCase()}
              </p>
              <h2 id={`layer-${layer.n}`} className="mt-5 font-display text-display-lg leading-none">
                {layer.twi}
              </h2>
              <p className="mt-3 font-display italic text-3xl opacity-75">{layer.en}</p>
              <p className="mt-8 text-lede opacity-90 max-w-xl">{prose(layer.body)}</p>
            </div>
          </div>
        </section>
      ))}

      <SeaBand className="mt-16">
        <div className="container-page pt-6 max-w-4xl">
          <p className="eyebrow mb-6">{c.closingEyebrow}</p>
          <h2 className="font-display text-display-lg text-balance">{c.closingHeading}</h2>
          <p className="mt-8 text-lede text-cream/85 max-w-2xl">{c.closingBody}</p>
          <p className="mt-10 font-display italic text-3xl text-sunshine">{c.closingLine}</p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a href="/book" className="inline-flex h-14 items-center rounded-full bg-sunshine px-8 font-semibold text-forest-900 transition-colors hover:bg-cream">
              {c.closingButton}
            </a>
            <Link href="/about" className="link-tide text-cream/85">{c.closingLink}</Link>
          </div>
        </div>
      </SeaBand>
    </>
  );
}
