import type { Metadata } from 'next';
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { PageHero } from '@/components/shared/PageHero';
import { ContactForm } from '@/components/shared/ContactForm';
import { site } from '@/lib/site';
import { getT } from '@/lib/i18n/server';
import { media } from '@/lib/content/media';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Reach the KoSa Beach Resort concierge: enquiries, reservations, group bookings, weddings.',
};

export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  const { t } = await getT();
  const wa = `${site.socials.whatsapp}?text=${encodeURIComponent(site.contact.whatsappMessage)}`;
  const ways = [
    { icon: MessageCircle, label: t('contactPage.whatsappUs'), value: site.contact.phone, href: wa, external: true },
    { icon: Phone, label: t('contactWays.call'), value: site.contact.phone, href: `tel:${site.contact.phone.replace(/\s/g, '')}` },
    { icon: Mail, label: t('contactWays.email'), value: site.contact.email, href: `mailto:${site.contact.email}` },
    { icon: MapPin, label: t('contactPage.whereToFind'), value: t('footer.address') },
  ];

  return (
    <>
      <PageHero eyebrow={t('contactPage.eyebrow')} title={t('contactPage.title')} image={media.gallery.resort1} height="sm" sky="morning" />

      <section data-sky="morning" className="container-page py-20 md:py-28 grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <ul>
            {ways.map((w) => {
              const Icon = w.icon;
              const inner = (
                <>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-teal text-cream">
                    <Icon size={19} aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm opacity-65">{w.label}</span>
                    <span className="block font-display text-2xl leading-snug">{w.value}</span>
                  </span>
                </>
              );
              return (
                <li key={w.label} className="border-t border-forest/15 py-5">
                  {w.href ? (
                    <a href={w.href} target={w.external ? '_blank' : undefined} rel={w.external ? 'noreferrer' : undefined} className="group flex items-center gap-5 transition-colors hover:text-teal">
                      {inner}
                    </a>
                  ) : (
                    <div className="flex items-center gap-5">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="mt-8 aspect-[4/3] overflow-hidden rounded-pebble bg-sand">
            <iframe
              src={`https://www.google.com/maps?q=${site.location.lat},${site.location.lng}&z=11&output=embed`}
              title={t('contactPage.mapTitle')}
              loading="lazy"
              className="h-full w-full border-0"
            />
          </div>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <ContactForm />
        </div>
      </section>
    </>
  );
}
