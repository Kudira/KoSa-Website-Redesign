'use client';

// Arrival. The resort film (or banner) fills the screen; the brand line rises
// out of the water one word at a time. This is the page's one orchestrated
// entrance, and the only place words move on their own.

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { SmoothImage as Image } from '@/components/shared/SmoothImage';
import { Tide } from '@/components/ui/Tide';
import { Button } from '@/components/shared/Button';
import { useT } from '@/lib/i18n';
import { site } from '@/lib/site';
import { media } from '@/lib/content/media';

export function HeroFilm({ videoUrl, posterUrl, urgency }: { videoUrl?: string; posterUrl?: string; urgency?: string }) {
  const { t } = useT();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const lift = useTransform(scrollYProgress, [0, 1], ['0%', '-18%']);
  const words = t('hero.headline').split(' ');
  const poster = posterUrl || media.banner;

  return (
    <section ref={ref} data-sky="dawn" className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-teal-800 text-cream">
      <motion.div className="absolute inset-0" style={reduce ? undefined : { scale }}>
        {videoUrl ? (
          <video className="h-full w-full object-cover branded-img" autoPlay muted loop playsInline poster={poster} preload="metadata">
            <source src={videoUrl} />
          </video>
        ) : (
          <Image src={poster} alt={t('alt.heroShoreline')} fill priority sizes="100vw" className="object-cover branded-img" />
        )}
      </motion.div>
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,31,39,0.45)_0%,rgba(0,31,39,0)_28%,rgba(0,31,39,0)_45%,rgba(0,31,39,0.62)_100%)]" />
      <div aria-hidden className="absolute inset-0 grain" />

      <motion.div style={reduce ? undefined : { y: lift }} className="relative z-10 h-full container-page flex flex-col justify-end pb-36 md:pb-44">
        <h1 className="font-display text-display-2xl max-w-[12ch]" aria-label={t('hero.headline')}>
          {words.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em] mr-[0.22em] last:mr-0" aria-hidden>
              <motion.span
                className="inline-block"
                initial={reduce ? false : { y: '105%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 1.3, delay: 0.35 + i * 0.11, ease: [0.22, 1, 0.36, 1] }}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.div
          className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.2 }}
        >
          <div className="max-w-md">
            <p className="text-lede text-cream/90">{t('home.hero.subhead')}</p>
            <p className="mt-4 inline-flex items-center gap-2.5 rounded-full bg-night/35 px-4 py-2 text-sm text-cream backdrop-blur">
              <span aria-hidden className="h-2 w-2 rounded-full bg-sunshine motion-safe:animate-breathe" />
              {urgency || t('hero.urgency')}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="/book"
              className="inline-flex h-14 items-center rounded-full bg-sunshine px-8 font-semibold text-forest-900 transition-colors duration-500 hover:bg-cream"
            >
              {t('home.hero.ctaPrimary')}
            </a>
            <Button href="#day" variant="ghost" size="lg">
              {t('home.hero.ctaSecondary')}
            </Button>
          </div>
        </motion.div>
      </motion.div>

      <Tide below="var(--sky)" band="#EEDDC2" echo size="lg" className="absolute bottom-[-1px] left-0 z-10" />
    </section>
  );
}
