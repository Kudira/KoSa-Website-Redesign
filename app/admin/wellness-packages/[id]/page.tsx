import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { WellnessPackageForm } from '../WellnessPackageForm';

export const metadata: Metadata = { title: 'Edit Stay Package - Admin' };
export const dynamic = 'force-dynamic';

interface Props { params: { id: string } }

export default async function EditWellnessPackagePage({ params }: Props) {
  const pkg = await prisma.wellnessPackage.findUnique({ where: { id: params.id } });
  if (!pkg) notFound();
  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader eyebrow="Stay Packages" title="Edit Package" />
      <WellnessPackageForm initial={{
        ...pkg,
        originalPriceGhs: pkg.originalPriceGhs ?? null,
        couplePriceGhs: pkg.couplePriceGhs ?? null,
        couplePriceNote: pkg.couplePriceNote ?? '',
        image: pkg.image ?? '',
        gallery: pkg.gallery ?? [],
      }} />
    </section>
  );
}
