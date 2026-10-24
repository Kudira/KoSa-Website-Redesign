import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { DataTable } from '@/components/admin/DataTable';
import { formatDate } from '@/lib/utils';
import { ServiceEnquiryActions } from './ServiceEnquiryActions';

export const metadata: Metadata = { title: 'Booking Enquiries · Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

const CATEGORY_STYLE: Record<string, string> = {
  TREATMENT: 'bg-teal-100 text-teal-800',
  ENHANCEMENT: 'bg-coral-100 text-coral-700',
  PACKAGE: 'bg-purple-100 text-purple-800',
  EVENT: 'bg-amber-100 text-amber-800',
  DINING: 'bg-orange-100 text-orange-800',
  EXPERIENCE: 'bg-blue-100 text-blue-800',
  TRANSFER: 'bg-green-100 text-green-800',
  OTHER: 'bg-warm-grey/40 text-umber/70',
};

export default async function Page() {
  const enquiries = await prisma.serviceEnquiry.findMany({
    orderBy: { createdAt: 'desc' },
    take: 300,
  });
  const newCount = enquiries.filter((e) => e.status === 'NEW').length;

  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader
        eyebrow="Operations"
        title="Booking Enquiries"
        description={
          `Book/Enquire clicks on services (treatments, packages, events, dining, experiences, transfers). ` +
          `These are visitors who were handed to WhatsApp to confirm.${newCount ? `  ${newCount} new.` : ''}`
        }
      />
      <DataTable
        rows={enquiries}
        rowKey={(e) => e.id}
        emptyMessage="No booking enquiries yet."
        columns={[
          {
            header: 'Service',
            cell: (e) => (
              <div>
                <span className={`inline-block text-[10px] font-opensans uppercase tracking-wider px-2 py-0.5 rounded-full ${CATEGORY_STYLE[e.category] ?? CATEGORY_STYLE.OTHER}`}>
                  {e.category}
                </span>
                <p className="mt-1 font-medium text-umber">{e.itemName}</p>
              </div>
            ),
          },
          {
            header: 'Message sent',
            cell: (e) => <p className="text-xs max-w-md line-clamp-2 text-umber/70">{e.message}</p>,
            className: 'hidden md:table-cell',
          },
          { header: 'Source', cell: (e) => <span className="text-xs text-umber/50">{e.source ?? '-'}</span>, className: 'hidden lg:table-cell' },
          { header: 'When', cell: (e) => formatDate(e.createdAt), className: 'hidden lg:table-cell' },
          {
            header: '',
            cell: (e) => <ServiceEnquiryActions id={e.id} status={e.status} />,
            className: 'w-40 text-right',
          },
        ]}
      />
    </section>
  );
}
