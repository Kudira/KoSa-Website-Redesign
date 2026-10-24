import type { Metadata } from 'next';
import Link from 'next/link';
import { Tide } from '@/components/ui/Tide';
import { SmoothImage as Image } from '@/components/shared/SmoothImage';
import { notFound } from 'next/navigation';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { site } from '@/lib/site';
import { AdinkraIcon } from '@/components/shared/AdinkraIcon';
import { getPublicJournalPostBySlug, listPublicJournalPosts } from '@/lib/cms/journal';
import { formatDate, readingTime } from '@/lib/utils';
import { getT } from '@/lib/i18n/server';

interface Props {
  params: { slug: string };
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPublicJournalPostBySlug(params.slug);
  if (!p) return {};
  return {
    title: p.seoTitle ?? p.title,
    description: p.seoDescription ?? p.excerpt ?? undefined,
    openGraph: { images: p.image ? [p.image] : undefined },
  };
}

export default async function BlogPost({ params }: Props) {
  const p = await getPublicJournalPostBySlug(params.slug);
  if (!p) notFound();

  const { t } = getT();
  const all = await listPublicJournalPosts();
  const related = all.filter((x) => x.slug !== p.slug).slice(0, 3);
  const wa = `${site.socials.whatsapp}?text=${encodeURIComponent(site.contact.whatsappMessage)}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: p.title,
    image: p.image ?? undefined,
    datePublished: p.publishedAt ?? undefined,
    author: { '@type': 'Organization', name: site.name },
    publisher: {
      '@type': 'Organization',
      name: site.name,
      logo: { '@type': 'ImageObject', url: `${site.url}/icons/logo.png` },
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Header: title on the sky, photograph beneath with the wave */}
      <section data-sky="morning" className="relative">
        <div className="container-page pt-32 md:pt-44 pb-10 md:pb-14 max-w-5xl">
          <Link href="/blog" className="inline-flex w-fit items-center gap-2 text-sm opacity-75 link-tide">
            <ArrowLeft size={14} aria-hidden /> {t('blogPage.backToJournal')}
          </Link>
          <p className="mt-6 text-sm opacity-70">
            {p.publishedAt && <time>{formatDate(p.publishedAt)}</time>}
            {p.publishedAt && ', '}
            {readingTime(p.body)} {t('blogPage.readMins')}
            {p.tags[0] && <span>. {p.tags.join(', ')}</span>}
          </p>
          <h1 className="mt-4 font-display text-display-lg text-balance">{p.title}</h1>
        </div>
        {p.image && (
          <div className="relative h-[56vh] min-h-[340px] w-full overflow-hidden">
            <Image src={p.image} alt={p.title} fill priority sizes="100vw" className="object-cover branded-img" />
            <Tide below="var(--sky)" size="md" echo className="absolute bottom-[-1px] left-0" />
          </div>
        )}
      </section>

      {/* Body - calm, narrow measure */}
      <article data-sky="morning" className="py-16 md:py-24">
        <div className="container-page max-w-[42rem]">
          {p.excerpt && (
            <p className="font-display text-2xl md:text-3xl leading-snug mb-12">
              {p.excerpt}
            </p>
          )}
          <div
            className="kosa-prose"
            dangerouslySetInnerHTML={{ __html: p.body }}
          />

          {/* Closing breath */}
          <div className="mt-14 flex items-center gap-4">
            <span className="h-px flex-1 bg-coral/25" />
            <AdinkraIcon name="denkyem" size={30} className="text-coral/70" />
            <span className="h-px flex-1 bg-coral/25" />
          </div>
          {p.author && (
            <p className="mt-6 text-center font-sans text-sm text-forest/50">
              {p.author}
            </p>
          )}

          {/* Gentle CTA */}
          <div className="mt-14 rounded-pebble bg-teal-600 text-cream p-8 md:p-10">
            <p className="font-display text-2xl">{t('blogPage.cta.headline')}</p>
            <p className="mt-2 text-cream/80">{t('blogPage.cta.body')}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={site.bookingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-full bg-sunshine px-6 font-semibold text-forest-900 hover:bg-cream transition-colors"
              >
                {t('common.bookYourStay')}
              </a>
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 font-semibold ring-1 ring-inset ring-cream/40 hover:bg-cream hover:text-teal-700 transition-colors"
              >
                <MessageCircle size={14} /> {t('common.whatsapp')}
              </a>
            </div>
          </div>
        </div>
      </article>

      {/* More from the journal */}
      {related.length > 0 && (
        <section data-sky="noon" className="py-16 md:py-20">
          <div className="container-page">
            <p className="font-sans text-sm opacity-70 mb-8">
              {t('blogPage.moreStories')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {related.map((r) => (
                <Link key={r.id} href={`/blog/${r.slug}`} className="group flex flex-col">
                  <div className="relative aspect-[5/4] rounded-pebble overflow-hidden branded-img shadow-sm">
                    {r.image && (
                      <Image src={r.image} alt={r.title} fill sizes="33vw" className="object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
                    )}
                  </div>
                  <h3 className="mt-4 font-display text-xl leading-snug group-hover:text-teal transition-colors">
                    {r.title}
                  </h3>
                  <p className="mt-2 font-sans text-sm text-forest/50">
                    {r.publishedAt ? formatDate(r.publishedAt) : ''} · {readingTime(r.body)} {t('blogPage.readMins')}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
