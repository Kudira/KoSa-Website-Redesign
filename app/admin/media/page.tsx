import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { MediaManager } from './MediaManager';

export const metadata: Metadata = { title: 'Media library · Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const items = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader
        eyebrow="Library"
        title="Media library"
        description="Every file you've uploaded. Drag URLs into other pages the bucket is public."
      />
      <MediaManager
        initial={items.map((i) => ({
          id: i.id,
          url: i.url,
          filename: i.filename,
          mimeType: i.mimeType,
          size: i.size,
          alt: i.alt,
          folder: i.folder,
          createdAt: i.createdAt.toISOString(),
        }))}
      />
    </section>
  );
}
