import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { EventForm } from '../EventForm';

export const metadata: Metadata = { title: 'Edit Event - Admin' };
export const dynamic = 'force-dynamic';

interface Props { params: { id: string } }

export default async function EditEventPage({ params }: Props) {
  const event = await prisma.event.findUnique({ where: { id: params.id } });
  if (!event) notFound();
  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader eyebrow="Events & Activities" title="Edit Event" />
      <EventForm initial={{
        ...event,
        image: event.image ?? '',
        priceNote: event.priceNote ?? '',
      }} />
    </section>
  );
}
