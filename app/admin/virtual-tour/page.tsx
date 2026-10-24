import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/PageHeader';
import { TourManager } from './TourManager';

export const metadata: Metadata = { title: 'Virtual tour · Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const scenes = await prisma.virtualTourScene.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader
        eyebrow="Content"
        title="Virtual tour"
        description="Manage the 360° scenes shown in the virtual tour. Equirectangular images work best."
      />
      <TourManager
        initial={scenes.map((s) => ({
          id: s.id,
          sceneId: s.sceneId,
          name: s.name,
          imageUrl: s.imageUrl,
          thumbnailUrl: s.thumbnailUrl,
          description: s.description,
          status: s.status,
          sortOrder: s.sortOrder,
        }))}
      />
    </section>
  );
}
