'use client';

// Rooms drift past like boats on the horizon. On large screens the section
// pins and vertical scrolling slides the row sideways; on phones it is a
// simple swipeable row with snap points.

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SmoothImage as Image } from '@/components/shared/SmoothImage';
import { useT } from '@/lib/i18n';
import { displayCategory, type PublicRoom } from '@/lib/cms/types';
import { formatGhs, roomStartingRateGhs } from '@/lib/pricing';
import { prose } from '@/lib/content/media';

export function RoomsDrift({ rooms, showPrices = true }: { rooms: PublicRoom[]; showPrices?: boolean }) {
  const { t } = useT();
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!pin || !track) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', () => {
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + 64);
      gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });
    });
    return () => mm.revert();
  }, [rooms.length]);

  if (!rooms.length) return null;

  return (
    <section data-sky="morning" className="relative">
      <div ref={pinRef} className="relative lg:h-screen lg:flex lg:flex-col lg:justify-center overflow-hidden py-20 lg:py-0">
        <div className="container-page grid gap-8 lg:grid-cols-12 lg:items-end mb-12 lg:mb-14">
          <div className="lg:col-span-7">
            <p className="eyebrow mb-5">{t('homeRooms.eyebrow')}</p>
            <h2 className="font-display text-display-lg text-balance">{t('home.roomsTeaser.headline')}</h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-lede opacity-85 max-w-measure">{prose(t('home.roomsTeaser.body'))}</p>
            <Link href="/rooms" className="mt-6 inline-flex font-medium link-tide">
              {t('homeRooms.cta')}
            </Link>
          </div>
        </div>

        <ul
          ref={trackRef}
          className="flex gap-5 md:gap-8 px-5 md:px-10 xl:px-16 overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none no-scrollbar will-change-transform"
        >
          {rooms.map((room, i) => (
            <li key={room.id} className="snap-start shrink-0 w-[78vw] sm:w-[52vw] lg:w-[30vw] xl:w-[27vw]">
              <Link href={`/rooms/${room.slug}`} className="group block">
                <div className={`relative overflow-hidden ${i % 2 ? 'aspect-[4/5] rounded-pebble' : 'aspect-[4/5] rounded-t-full rounded-b-pebble'}`}>
                  {room.image && (
                    <Image src={room.image} alt={room.name} fill sizes="(min-width:1024px) 30vw, 78vw" className="object-cover branded-img transition-transform duration-[1.6s] ease-tide group-hover:scale-105" />
                  )}
                  <span className="absolute left-4 top-4 rounded-full bg-cream/90 px-3.5 py-1.5 text-sm font-medium text-forest backdrop-blur">
                    {displayCategory(room.category)}
                  </span>
                </div>
                <div className="mt-5 flex items-start justify-between gap-6">
                  <h3 className="font-display text-2xl md:text-[1.75rem] leading-tight">{room.name}</h3>
                  <span className="mt-1 shrink-0 text-sm opacity-70">
                    {t('homeRooms.guests')} {room.maxGuests}
                  </span>
                </div>
                {showPrices && (
                  <p className="mt-2 opacity-80">
                    {t('homeRooms.from')} {formatGhs(roomStartingRateGhs(room.slug, room.price))} {t('homeRooms.night')}
                  </p>
                )}
              </Link>
            </li>
          ))}
          <li className="shrink-0 w-6 lg:w-16" aria-hidden />
        </ul>
      </div>
    </section>
  );
}
