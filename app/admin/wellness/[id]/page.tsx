import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { TreatmentForm, type TreatmentFormValues } from '../TreatmentForm';
import type { Locale } from '@/lib/i18n/dictionaries';

export const metadata: Metadata = { title: 'Edit treatment · Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { id: string } }) {
  const t = await prisma.treatment.findUnique({ where: { id: params.id } });
  if (!t) notFound();

  const initial: Partial<TreatmentFormValues> = {
    id: t.id,
    slug: t.slug,
    name: t.name,
    description: t.description ?? '',
    durationMin: t.durationMin,
    price: Number(t.price),
    currency: t.currency,
    image: t.image ?? '',
    category: t.category ?? '',
    status: t.status,
    sortOrder: t.sortOrder,
    translations: (t.translations as Partial<Record<Locale, Record<string, string>>> | null) ?? {},
  };

  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader backHref="/admin/wellness" eyebrow="Wellness" title={t.name} />
      <TreatmentForm initial={initial} />
    </section>
  );
}
