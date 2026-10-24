'use client';

// The footer is night at Ko-Sa: the last stop of the day the homepage walks
// through. Deep sea-blue sky, a scatter of stars, the wave at the shoreline,
// and a goodnight.

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Instagram, Facebook, MessageCircle } from 'lucide-react';
import { Logo } from './Logo';
import { NewsletterForm } from '@/components/shared/NewsletterForm';
import { Tide } from '@/components/ui/Tide';
import { site } from '@/lib/site';
import { useT } from '@/lib/i18n';
import type { DictKey } from '@/lib/i18n/dictionaries';

const LINKS: { href: string; dictKey: DictKey }[] = [
  { href: '/rooms', dictKey: 'nav.stay' },
  { href: '/wellness', dictKey: 'nav.wellness' },
  { href: '/dining', dictKey: 'nav.dine' },
  { href: '/experiences', dictKey: 'nav.experiences' },
  { href: '/events', dictKey: 'nav.events' },
  { href: '/plan', dictKey: 'nav.plan' },
  { href: '/gallery', dictKey: 'nav.gallery' },
  { href: '/blog', dictKey: 'nav.blog' },
  { href: '/about', dictKey: 'nav.about' },
  { href: '/contact', dictKey: 'nav.contact' },
];

// Fixed star field so server and client render identically.
const STARS = Array.from({ length: 46 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  return { x: r(1) * 100, y: r(2) * 62, s: r(3) > 0.85 ? 3 : r(3) > 0.5 ? 2 : 1.4, d: r(4) * 5 };
});

const REVIEW_LINKS = [
  { label: 'Google', url: site.reviews.google.url },
  { label: 'Booking.com', url: site.reviews.booking.url },
  { label: 'TripAdvisor', url: site.reviews.tripadvisor.url },
];

export function Footer() {
  const pathname = usePathname();
  const { t } = useT();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer data-sky="night" className="relative text-cream">
      <Tide above="var(--sky)" below="#032A36" band="#EEDDC2" echo size="lg" />

      <div className="relative bg-night overflow-hidden grain">
        <div aria-hidden className="absolute inset-0">
          {STARS.map((s, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-cream motion-safe:animate-twinkle"
              style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, animationDelay: `${s.d}s` }}
            />
          ))}
          <span className="absolute right-6 top-6 h-12 w-12 md:right-[12%] md:top-16 md:h-20 md:w-20 rounded-full bg-sand shadow-[0_0_80px_20px_rgba(238,221,194,0.18)]" />
          <span className="absolute right-6 top-6 h-12 w-12 md:right-[12%] md:top-16 md:h-20 md:w-20 rounded-full bg-night translate-x-3 -translate-y-1 md:translate-x-5 md:-translate-y-2" />
        </div>

        <div className="relative container-page pt-20 md:pt-24">
          <p className="font-display text-display-xl max-w-5xl text-balance">{t('footer.goodnight')}</p>
          <p className="mt-6 text-lede text-cream/75 max-w-measure">{t('footer.goodnightBody')}</p>

          <div className="mt-20 grid gap-14 md:grid-cols-2 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Logo tone="cream" height={48} />
              <p className="mt-6 text-cream/70 max-w-sm leading-relaxed">{t('footer.about')}</p>
              <div className="mt-6 flex gap-2">
                <a href={site.socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-cream/25 hover:bg-cream hover:text-night transition-colors">
                  <Instagram size={18} />
                </a>
                <a href={site.socials.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-cream/25 hover:bg-cream hover:text-night transition-colors">
                  <Facebook size={18} />
                </a>
                <a
                  href={`${site.socials.whatsapp}?text=${encodeURIComponent(site.contact.whatsappMessage)}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                  className="grid h-11 w-11 place-items-center rounded-full ring-1 ring-cream/25 hover:bg-cream hover:text-night transition-colors"
                >
                  <MessageCircle size={18} />
                </a>
              </div>
            </div>

            <nav aria-label={t('footer.explore')} className="lg:col-span-3">
              <h2 className="text-sm text-cream/55 mb-5">{t('footer.explore')}</h2>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
                {LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="link-tide text-cream/90 hover:text-cream">
                      {t(l.dictKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="lg:col-span-2">
              <h2 className="text-sm text-cream/55 mb-5">{t('footer.connect')}</h2>
              <ul className="space-y-3 text-cream/90">
                <li className="text-cream/70">{t('footer.address')}</li>
                <li>
                  <a href={`tel:${site.contact.phone.replace(/\s/g, '')}`} className="link-tide">{site.contact.phone}</a>
                </li>
                <li>
                  <a href={`mailto:${site.contact.email}`} className="link-tide">{site.contact.email}</a>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-3">
              <h2 className="text-sm text-cream/55 mb-5">{t('footer.newsletter')}</h2>
              <p className="text-cream/70 mb-5">{t('footer.newsletterBlurb')}</p>
              <NewsletterForm />
            </div>
          </div>

          <div className="mt-20 flex flex-col gap-3 pb-6 text-sm text-cream/60 md:flex-row md:items-center">
            <span>{t('footer.reviews')}</span>
            <div className="flex flex-wrap gap-x-5 gap-y-1">
              {REVIEW_LINKS.map((r) => (
                <a key={r.label} href={r.url} target="_blank" rel="noreferrer" className="link-tide text-cream/85">
                  {r.label}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-cream/10 py-8 text-sm text-cream/50 md:flex-row md:items-center md:justify-between">
            <p>
              © {new Date().getFullYear()} {site.name}. {t('footer.copyright')} · {t('footer.group')}
            </p>
            <div className="flex gap-6">
              <Link href="/legal/privacy" className="link-tide hover:text-cream">{t('footer.privacy')}</Link>
              <Link href="/legal/terms" className="link-tide hover:text-cream">{t('footer.terms')}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
