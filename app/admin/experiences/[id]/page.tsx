import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { ExperienceForm, type ExperienceFormValues } from '../ExperienceForm';
import type { Locale } from '@/lib/i18n/dictionaries';

export const metadata: Metadata = { title: 'Edit experience · Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { id: string } }) {
  const e = await prisma.experience.findUnique({ where: { id: params.id } });
  if (!e) notFound();

  const initial: Partial<ExperienceFormValues> = {
    id: e.id,
    slug: e.slug,
    label: e.label,
    title: e.title,
    description: e.description,
    longBody: e.longBody ?? '',
    image: e.image ?? '',
    gallery: e.gallery,
    adinkra: e.adinkra ?? '',
    duration: e.duration ?? '',
    status: e.status,
    sortOrder: e.sortOrder,
    translations: (e.translations as Partial<Record<Locale, Record<string, string>>> | null) ?? {},
  };

  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader backHref="/admin/experiences" eyebrow="Experiences" title={e.title} />
      <ExperienceForm initial={initial} />
    </section>
  );
}
