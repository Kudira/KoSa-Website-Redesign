import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { GalleryManager } from './GalleryManager';

export const metadata: Metadata = { title: 'Gallery · Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const items = await prisma.galleryItem.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader
        eyebrow="Content"
        title="Gallery"
        description="Curate the images shown on the public gallery and home page."
      />
      <GalleryManager
        initial={items.map((i) => ({
          id: i.id,
          imageUrl: i.imageUrl,
          caption: i.caption,
          alt: i.alt,
          category: i.category,
          status: i.status,
          sortOrder: i.sortOrder,
        }))}
      />
    </section>
  );
}
