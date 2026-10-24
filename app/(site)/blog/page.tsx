import type { Metadata } from 'next';
import Link from 'next/link';
import { SmoothImage as Image } from '@/components/shared/SmoothImage';
import { PageHero } from '@/components/shared/PageHero';
import { AdinkraIcon } from '@/components/shared/AdinkraIcon';
import { listPublicJournalPosts } from '@/lib/cms/journal';
import { formatDate, readingTime } from '@/lib/utils';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Letters from the shore guides to Elmina and Ghana, wellness rituals, and slow travel notes from KoSa Beach Resort',
};

export const dynamic = 'force-dynamic';

const HERO = 'https://ubsgvfouroqkgqufzeat.supabase.co/storage/v1/object/public/kosa-public/media/beach/beach-shots-img_3787.webp';

export default async function BlogIndex() {
  const { t } = getT();
  const posts = await listPublicJournalPosts();
  const [lead, ...rest] = posts;

  return (
    <>
      <PageHero eyebrow={t('blogPage.eyebrow')} title={t('nav.blog')} subtitle={t('blogPage.subtitle')} image={HERO} />

      {posts.length === 0 ? (
        <section data-sky="morning" className="py-24">
          <p className="text-center text-forest/60">{t('blogPage.comingSoon')}</p>
        </section>
      ) : (
        <>
          {/* Featured lead - a quiet, full-width opening */}
          {lead && (
            <section data-sky="morning" className="py-16 md:py-24">
              <div className="container-page">
                <Link
                  href={`/blog/${lead.slug}`}
                  className="group grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center"
                >
                  <div className="relative aspect-[4/3] rounded-pebble overflow-hidden branded-img shadow-sm order-1 lg:order-2">
                    {lead.image && (
                      <Image
                        src={lead.image}
                        alt={lead.title}
                        fill
                        priority
                        sizes="(min-width:1024px) 50vw, 100vw"
                        className="object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="order-2 lg:order-1">
                    <div className="flex items-center gap-3 text-coral">
                      <span className="font-sans text-sm">
                        {t('blogPage.featured')}
                      </span>
                      <span className="h-px w-10 bg-coral/40" />
                    </div>
                    <h2 className="mt-4 font-display text-display-sm leading-tight group-hover:text-teal transition-colors">
                      {lead.title}
                    </h2>
                    <p className="mt-4 font-sans text-lg text-forest/80 leading-relaxed max-w-prose">
                      {lead.excerpt}
                    </p>
                    <PostMeta date={lead.publishedAt} tags={lead.tags} body={lead.body} readLabel={t('blogPage.readMins')} />
                    <span className="mt-6 inline-block font-sans text-xs text-coral border-b border-coral/40 pb-0.5 transition-transform group-hover:translate-x-1">
                      {t('blogPage.readStory')}
                    </span>
                  </div>
                </Link>
              </div>
            </section>
          )}

          {/* Divider with adinkra - a calm breath between sections */}
          {rest.length > 0 && (
            <div className="bg-sand-light pb-4">
              <div className="container-page flex items-center gap-4">
                <span className="h-px flex-1 bg-coral/20" />
                <AdinkraIcon name="asetena" size={28} className="text-coral/70" />
                <span className="h-px flex-1 bg-coral/20" />
              </div>
            </div>
          )}

          {/* The rest - editorial cards */}
          {rest.length > 0 && (
            <section data-sky="morning" className="pb-24 md:pb-32">
              <div className="container-page">
                <p className="font-sans text-sm opacity-70 mb-10">
                  {t('blogPage.moreStories')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 lg:gap-9">
                  {rest.map((p) => (
                    <article key={p.id} className="group flex flex-col">
                      <Link href={`/blog/${p.slug}`} className="flex flex-col h-full">
                        <div className="relative aspect-[5/4] rounded-pebble overflow-hidden branded-img shadow-sm">
                          {p.image && (
                            <Image
                              src={p.image}
                              alt={p.title}
                              fill
                              sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
                              className="object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                            />
                          )}
                          {p.tags[0] && (
                            <span className="absolute top-3 left-3 font-sans text-sm text-cream bg-teal/70 backdrop-blur-md rounded-full px-3 py-1">
                              {p.tags[0]}
                            </span>
                          )}
                        </div>
                        <h3 className="mt-5 font-display text-2xl leading-snug group-hover:text-teal transition-colors">
                          {p.title}
                        </h3>
                        {p.excerpt && (
                          <p className="mt-3 font-sans text-sm text-forest/70 leading-relaxed line-clamp-3">
                            {p.excerpt}
                          </p>
                        )}
                        <PostMeta date={p.publishedAt} tags={[]} body={p.body} readLabel={t('blogPage.readMins')} compact />
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}

function PostMeta({
  date,
  tags,
  body,
  readLabel,
  compact,
}: {
  date: Date | string | null;
  tags: string[];
  body: string;
  readLabel: string;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-sm text-forest/50 ${compact ? 'mt-4' : 'mt-6'}`}>
      {date && <time>{formatDate(date)}</time>}
      <span className="h-1 w-1 rounded-full bg-coral/50" />
      <span>{readingTime(body)} {readLabel}</span>
      {tags.length > 0 && (
        <>
          <span className="h-1 w-1 rounded-full bg-coral/50" />
          <span className="text-coral/80">{tags.join(' · ')}</span>
        </>
      )}
    </div>
  );
}
