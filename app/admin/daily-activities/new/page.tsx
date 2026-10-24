import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/PageHeader';
import { DailyActivityForm } from '../DailyActivityForm';

export const metadata: Metadata = { title: 'New Daily Activity - Admin' };

export default function NewDailyActivityPage() {
  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader eyebrow="Daily Activities" title="Add Activity" />
      <DailyActivityForm />
    </section>
  );
}
