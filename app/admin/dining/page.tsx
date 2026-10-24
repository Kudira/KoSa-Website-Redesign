import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { LinkButton } from '@/components/admin/Button';
import { DataTable, StatusBadge } from '@/components/admin/DataTable';

export const metadata: Metadata = { title: 'Dining · Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const venues = await prisma.diningVenue.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    include: { _count: { select: { sections: true } } },
  });

  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader
        eyebrow="Content"
        title="Dining venues"
        description="Restaurants, bars, menus."
        actions={
          <LinkButton href="/admin/dining/new">
            <Plus size={14} /> Add venue
          </LinkButton>
        }
      />
      <DataTable
        rows={venues}
        rowKey={(v) => v.id}
        emptyMessage="No venues yet."
        columns={[
          {
            header: '',
            cell: (v) =>
              v.image ? (
                <div className="relative h-12 w-16 rounded-sm overflow-hidden bg-sand-light">
                  <Image src={v.image} alt={v.name} fill sizes="64px" className="object-cover" />
                </div>
              ) : (
                <div className="h-12 w-16 rounded-sm bg-sand-light" />
              ),
            className: 'w-20',
          },
          {
            header: 'Name',
            cell: (v) => (
              <Link href={`/admin/dining/${v.id}`} className="font-medium hover:text-primary">
                {v.name}
                <span className="block text-xs text-umber/50">{v.slug}</span>
              </Link>
            ),
          },
          {
            header: 'Sections',
            cell: (v) => v._count.sections,
            className: 'hidden md:table-cell',
          },
          { header: 'Status', cell: (v) => <StatusBadge status={v.status} />, className: 'w-32' },
          {
            header: '',
            cell: (v) => (
              <Link href={`/admin/dining/${v.id}`} className="text-xs text-primary font-poppins uppercase tracking-tracked-sm">
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
