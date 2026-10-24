import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { TestimonialsManager } from './TestimonialsManager';

export const metadata: Metadata = { title: 'Testimonials · Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const rows = await prisma.testimonial.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader
        eyebrow="Content"
        title="Testimonials"
        description="Returning guests, in their own words."
      />
      <TestimonialsManager
        initial={rows.map((r) => ({
          id: r.id,
          guestName: r.guestName,
          country: r.country,
          rating: r.rating,
          quote: r.quote,
          avatarUrl: r.avatarUrl,
          source: r.source,
          status: r.status,
          sortOrder: r.sortOrder,
        }))}
      />
    </section>
  );
}
