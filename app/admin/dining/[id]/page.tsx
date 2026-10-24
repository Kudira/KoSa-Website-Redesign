import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { DiningVenueForm, type VenueFormValues } from '../DiningVenueForm';
import { MenuEditor } from '../MenuEditor';
import type { Locale } from '@/lib/i18n/dictionaries';

export const metadata: Metadata = { title: 'Edit venue · Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { id: string } }) {
  const v = await prisma.diningVenue.findUnique({
    where: { id: params.id },
    include: {
      sections: {
        orderBy: { sortOrder: 'asc' },
        include: { items: { orderBy: { sortOrder: 'asc' } } },
      },
    },
  });
  if (!v) notFound();

  const initial: Partial<VenueFormValues> = {
    id: v.id,
    slug: v.slug,
    name: v.name,
    tagline: v.tagline ?? '',
    description: v.description ?? '',
    hours: v.hours ?? '',
    image: v.image ?? '',
    gallery: v.gallery,
    status: v.status,
    sortOrder: v.sortOrder,
    translations: (v.translations as Partial<Record<Locale, Record<string, string>>> | null) ?? {},
  };

  const sections = v.sections.map((s) => ({
    id: s.id,
    venueId: s.venueId,
    name: s.name,
    description: s.description,
    sortOrder: s.sortOrder,
    items: s.items.map((it) => ({
      id: it.id,
      sectionId: it.sectionId,
      name: it.name,
      description: it.description,
      price: it.price === null ? null : Number(it.price),
      currency: it.currency,
      dietary: it.dietary,
      isFeatured: it.isFeatured,
      sortOrder: it.sortOrder,
    })),
  }));

  return (
    <section className="px-4 md:px-10 py-10 space-y-12">
      <PageHeader backHref="/admin/dining" eyebrow="Dining" title={v.name} description={`/dining (venue)`} />
      <DiningVenueForm initial={initial} />
      <MenuEditor venueId={v.id} sections={sections} />
    </section>
  );
}
