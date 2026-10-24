import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { LinkButton } from '@/components/admin/Button';
import { DataTable, StatusBadge } from '@/components/admin/DataTable';
import { formatCurrency } from '@/lib/utils';

export const metadata: Metadata = { title: 'Wellness · Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function TreatmentsListPage() {
  const treatments = await prisma.treatment.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader
        eyebrow="Content"
        title="Wellness treatments"
        description="Spa, yoga, sound body, breath, and ritual."
        actions={
          <LinkButton href="/admin/wellness/new">
            <Plus size={14} /> Add treatment
          </LinkButton>
        }
      />

      <DataTable
        rows={treatments}
        rowKey={(t) => t.id}
        emptyMessage="No treatments yet."
        columns={[
          {
            header: 'Name',
            cell: (t) => (
              <Link href={`/admin/wellness/${t.id}`} className="font-medium hover:text-primary">
                {t.name}
                <span className="block text-xs text-umber/50">{t.slug}</span>
              </Link>
            ),
          },
          {
            header: 'Duration',
            cell: (t) => `${t.durationMin} min`,
            className: 'hidden md:table-cell',
          },
          {
            header: 'Price',
            cell: (t) => formatCurrency(Number(t.price), t.currency),
            className: 'hidden md:table-cell',
          },
          { header: 'Category', cell: (t) => t.category || '-', className: 'hidden lg:table-cell' },
          { header: 'Status', cell: (t) => <StatusBadge status={t.status} />, className: 'w-32' },
          {
            header: '',
            cell: (t) => (
              <Link
                href={`/admin/wellness/${t.id}`}
                className="text-xs text-primary font-poppins uppercase tracking-tracked-sm"
              >
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
