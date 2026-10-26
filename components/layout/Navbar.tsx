'use client';

// Primary navigation.
// A light bar that floats over the page: transparent over the homepage film,
// tinted by the current sky everywhere else, and it slips away while you
// scroll down so the page can breathe, returning the moment you scroll up.
// "Menu" opens a full-screen sea with every destination and how to reach us.

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Logo } from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { SeaSound } from '@/components/ui/SeaSound';
import { Tide } from '@/components/ui/Tide';
import { site } from '@/lib/site';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';
import type { DictKey } from '@/lib/i18n/dictionaries';

type NavChild = { href: string; dictKey: string };
type NavItem = { href: string; dictKey: string; children?: readonly NavChild[] };

const PRIMARY: { href: string; dictKey: DictKey }[] = [
  { href: '/rooms', dictKey: 'nav.stay' },
  { href: '/wellness', dictKey: 'nav.wellness' },
  { href: '/dining', dictKey: 'nav.dine' },
  { href: '/experiences', dictKey: 'nav.experiences' },
];

const DARK_SKIES = ['sea', 'night'];

export function Navbar() {
  const pathname = usePathname();
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [darkSky, setDarkSky] = useState(false);
  const lastY = useRef(0);
  const isHome = pathname === '/';

  // Scroll state: at top / hide on the way down / show on the way up.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setAtTop(y < 40);
      const delta = y - lastY.current;
      if (Math.abs(delta) > 6) setHidden(delta > 0 && y > 160);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Follow the sky so the bar stays legible at dusk and at night.
  useEffect(() => {
    const root = document.documentElement;
    const read = () => setDarkSky(DARK_SKIES.includes(root.dataset.sky ?? ''));
    read();
    const mo = new MutationObserver(read);
    mo.observe(root, { attributes: true, attributeFilter: ['data-sky'] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.documentElement.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (pathname?.startsWith('/admin')) return null;

  const overFilm = isHome && atTop;
  const light = overFilm || darkSky || open; // cream text + cream logo

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[transform,background-color,color] duration-700 ease-tide',
          hidden && !open ? '-translate-y-full' : 'translate-y-0',
          light ? 'text-cream' : 'text-forest',
        )}
        style={{
          background: overFilm || open ? 'transparent' : 'color-mix(in srgb, var(--sky) 78%, transparent)',
          backdropFilter: overFilm || open ? undefined : 'blur(18px) saturate(1.2)',
          WebkitBackdropFilter: overFilm || open ? undefined : 'blur(18px) saturate(1.2)',
        }}
      >
        <div className="container-page flex h-20 md:h-24 items-center gap-6">
          <Logo tone={light || open ? 'cream' : 'color'} height={40} />

          <nav aria-label="Primary" className={cn('hidden lg:flex items-center gap-1 ml-6 transition-opacity duration-500', open && 'lg:opacity-0 lg:pointer-events-none')}>
            {PRIMARY.map((item) => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative rounded-full px-4 py-2 text-[0.95rem] font-medium transition-colors',
                    light ? 'hover:bg-cream/10' : 'hover:bg-forest/5',
                  )}
                >
                  {t(item.dictKey)}
                  {active && <span className="absolute left-1/2 -translate-x-1/2 bottom-0.5 h-1 w-1 rounded-full bg-coral" />}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1 md:gap-2">
            <SeaSound tone={light || open ? 'dark' : 'light'} />
            <div className="hidden md:block">
              <LanguageSwitcher tone={light || open ? 'cream' : 'umber'} />
            </div>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? t('menu.close') : t('menu.open')}
              className={cn(
                'inline-flex h-11 items-center gap-3 rounded-full px-3 sm:px-4 text-[0.95rem] font-medium transition-colors',
                light || open ? 'hover:bg-cream/10 text-cream' : 'hover:bg-forest/5',
              )}
            >
              <span className="relative block h-3 w-5" aria-hidden>
                <span className={cn('absolute left-0 h-[1.5px] w-5 bg-current transition-all duration-500 ease-tide', open ? 'top-1.5 rotate-45' : 'top-0')} />
                <span className={cn('absolute left-0 h-[1.5px] bg-current transition-all duration-500 ease-tide', open ? 'top-1.5 w-5 -rotate-45' : 'top-3 w-3.5')} />
              </span>
              <span className="hidden sm:inline">{open ? t('menu.close') : t('menu.open')}</span>
            </button>
            <Link
              href="/book"
              className={cn(
                'inline-flex h-11 items-center whitespace-nowrap rounded-full px-4 md:px-6 text-[0.95rem] font-semibold transition-colors duration-500',
                light || open ? 'bg-cream text-forest hover:bg-sunshine' : 'bg-teal text-cream hover:bg-teal-700',
              )}
            >
              {t('nav.book')}
            </Link>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && <SiteMenu onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

function SiteMenu({ onClose }: { onClose: () => void }) {
  const { t } = useT();
  const items = site.nav as readonly NavItem[];
  const flat: { href: string; dictKey: string }[] = [];
  for (const item of items) {
    if (item.children) flat.push(...item.children);
    else flat.push(item);
  }

  return (
    <motion.div
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label={t('menu.open')}
      data-lenis-prevent
      className="fixed inset-0 z-[45] overflow-y-auto bg-teal-600 text-cream"
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      animate={{ clipPath: 'inset(0 0 0% 0)' }}
      exit={{ clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="container-page min-h-full flex flex-col pt-28 md:pt-36 pb-0">
        <div className="grid gap-14 lg:grid-cols-12 flex-1">
          <nav aria-label="Site" className="lg:col-span-8">
            <ul className="grid gap-x-10 sm:grid-cols-2">
              {flat.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.045, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="group flex items-baseline gap-4 border-b border-cream/15 py-4 md:py-5 font-display text-[clamp(2rem,4.2vw,3.5rem)] leading-none"
                  >
                    <span className="transition-transform duration-700 ease-tide group-hover:translate-x-3">
                      {t(item.dictKey as DictKey)}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </nav>

          <motion.aside
            className="lg:col-span-4 flex flex-col gap-10 text-cream/85"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <div>
              <p className="font-display text-3xl text-cream leading-tight">{t('menu.tagline')}</p>
            </div>
            <dl className="grid gap-5 text-base">
              <div>
                <dt className="text-sm text-cream/60 mb-1">{t('menu.findUs')}</dt>
                <dd>{site.contact.address}</dd>
              </div>
              <div>
                <dt className="text-sm text-cream/60 mb-1">{t('menu.talk')}</dt>
                <dd className="flex flex-col gap-1">
                  <a className="link-tide w-fit" href={`${site.socials.whatsapp}?text=${encodeURIComponent(site.contact.whatsappMessage)}`} target="_blank" rel="noreferrer">
                    WhatsApp {site.contact.phone}
                  </a>
                  <a className="link-tide w-fit" href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
                </dd>
              </div>
            </dl>
            <div className="flex items-center gap-2 md:hidden">
              <LanguageSwitcher tone="cream" />
            </div>
          </motion.aside>
        </div>
        <Tide below="#004D61" band="#EEDDC2" echo size="lg" className="mt-16 -mx-5 md:-mx-10 xl:-mx-16 w-auto" />
      </div>
    </motion.div>
  );
}
