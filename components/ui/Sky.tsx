'use client';

// The sky. Any section can declare `data-sky="…"`; whichever one sits in the
// middle of the viewport sets the page ground (`--sky`) and text colour
// (`--ink`). The body transitions between them, so scrolling the homepage
// moves through a day at Ko-Sa: dawn, morning, noon, golden hour, dusk, night.

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export const SKIES = {
  dawn: { sky: '#F8F7F1', ink: '#2E5339' },
  morning: { sky: '#F6EEE0', ink: '#2E5339' },
  noon: { sky: '#EEDDC2', ink: '#2E5339' },
  golden: { sky: '#F7D9A0', ink: '#213C29' },
  dusk: { sky: '#F2BBA6', ink: '#142519' },
  sea: { sky: '#00657F', ink: '#F8F7F1' },
  night: { sky: '#032A36', ink: '#F8F7F1' },
} as const;

export type SkyName = keyof typeof SKIES;

function apply(name: string | null | undefined) {
  const s = SKIES[(name as SkyName) ?? 'dawn'] ?? SKIES.dawn;
  const root = document.documentElement;
  root.style.setProperty('--sky', s.sky);
  root.style.setProperty('--ink', s.ink);
  root.dataset.sky = name ?? 'dawn';
}

export function Sky() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith('/admin')) return;
    let raf = 0;
    const sections = () => Array.from(document.querySelectorAll<HTMLElement>('[data-sky]'));

    const pick = () => {
      raf = 0;
      const mid = window.innerHeight * 0.5;
      let current: HTMLElement | null = null;
      for (const el of sections()) {
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) current = el;
      }
      if (!current) current = sections()[0] ?? null;
      apply(current?.dataset.sky);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(pick);
    };

    pick();
    // Content can stream in after the first paint; re-check shortly after.
    const t = setTimeout(pick, 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      clearTimeout(t);
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [pathname]);

  return null;
}
