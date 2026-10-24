import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { DataTable } from '@/components/admin/DataTable';

export const metadata: Metadata = { title: 'Events & Activities - Admin' };
export const dynamic = 'force-dynamic';

export default async function EventsAdminPage() {
  const events = await prisma.event.findMany({ orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }] });

  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader
        eyebrow="Content"
        title="Events & Activities"
        description="Activities and events shown on the public Events page, filterable by category."
        actions={
          <Link href="/admin/events/new"
            className="inline-flex items-center gap-2 bg-primary text-cream px-4 py-2 rounded-lg text-sm font-opensans hover:bg-primary-dark transition-colors">
            <Plus size={16} /> Add Event
          </Link>
        }
      />
      <DataTable
        rows={events}
        rowKey={(e) => e.id}
        emptyMessage="No events yet."
        columns={[
          { header: 'Category', cell: (e) => (
            <span className="text-xs bg-sand-light px-2 py-0.5 rounded">{e.category}</span>
          )},
          { header: 'Title', cell: (e) => (
            <Link href={`/admin/events/${e.id}`} className="text-primary hover:underline font-medium">{e.title}</Link>
          )},
          { header: 'Transport', cell: (e) => e.transportIncluded ? 'Included' : '-', className: 'hidden md:table-cell' },
          { header: 'Status', cell: (e) => (
            <span className={`text-xs font-opensans uppercase px-2 py-0.5 rounded-full ${
              e.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-warm-grey/30 text-umber/60'
            }`}>{e.status}</span>
          )},
        ]}
      />
    </section>
  );
}
