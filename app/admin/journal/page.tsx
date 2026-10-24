import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { LinkButton } from '@/components/admin/Button';
import { DataTable, StatusBadge } from '@/components/admin/DataTable';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Journal · Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const posts = await prisma.journalPost.findMany({
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
  });

  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader
        eyebrow="Content"
        title="Journal"
        description="Letters from the shore stories, guides, notes."
        actions={
          <LinkButton href="/admin/journal/new">
            <Plus size={14} /> New post
          </LinkButton>
        }
      />
      <DataTable
        rows={posts}
        rowKey={(p) => p.id}
        emptyMessage="No journal posts yet."
        columns={[
          {
            header: 'Title',
            cell: (p) => (
              <Link href={`/admin/journal/${p.id}`} className="font-medium hover:text-primary">
                {p.title}
                <span className="block text-xs text-umber/50">/blog/{p.slug}</span>
              </Link>
            ),
          },
          {
            header: 'Published',
            cell: (p) => (p.publishedAt ? formatDate(p.publishedAt) : '-'),
            className: 'hidden md:table-cell',
          },
          { header: 'Status', cell: (p) => <StatusBadge status={p.status} />, className: 'w-32' },
          {
            header: '',
            cell: (p) => (
              <Link href={`/admin/journal/${p.id}`} className="text-xs text-primary font-poppins uppercase tracking-tracked-sm">
                Edit →
              </Link>
            ),
            className: 'text-right w-20',
          },
        ]}
      />
    </section>
  );
}
