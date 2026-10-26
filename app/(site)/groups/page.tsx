import type { Metadata } from 'next';
import { Download, MessageCircle } from 'lucide-react';
import { SmoothImage as Image } from '@/components/shared/SmoothImage';
import { PageHero } from '@/components/shared/PageHero';
import { SeaBand } from '@/components/ui/SeaBand';
import { WaveMark } from '@/components/ui/WaveMark';
import { BookButton } from '@/components/shared/BookButton';
import { EventEnquiryForm } from '@/components/marketing/EventEnquiryForm';
import { getT } from '@/lib/i18n/server';
import type { DictKey } from '@/lib/i18n/dictionaries';
import { media } from '@/lib/content/media';
import { wa } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Groups & Tour Operators',
  description:
    'Group stays at KoSa Beach Resort, Ghana: tour groups, schools, NGOs, faith groups and companies. 10% off room rates, organiser commission, a dedicated Group Coordinator and bus parking.',
};

const GUIDE = process.env.NEXT_PUBLIC_GROUP_GUIDE;

const WHY = [1, 2, 3, 4].map((n) => ({
  title: `groups.why${n}.title`,
  items: ['a', 'b', 'c'].map((x) => `groups.why${n}.${x}`),
})) as { title: DictKey; items: DictKey[] }[];

const TERMS: DictKey[] = ['groups.terms.discount', 'groups.terms.commission', 'groups.terms.drivers', 'groups.terms.cashless'];
const WELCOME = [1, 2, 3, 4, 5, 6].map((n) => `groups.welcome.${n}`) as DictKey[];

export default function GroupsPage() {
  const { t } = getT();

  const guideButton = GUIDE ? (
    <a href={GUIDE} download="KoSa Group Guide 2026-27.pdf" className="inline-flex h-12 items-center gap-2.5 rounded-full px-6 font-semibold ring-1 ring-inset ring-forest/25 transition-colors hover:bg-forest hover:text-cream">
      <Download size={18} aria-hidden /> {t('groups.ctaGuide')}
    </a>
  ) : (
    <BookButton category="OTHER" itemName="Group Guide request" message={wa.groupGuide()} source="groups/guide" className="inline-flex h-12 items-center gap-2.5 rounded-full px-6 font-semibold ring-1 ring-inset ring-forest/25 transition-colors hover:bg-forest hover:text-cream">
      <MessageCircle size={18} aria-hidden /> {t('groups.ctaGuideRequest')}
    </BookButton>
  );

  return (
    <>
      <PageHero eyebrow={t('groups.eyebrow')} title={t('groups.title')} subtitle={t('groups.subtitle')} image={media.events.two} sky="morning" height="lg">
        <BookButton category="OTHER" itemName="Group stay" message={wa.group()} source="groups/hero" className="inline-flex h-12 items-center rounded-full bg-teal px-6 font-semibold text-cream transition-colors hover:bg-teal-700">
          {t('groups.ctaPlan')}
        </BookButton>
        {guideButton}
      </PageHero>

      {/* Why groups choose KoSa */}
      <section data-sky="morning" className="container-page py-20 md:py-28">
        <h2 className="font-display text-display-md mb-12">{t('groups.whyTitle')}</h2>
        <div className="grid gap-x-12 gap-y-12 md:grid-cols-2">
          {WHY.map((w) => (
            <div key={w.title} className="border-t border-forest/15 pt-7">
              <h3 className="font-display text-3xl">{t(w.title)}</h3>
              <ul className="mt-5 space-y-3">
                {w.items.map((k) => (
                  <li key={k} className="flex gap-4 text-lg">
                    <WaveMark className="mt-2.5 text-teal" />
                    <span className="opacity-90">{t(k)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Terms for organisers */}
      <SeaBand>
        <div className="container-page grid gap-12 pt-6 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <h2 className="font-display text-display-md text-balance">{t('groups.termsTitle')}</h2>
            <div className="mt-9 flex flex-wrap gap-3">
              <BookButton category="OTHER" itemName="Group stay" message={wa.group()} source="groups/terms" className="inline-flex h-14 items-center rounded-full bg-sunshine px-8 font-semibold text-forest-900 transition-colors hover:bg-cream">
                {t('groups.ctaPlan')}
              </BookButton>
            </div>
          </div>
          <ul className="lg:col-span-6 lg:col-start-7 grid gap-4">
            {TERMS.map((k) => (
              <li key={k} className="flex gap-4 border-t border-cream/20 pt-4 text-lg">
                <WaveMark className="mt-2.5 text-sunshine" />
                <span>{t(k)}</span>
              </li>
            ))}
          </ul>
        </div>
      </SeaBand>

      {/* Who we host, and what is included */}
      <section data-sky="noon" className="container-page py-20 md:py-28 grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <h2 className="font-display text-display-md mb-8">{t('groups.welcomeTitle')}</h2>
          <ul>
            {WELCOME.map((k) => (
              <li key={k} className="border-t border-forest/15 py-4 font-display text-2xl">{t(k)}</li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-pebble">
            <Image src={media.gallery.beach1} alt="" fill sizes="(min-width:1024px) 38vw, 92vw" className="object-cover branded-img" />
          </div>
          <h3 className="mt-8 font-display text-3xl">{t('groups.freeTitle')}</h3>
          <p className="mt-4 text-lede opacity-85">{t('groups.freeBody')}</p>
        </div>
      </section>

      {/* Guide and enquiry */}
      <section data-sky="golden" id="enquiry" className="container-page py-20 md:py-28 grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 className="font-display text-display-md">{t('groups.guideTitle')}</h2>
          <p className="mt-5 text-lede opacity-85">{t('groups.guideBody')}</p>
          <div className="mt-8 flex flex-wrap gap-3">{guideButton}</div>
        </div>
        <div className="lg:col-span-7 rounded-pebble bg-teal-600 p-6 text-cream md:p-9">
          <h3 className="font-display text-3xl mb-6">{t('groups.formTitle')}</h3>
          <EventEnquiryForm defaultType="Tour group" />
        </div>
      </section>
    </>
  );
}
