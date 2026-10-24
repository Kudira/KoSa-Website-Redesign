'use client';

// Dawn. A single paragraph you read at the pace of your own scrolling: each
// word brightens as it passes the middle of the screen, like breath filling
// the lungs. Reduced-motion visitors see the paragraph fully set.

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SmoothImage as Image } from '@/components/shared/SmoothImage';
import { useT } from '@/lib/i18n';
import { media, prose } from '@/lib/content/media';

export function Exhale() {
  const { t, locale } = useT();
  const textRef = useRef<HTMLParagraphElement>(null);
  const body = prose(t('home.feeling.body'));

  useEffect(() => {
    const el = textRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll('[data-w]'),
        { opacity: 0.16 },
        {
          opacity: 1,
          stagger: 0.08,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 45%', scrub: 0.6 },
        },
      );
    });
    return () => ctx.revert();
  }, [locale]);

  return (
    <section data-sky="dawn" className="relative pt-16 pb-28 md:pt-24 md:pb-40">
      <div className="container-page grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <h2 className="eyebrow mb-10">{t('home.feeling.headline')}</h2>
          <p ref={textRef} className="font-display text-display-md text-pretty">
            {body.split(' ').map((w, i) => (
              <span key={`${locale}-${i}`} data-w className="inline">
                {w}{' '}
              </span>
            ))}
          </p>
          <Link href="/about/philosophy" className="mt-12 inline-flex items-center gap-3 text-lg font-medium link-tide">
            {t('intro.philosophyCta')}
          </Link>
        </div>
        <div className="lg:col-span-4 lg:pt-28">
          <figure className="relative aspect-[4/5] w-full max-w-sm lg:ml-auto overflow-hidden rounded-t-full rounded-b-pebble">
            <Image src={media.feeling} alt={t('alt.feelingHammock')} fill sizes="(min-width:1024px) 30vw, 90vw" className="object-cover branded-img" />
          </figure>
        </div>
      </div>
    </section>
  );
}
