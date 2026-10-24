import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { DataTable } from '@/components/admin/DataTable';
import { formatDate } from '@/lib/utils';
import { ExportButton } from './ExportButton';

export const metadata: Metadata = { title: 'Newsletter · Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader
        eyebrow="Operations"
        title="Newsletter"
        description={`${subscribers.length} subscribers.`}
        actions={<ExportButton />}
      />
      <DataTable
        rows={subscribers}
        rowKey={(s) => s.id}
        emptyMessage="No subscribers yet."
        columns={[
          { header: 'Email', cell: (s) => s.email },
          { header: 'Source', cell: (s) => s.source ?? '-', className: 'hidden md:table-cell' },
          {
            header: 'Consented',
            cell: (s) => (s.consented ? '✓' : '-'),
            className: 'w-24',
          },
          {
            header: 'Joined',
            cell: (s) => formatDate(s.createdAt),
            className: 'hidden md:table-cell',
          },
        ]}
      />
    </section>
  );
}
