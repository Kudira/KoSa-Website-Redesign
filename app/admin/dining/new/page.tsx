import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/PageHeader';
import { DiningVenueForm } from '../DiningVenueForm';

export const metadata: Metadata = { title: 'New venue · Admin', robots: { index: false } };

export default function Page() {
  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader backHref="/admin/dining" eyebrow="Dining" title="Add a venue" />
      <DiningVenueForm />
    </section>
  );
}
