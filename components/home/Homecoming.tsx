'use client';

// Out at sea. The one section that is fully teal: the Welcome Home film,
// shown as a poster that becomes the film in place when you press play,
// and a line about the ocean set large enough to hear.

import { useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { SmoothImage as Image } from '@/components/shared/SmoothImage';
import { Tide } from '@/components/ui/Tide';
import { useT } from '@/lib/i18n';
import { prose } from '@/lib/content/media';

const VIDEO = '/media/video/kosa-welcome-home.mp4';
const POSTER = '/media/video/welcome-home-poster.webp';

export function Homecoming() {
  const { t } = useT();
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <section data-sky="sea" className="relative text-cream">
      <Tide above="var(--sky)" below="#00657F" band="#EEDDC2" echo size="lg" />
      <div className="bg-teal-600 pb-28 md:pb-40">
        <div className="container-page pt-10 md:pt-16">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end mb-12 md:mb-16">
            <div className="lg:col-span-7">
              <p className="eyebrow mb-5">{t('home.welcome.eyebrow')}</p>
              <h2 className="font-display text-display-lg text-balance">{t('home.welcome.heading')}</h2>
            </div>
            <p className="lg:col-span-5 text-lede text-cream/85 max-w-measure">{t('home.welcome.body')}</p>
          </div>

          <div className="relative aspect-video w-full overflow-hidden rounded-pebble bg-teal-800">
            {playing ? (
              <video ref={videoRef} src={VIDEO} poster={POSTER} controls autoPlay playsInline className="h-full w-full object-cover" />
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                aria-label={t('home.welcome.play')}
                className="group absolute inset-0 grid place-items-center"
              >
                <Image src={POSTER} alt="" fill sizes="(min-width:1280px) 1400px, 100vw" className="object-cover transition-transform duration-[2s] ease-tide group-hover:scale-[1.03]" />
                <span aria-hidden className="absolute inset-0 bg-teal-900/25 transition-colors duration-700 group-hover:bg-teal-900/10" />
                <span className="relative flex items-center gap-4 rounded-full bg-sunshine py-3 pl-3 pr-7 font-semibold text-forest-900 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] transition-transform duration-700 ease-tide group-hover:scale-105">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-forest-900 text-sunshine">
                    <Play size={18} fill="currentColor" />
                  </span>
                  {t('home.welcome.cta')}
                </span>
              </button>
            )}
          </div>

          <blockquote className="mt-24 md:mt-36 max-w-5xl">
            <p className="font-display font-display-wonk italic text-display-lg text-balance">{prose(t('quote.ocean'))}</p>
          </blockquote>
        </div>
      </div>
      <Tide above="#00657F" below="var(--sky)" band="#EEDDC2" size="md" />
    </section>
  );
}
