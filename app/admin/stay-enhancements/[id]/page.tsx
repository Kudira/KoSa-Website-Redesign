import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { StayEnhancementForm } from '../StayEnhancementForm';

export const metadata: Metadata = { title: 'Edit Stay Enhancement - Admin' };
export const dynamic = 'force-dynamic';

interface Props { params: { id: string } }

export default async function EditStayEnhancementPage({ params }: Props) {
  const enhancement = await prisma.stayEnhancement.findUnique({ where: { id: params.id } });
  if (!enhancement) notFound();
  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader eyebrow="Stay Enhancements" title="Edit Enhancement" />
      <StayEnhancementForm initial={{
        ...enhancement,
        description: enhancement.description ?? '',
        priceTo: enhancement.priceTo ?? null,
        priceNote: enhancement.priceNote ?? '',
        image: enhancement.image ?? '',
      }} />
    </section>
  );
}
