import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/PageHeader';
import { JournalForm } from '../JournalForm';

export const metadata: Metadata = { title: 'New post · Admin', robots: { index: false } };

export default function Page() {
  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader backHref="/admin/journal" eyebrow="Journal" title="New post" />
      <JournalForm />
    </section>
  );
}
