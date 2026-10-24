import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { DataTable } from '@/components/admin/DataTable';

export const metadata: Metadata = { title: 'Stay Packages - Admin' };
export const dynamic = 'force-dynamic';

export default async function WellnessPackagesPage() {
  const packages = await prisma.wellnessPackage.findMany({ orderBy: [{ sortOrder: 'asc' }] });

  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader
        eyebrow="Content"
        title="Stay Packages"
        description="Curated stay packages shown on the Plan Your Visit page."
        actions={
          <Link href="/admin/wellness-packages/new"
            className="inline-flex items-center gap-2 bg-primary text-cream px-4 py-2 rounded-lg text-sm font-opensans hover:bg-primary-dark transition-colors">
            <Plus size={16} /> Add Package
          </Link>
        }
      />
      <DataTable
        rows={packages}
        rowKey={(p) => p.id}
        emptyMessage="No packages yet."
        columns={[
          { header: 'Name', cell: (p) => (
            <Link href={`/admin/wellness-packages/${p.id}`}
              className="text-primary hover:underline font-medium">{p.name}</Link>
          )},
          { header: 'Category', cell: (p) => p.category },
          { header: 'Duration', cell: (p) => p.durationLabel, className: 'hidden md:table-cell' },
          { header: 'Price (GHC)', cell: (p) => p.priceGhs.toLocaleString() },
          { header: 'Status', cell: (p) => (
            <span className={`text-xs font-opensans uppercase px-2 py-0.5 rounded-full ${
              p.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-warm-grey/30 text-umber/60'
            }`}>{p.status}</span>
          )},
        ]}
      />
    </section>
  );
}
