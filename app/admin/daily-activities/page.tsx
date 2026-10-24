import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { DataTable } from '@/components/admin/DataTable';
import { DAY_ORDER } from '@/lib/cms/daily-activities';

export const metadata: Metadata = { title: 'Daily Activities - Admin' };
export const dynamic = 'force-dynamic';

const DAY_LABEL: Record<string, string> = {
  MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday', FRIDAY: 'Friday', SATURDAY: 'Saturday', SUNDAY: 'Sunday',
};

export default async function DailyActivitiesPage() {
  const activities = await prisma.dailyActivity.findMany({
    orderBy: [{ day: 'asc' }, { sortOrder: 'asc' }],
  });

  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader
        eyebrow="Content"
        title="Daily Activities"
        description="Free daily schedule shown to guests on the Experiences page."
        actions={
          <Link href="/admin/daily-activities/new"
            className="inline-flex items-center gap-2 bg-primary text-cream px-4 py-2 rounded-lg text-sm font-opensans hover:bg-primary-dark transition-colors">
            <Plus size={16} /> Add Activity
          </Link>
        }
      />
      <DataTable
        rows={activities}
        rowKey={(a) => a.id}
        emptyMessage="No activities yet. Add your first one."
        columns={[
          { header: 'Day', cell: (a) => DAY_LABEL[a.day] ?? a.day },
          { header: 'Time', cell: (a) => a.time },
          { header: 'Activity', cell: (a) => (
            <Link href={`/admin/daily-activities/${a.id}`}
              className="text-primary hover:underline font-medium">{a.title}</Link>
          )},
          { header: 'Status', cell: (a) => (
            <span className={`text-xs font-opensans uppercase px-2 py-0.5 rounded-full ${
              a.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-warm-grey/30 text-umber/60'
            }`}>{a.status}</span>
          )},
          { header: 'Free', cell: (a) => a.isFree ? 'Yes' : 'No', className: 'hidden md:table-cell' },
        ]}
      />
    </section>
  );
}
