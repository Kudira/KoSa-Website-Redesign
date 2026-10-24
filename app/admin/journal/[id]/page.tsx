import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { JournalForm, type JournalFormValues } from '../JournalForm';
import type { Locale } from '@/lib/i18n/dictionaries';

export const metadata: Metadata = { title: 'Edit post · Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { id: string } }) {
  const post = await prisma.journalPost.findUnique({ where: { id: params.id } });
  if (!post) notFound();

  const initial: Partial<JournalFormValues> = {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt ?? '',
    body: post.body,
    image: post.image ?? '',
    author: post.author ?? '',
    tags: post.tags,
    status: post.status,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : '',
    seoTitle: post.seoTitle ?? '',
    seoDescription: post.seoDescription ?? '',
    translations: (post.translations as Partial<Record<Locale, Record<string, string>>> | null) ?? {},
  };

  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader backHref="/admin/journal" eyebrow="Journal" title={post.title} description={`/blog/${post.slug}`} />
      <JournalForm initial={initial} />
    </section>
  );
}
