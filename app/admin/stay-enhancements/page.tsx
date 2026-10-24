import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { DataTable } from '@/components/admin/DataTable';

export const metadata: Metadata = { title: 'Stay Enhancements - Admin' };
export const dynamic = 'force-dynamic';

export default async function StayEnhancementsPage() {
  const enhancements = await prisma.stayEnhancement.findMany({
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
  });

  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader
        eyebrow="Content"
        title="Stay Enhancements"
        description="Add-on experiences and spa treatments shown on the Wellness page."
        actions={
          <Link href="/admin/stay-enhancements/new"
            className="inline-flex items-center gap-2 bg-primary text-cream px-4 py-2 rounded-lg text-sm font-opensans hover:bg-primary-dark transition-colors">
            <Plus size={16} /> Add Enhancement
          </Link>
        }
      />
      <DataTable
        rows={enhancements}
        rowKey={(e) => e.id}
        emptyMessage="No enhancements yet."
        columns={[
          { header: 'Category', cell: (e) => (
            <span className="text-xs bg-sand-light px-2 py-0.5 rounded">{e.category}</span>
          )},
          { header: 'Name', cell: (e) => (
            <Link href={`/admin/stay-enhancements/${e.id}`}
              className="text-primary hover:underline font-medium">{e.name}</Link>
          )},
          { header: 'Price (GHC)', cell: (e) =>
            e.priceTo ? `${e.priceGhs.toLocaleString()} - ${e.priceTo.toLocaleString()}`
            : e.priceGhs.toLocaleString()
          },
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
