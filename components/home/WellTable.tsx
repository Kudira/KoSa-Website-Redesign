// Noon. The two things people travel to Ko-Sa for, side by side and slightly
// out of step, like two people walking the beach: the spa, and the table.

import Link from 'next/link';
import { SmoothImage as Image } from '@/components/shared/SmoothImage';
import { getT } from '@/lib/i18n/server';
import { media, sentences } from '@/lib/content/media';

export async function WellTable() {
  const { t } = await getT();
  const wellLead = sentences(t('wellnessPage.intro'))[0];
  const diningLead = sentences(t('diningPage.intro'))[0];

  return (
    <section data-sky="noon" className="relative py-24 md:py-36">
      <div className="container-page grid gap-16 md:grid-cols-2 md:gap-10 lg:gap-20">
        <Link href="/wellness" className="group block">
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-pebble">
            <Image src={media.wellness.spa} alt="" fill sizes="(min-width:768px) 45vw, 92vw" className="object-cover branded-img transition-transform duration-[1.8s] ease-tide group-hover:scale-105" />
          </div>
          <p className="eyebrow mt-8">{t('wellnessPage.heroSub')}</p>
          <h2 className="mt-3 font-display text-display-md">{t('wellnessPage.headline')}</h2>
          <p className="mt-4 text-lede opacity-85 max-w-md">{wellLead}.</p>
          <span className="mt-6 inline-flex font-medium link-tide">{t('day.firstLight.cta')}</span>
        </Link>

        <Link href="/dining" className="group block md:mt-40">
          <div className="relative aspect-[4/5] overflow-hidden rounded-pebble">
            <Image src={media.dining.hero} alt="" fill sizes="(min-width:768px) 45vw, 92vw" className="object-cover branded-img transition-transform duration-[1.8s] ease-tide group-hover:scale-105" />
          </div>
          <p className="eyebrow mt-8">{t('diningPage.restaurant.hours')}</p>
          <h2 className="mt-3 font-display text-display-md">{t('diningPage.headline')}</h2>
          <p className="mt-4 text-lede opacity-85 max-w-md">{diningLead}.</p>
          <span className="mt-6 inline-flex font-medium link-tide">{t('day.fire.cta')}</span>
        </Link>
      </div>
    </section>
  );
}
