import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { DataTable, StatusBadge } from '@/components/admin/DataTable';
import { formatCurrency, formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Bookings · Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader
        eyebrow="Operations"
        title="Bookings"
        description="Cached reservations from Cloudbeds + direct site bookings."
      />
      <DataTable
        rows={bookings}
        rowKey={(b) => b.id}
        emptyMessage="No bookings yet."
        columns={[
          {
            header: 'Guest',
            cell: (b) => (
              <div>
                <p className="font-medium">{b.guestName}</p>
                <p className="text-xs text-umber/60">{b.guestEmail}</p>
              </div>
            ),
          },
          {
            header: 'Dates',
            cell: (b) => (
              <p className="text-xs">
                {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
              </p>
            ),
            className: 'hidden md:table-cell',
          },
          {
            header: 'Room',
            cell: (b) => b.roomTypeName ?? '-',
            className: 'hidden md:table-cell',
          },
          {
            header: 'Total',
            cell: (b) => (b.totalCost ? formatCurrency(Number(b.totalCost), b.currency) : '-'),
            className: 'hidden lg:table-cell',
          },
          {
            header: 'Status',
            cell: (b) => <StatusBadge status={b.status} />,
            className: 'w-32',
          },
          {
            header: 'Created',
            cell: (b) => formatDate(b.createdAt),
            className: 'hidden lg:table-cell',
          },
        ]}
      />
    </section>
  );
}
