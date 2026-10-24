import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/PageHeader';
import { EventForm } from '../EventForm';

export const metadata: Metadata = { title: 'New Event - Admin' };

export default function NewEventPage() {
  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader eyebrow="Events & Activities" title="Add Event" />
      <EventForm />
    </section>
  );
}
