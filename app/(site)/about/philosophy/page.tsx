import type { Metadata } from 'next';
import { SmoothImage as Image } from '@/components/shared/SmoothImage';
import Link from 'next/link';
import { AdinkraIcon, type AdinkraName } from '@/components/shared/AdinkraIcon';
import { PageHero } from '@/components/shared/PageHero';
import { SeaBand } from '@/components/ui/SeaBand';
import { site } from '@/lib/site';
import { media, prose } from '@/lib/content/media';
import { cn } from '@/lib/utils';
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

const layers = [
  {
    n: '01',
    twi: 'Honam',
    en: 'The Body',
    glyph: 'denkyem',
    pillar: 'Breathe',
    body:
      'Soft linen on raffia beds · Salt-water plunges before breakfast · Massage with shea butter the kitchen also cooks with · We treat the body as the first room you stay in the one before the suite',
  },
  {
    n: '02',
    twi: 'Honhom',
    en: 'The Breath',
    glyph: 'denkyem',
    pillar: 'Breathe',
    body:
      'Sunrise yoga on the dune · Sound bowls at dusk · The rhythm of the surf at thirty-eight breaths per minute slower than yours when you arrive, the same as yours when you leave · Breath is the pace we keep',
  },
  {
    n: '03',
    twi: 'Adwene',
    en: 'The Mind',
    glyph: 'asetena',
    pillar: 'Live',
    body:
      'Books in the library curated by Ghanaian writers · No televisions in the rooms · A chess set on the verandah · The mind is given less to chew on, so it can taste again the Atlantic, the palm wine, the conversation across the table',
  },
  {
    n: '04',
    twi: 'Honhom Kronkron',
    en: 'The Knowing',
    glyph: 'knonsonkonson',
    pillar: 'Belong',
    body:
      'The quiet sense of place that arrives on the second morning · The fishermen wave by name · The cook knows you take ginger in your tea · Knowing is what unhurried hospitality grows on its own we just leave it space',
  },
  {
    n: '05',
    twi: 'Anigye',
    en: 'The Joy',
    glyph: 'community',
    pillar: 'Together',
    body:
      'Drumming circles where guests join the rhythm without asking permission · The kitchen feast on Friday · Children of the village teaching guests to climb a coconut palm · Joy is communal here · It is not entertainment it is the by-product of belonging',
  },
];

const IMAGES = [media.gallery.wellness2, media.gallery.wellness3, media.gallery.resort10, media.gallery.resort11, media.gallery.resort12];
const LAYER_SKY: SkyName[] = ['dawn', 'morning', 'noon', 'golden', 'dusk'];

export default function PhilosophyPage() {
  return (
    <>
      <PageHero
        eyebrow="Our philosophy"
        title="The five layers of self"
        subtitle="A quiet, Akan-rooted framework woven into every part of the stay: body, breath, mind, knowing, joy."
        image={media.gallery.beach1}
        sky="dawn"
        height="lg"
      />

      <section data-sky="dawn" className="container-page py-20 md:py-28 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow mb-5">Where we begin</p>
          <h2 className="font-display text-display-md text-balance">A resort, but really a frame for paying attention</h2>
        </div>
        <p className="lg:col-span-6 lg:col-start-7 text-lede opacity-90 self-end">
          The brand guide that grew into KoSa carries a single line we kept returning to:{' '}
          <em>every piece of content should speak to the surrounds of KoSa and the five layers of self</em>. We took it as instruction. The five layers, drawn from Akan thought and gently held, are the lens we use to plan a morning, to lay a table, to choose the linen. They are not amenities. They are the questions the property asks the guest:{' '}
          <em>how is your body, how is your breath, how is your mind, what do you know now, and where is your joy.</em>
        </p>
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
          <p className="eyebrow mb-6">And then you arrive</p>
          <h2 className="font-display text-display-lg text-balance">The five layers don&apos;t need to be learned. They need to be remembered.</h2>
          <p className="mt-8 text-lede text-cream/85 max-w-2xl">
            We don&apos;t teach the philosophy. We design the days so that by the third morning, you&apos;ve found it on your own: in the shape of the cup, the slowness of breakfast, the way the linen smells of the line it dried on.
          </p>
          <p className="mt-10 font-display italic text-3xl text-sunshine">Life is better at the beach.</p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a href="/book" className="inline-flex h-14 items-center rounded-full bg-sunshine px-8 font-semibold text-forest-900 transition-colors hover:bg-cream">
              Plan your stay
            </a>
            <Link href="/about" className="link-tide text-cream/85">More about KoSa</Link>
          </div>
        </div>
      </SeaBand>
    </>
  );
}
