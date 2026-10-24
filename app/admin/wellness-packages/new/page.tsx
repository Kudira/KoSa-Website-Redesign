import type { Metadata } from 'next';
import { PageHeader } from '@/components/admin/PageHeader';
import { WellnessPackageForm } from '../WellnessPackageForm';

export const metadata: Metadata = { title: 'New Stay Package - Admin' };

export default function NewWellnessPackagePage() {
  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader eyebrow="Stay Packages" title="Add Package" />
      <WellnessPackageForm />
    </section>
  );
}
