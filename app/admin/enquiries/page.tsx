import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { DataTable } from '@/components/admin/DataTable';
import { formatDate } from '@/lib/utils';
import { EnquiryActions } from './EnquiryActions';

export const metadata: Metadata = { title: 'Enquiries · Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const enquiries = await prisma.contactEnquiry.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader
        eyebrow="Operations"
        title="Enquiries"
        description="Messages submitted via the contact form."
      />
      <DataTable
        rows={enquiries}
        rowKey={(e) => e.id}
        emptyMessage="No enquiries yet."
        columns={[
          {
            header: 'From',
            cell: (e) => (
              <div>
                <p className="font-medium">{e.name}</p>
                <p className="text-xs text-umber/60">{e.email}</p>
              </div>
            ),
          },
          { header: 'Subject', cell: (e) => e.subject || '-', className: 'hidden md:table-cell' },
          {
            header: 'Message',
            cell: (e) => <p className="text-xs max-w-md line-clamp-2 text-umber/80">{e.message}</p>,
          },
          { header: 'Received', cell: (e) => formatDate(e.createdAt), className: 'hidden lg:table-cell' },
          {
            header: '',
            cell: (e) => <EnquiryActions id={e.id} handled={e.handled} />,
            className: 'w-32 text-right',
          },
        ]}
      />
    </section>
  );
}
