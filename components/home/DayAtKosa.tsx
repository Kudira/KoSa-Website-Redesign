'use client';

// A day at Ko-Sa, from first light to the last star. Each moment owns a piece
// of the sky (data-sky), so as you read down the day the whole page warms
// into golden hour, flushes coral at dusk and settles into night.
// On large screens a sticky clock and a sun crossing its arc keep time.

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { SmoothImage as Image } from '@/components/shared/SmoothImage';
import { useT } from '@/lib/i18n';
import type { DictKey } from '@/lib/i18n/dictionaries';
import type { SkyName } from '@/components/ui/Sky';
import { cn } from '@/lib/utils';

export interface DayMoment {
  key: string;
  sky: SkyName;
  image: string;
  href: string;
}

export function DayAtKosa({ moments }: { moments: DayMoment[] }) {
  const { t } = useT();
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [moments.length]);

  const k = (m: DayMoment, f: 'time' | 'title' | 'body' | 'cta') => t(`day.${m.key}.${f}` as DictKey);
  const progress = moments.length > 1 ? active / (moments.length - 1) : 0;
  // Sun travels a half-ellipse from left horizon to right horizon.
  const angle = Math.PI * (1 - progress);
  const sx = 150 + 130 * Math.cos(angle);
  const sy = 150 - 120 * Math.sin(angle);
  const isNight = moments[active]?.sky === 'night';

  return (
    <section id="day" className="relative">
      <div className="container-page">
        <header data-sky="dawn" className="pt-10 pb-4 md:pb-24 max-w-4xl">
          <p className="eyebrow mb-6">{t('day.eyebrow')}</p>
          <h2 className="font-display text-display-lg text-balance">{t('day.heading')}</h2>
        </header>

        <div className="grid lg:grid-cols-12 gap-x-16">
          {/* Sticky clock (desktop) */}
          <aside className="hidden lg:block lg:col-span-5" aria-hidden>
            <div className="sticky top-0 h-screen flex flex-col justify-center">
              <svg viewBox="0 0 300 170" className="w-full max-w-md">
                <path d="M20 150 A130 120 0 0 1 280 150" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" strokeDasharray="2 7" strokeLinecap="round" />
                <line x1="0" y1="150" x2="300" y2="150" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" />
                <g style={{ transform: `translate(${sx}px, ${sy}px)`, transition: 'transform 1.4s cubic-bezier(0.22,1,0.36,1)' }}>
                  <circle r="26" fill={isNight ? '#EEDDC2' : '#F4B342'} opacity="0.22" style={{ transition: 'fill 1.4s' }} />
                  <circle r="14" fill={isNight ? '#EEDDC2' : '#F4B342'} style={{ transition: 'fill 1.4s' }} />
                  {isNight && <circle r="12" cx="6" cy="-4" fill="#032A36" />}
                </g>
              </svg>
              <div className="relative mt-10 h-[1.1em] font-display text-display-xl tabular-nums">
                {moments.map((m, i) => (
                  <span
                    key={m.key}
                    className={cn(
                      'absolute left-0 top-0 transition-all duration-1000 ease-tide',
                      i === active ? 'opacity-100 translate-y-0' : i < active ? 'opacity-0 -translate-y-6' : 'opacity-0 translate-y-6',
                    )}
                  >
                    {k(m, 'time')}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-lg opacity-70">{k(moments[active], 'title')}</p>
            </div>
          </aside>

          {/* Moments */}
          <ol className="lg:col-span-7">
            {moments.map((m, i) => (
              <li
                key={m.key}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                data-index={i}
                data-sky={m.sky}
                className="lg:min-h-[86vh] py-12 md:py-20 flex flex-col justify-center"
              >
                <p className="lg:hidden font-display text-5xl tabular-nums mb-6">{k(m, 'time')}</p>
                <figure
                  className={cn(
                    'relative w-full overflow-hidden',
                    i % 3 === 0 ? 'aspect-[4/3] rounded-pebble' : i % 3 === 1 ? 'aspect-[5/6] max-w-lg rounded-t-full rounded-b-pebble' : 'aspect-[16/10] rounded-pebble',
                  )}
                >
                  <Image src={m.image} alt="" fill sizes="(min-width:1024px) 50vw, 92vw" className="object-cover branded-img transition-transform duration-[2s] ease-tide hover:scale-[1.03]" />
                </figure>
                <h3 className="mt-9 font-display text-display-sm">{k(m, 'title')}</h3>
                <p className="mt-4 text-lede max-w-xl opacity-85 text-pretty">{k(m, 'body')}</p>
                <Link href={m.href} className="mt-6 w-fit font-medium link-tide">
                  {k(m, 'cta')}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
