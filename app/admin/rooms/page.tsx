import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { LinkButton } from '@/components/admin/Button';
import { DataTable, StatusBadge } from '@/components/admin/DataTable';
import { formatCurrency } from '@/lib/utils';

export const metadata: Metadata = { title: 'Rooms · Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function RoomsListPage() {
  const rooms = await prisma.room.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader
        eyebrow="Content"
        title="Rooms & Villas"
        description="Manage room types pricing, imagery, amenities, translations."
        actions={
          <LinkButton href="/admin/rooms/new">
            <Plus size={14} /> Add room
          </LinkButton>
        }
      />

      <DataTable
        rows={rooms}
        rowKey={(r) => r.id}
        emptyMessage="No rooms yet. Add one to get started."
        columns={[
          {
            header: '',
            cell: (r) =>
              r.image ? (
                <div className="relative h-12 w-16 rounded-sm overflow-hidden bg-sand-light">
                  <Image src={r.image} alt={r.name} fill sizes="64px" className="object-cover" />
                </div>
              ) : (
                <div className="h-12 w-16 rounded-sm bg-sand-light" />
              ),
            className: 'w-20',
          },
          {
            header: 'Name',
            cell: (r) => (
              <Link href={`/admin/rooms/${r.id}`} className="font-medium hover:text-primary">
                {r.name}
                <span className="block text-xs text-umber/50">{r.slug}</span>
              </Link>
            ),
          },
          {
            header: 'Category',
            cell: (r) => <span className="text-xs">{r.category.replace('_', ' ')}</span>,
            className: 'hidden md:table-cell',
          },
          {
            header: 'Price',
            cell: (r) => formatCurrency(Number(r.price), r.currency),
            className: 'hidden md:table-cell',
          },
          {
            header: 'Status',
            cell: (r) => <StatusBadge status={r.status} />,
            className: 'w-32',
          },
          {
            header: '',
            cell: (r) => (
              <Link
                href={`/admin/rooms/${r.id}`}
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
