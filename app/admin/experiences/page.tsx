import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { LinkButton } from '@/components/admin/Button';
import { DataTable, StatusBadge } from '@/components/admin/DataTable';

export const metadata: Metadata = { title: 'Experiences · Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const experiences = await prisma.experience.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader
        eyebrow="Content"
        title="Experiences"
        description="Curated stories wellness, ocean, dining, culture."
        actions={
          <LinkButton href="/admin/experiences/new">
            <Plus size={14} /> Add experience
          </LinkButton>
        }
      />
      <DataTable
        rows={experiences}
        rowKey={(e) => e.id}
        emptyMessage="No experiences yet."
        columns={[
          {
            header: 'Title',
            cell: (e) => (
              <Link href={`/admin/experiences/${e.id}`} className="font-medium hover:text-primary">
                {e.title}
                <span className="block text-xs text-umber/50">
                  {e.label} · /{e.slug}
                </span>
              </Link>
            ),
          },
          { header: 'Adinkra', cell: (e) => e.adinkra || '-', className: 'hidden md:table-cell' },
          { header: 'Status', cell: (e) => <StatusBadge status={e.status} />, className: 'w-32' },
          {
            header: '',
            cell: (e) => (
              <Link href={`/admin/experiences/${e.id}`} className="text-xs text-primary font-poppins uppercase tracking-tracked-sm">
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
