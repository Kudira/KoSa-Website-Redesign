import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/PageHeader';
import { StayEnhancementForm } from '../StayEnhancementForm';

export const metadata: Metadata = { title: 'New Stay Enhancement - Admin' };

export default function NewStayEnhancementPage() {
  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader eyebrow="Stay Enhancements" title="Add Enhancement" />
      <StayEnhancementForm />
    </section>
  );
}
