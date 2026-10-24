import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { DailyActivityForm } from '../DailyActivityForm';

export const metadata: Metadata = { title: 'Edit Daily Activity - Admin' };
export const dynamic = 'force-dynamic';

interface Props { params: { id: string } }

export default async function EditDailyActivityPage({ params }: Props) {
  const activity = await prisma.dailyActivity.findUnique({ where: { id: params.id } });
  if (!activity) notFound();
  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader eyebrow="Daily Activities" title="Edit Activity" />
      <DailyActivityForm initial={{ ...activity, tag: activity.tag ?? '', image: activity.image ?? '' }} />
    </section>
  );
}
