import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/PageHeader';
import { TreatmentForm } from '../TreatmentForm';

export const metadata: Metadata = { title: 'New treatment · Admin', robots: { index: false } };

export default function Page() {
  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader backHref="/admin/wellness" eyebrow="Wellness" title="Add a treatment" />
      <TreatmentForm />
    </section>
  );
}
