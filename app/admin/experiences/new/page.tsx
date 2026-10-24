import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/PageHeader';
import { ExperienceForm } from '../ExperienceForm';

export const metadata: Metadata = { title: 'New experience · Admin', robots: { index: false } };

export default function Page() {
  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader backHref="/admin/experiences" eyebrow="Experiences" title="Add an experience" />
      <ExperienceForm />
    </section>
  );
}
