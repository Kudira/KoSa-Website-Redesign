import type { Metadata } from 'next';
import { wa } from '@/lib/whatsapp';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SmoothImage as Image } from '@/components/shared/SmoothImage';
import { PageHero } from '@/components/shared/PageHero';
import { getPublicExperienceBySlug } from '@/lib/cms/experiences';
import { getT } from '@/lib/i18n/server';
import { BookButton } from '@/components/shared/BookButton';
import { media, prose } from '@/lib/content/media';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const e = await getPublicExperienceBySlug(params.slug);
  if (!e) return {};
  return { title: e.title, description: e.description, openGraph: { images: e.image ? [e.image] : undefined } };
}

export default async function ExperienceDetail({ params }: Props) {
  const e = await getPublicExperienceBySlug(params.slug);
  if (!e) notFound();
  const { t } = getT();

  return (
    <>
      <PageHero eyebrow={e.label} title={e.title} subtitle={prose(e.description)} image={e.image ?? media.experiences.banner} sky="morning" height="lg">
        {e.duration && <span className="text-sm opacity-70">{e.duration}</span>}
      </PageHero>

      <section data-sky="morning" className="container-page py-20 md:py-28 grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="kosa-prose whitespace-pre-line">{e.longBody || t('experiencesPage.detailFallback')}</div>
          <div className="mt-12 flex flex-wrap gap-3">
            <BookButton
              category="EXPERIENCE"
              itemName={e.title}
              message={wa.experience({ name: e.title, duration: e.duration })}
              source={`experiences/${e.slug}`}
              className="inline-flex h-14 items-center rounded-full bg-teal px-8 font-semibold text-cream transition-colors hover:bg-teal-700"
            >
              {t('experiencesPage.addToStay')}
            </BookButton>
            <Link href="/contact" className="inline-flex h-14 items-center rounded-full px-7 font-semibold ring-1 ring-inset ring-forest/25 transition-colors hover:bg-forest hover:text-cream">
              {t('common.speakConcierge')}
            </Link>
          </div>
          <Link href="/experiences" className="mt-10 inline-block link-tide opacity-80">
            {t('nav.experiences')}
          </Link>
        </div>

        {e.gallery.length > 0 && (
          <div className="lg:col-span-5 grid grid-cols-2 gap-4 content-start">
            {e.gallery.slice(0, 6).map((src, i) => (
              <div key={`${src}-${i}`} className={`relative overflow-hidden ${i === 0 ? 'col-span-2 aspect-[4/3] rounded-t-full rounded-b-pebble' : 'aspect-square rounded-pebble'}`}>
                <Image src={src} alt={`${e.title} ${i + 1}`} fill sizes="(min-width:1024px) 20vw, 45vw" className="object-cover branded-img" />
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
