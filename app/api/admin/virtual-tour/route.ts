import { prisma } from '@/lib/prisma';
import { virtualTourSceneInputSchema } from '@/lib/admin/schemas/virtualTour';
import { sanitizeTranslations } from '@/lib/admin/i18n';
import { slugify } from '@/lib/utils';
import { makeCollectionRoute } from '@/lib/admin/crud';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function uniqueSceneId(desired: string | undefined, name: string, currentId?: string): Promise<string> {
  const base = slugify(desired || name || 'scene') || 'scene';
  let candidate = base;
  let n = 2;
  while (n < 50) {
    const hit = await prisma.virtualTourScene.findUnique({ where: { sceneId: candidate }, select: { id: true } });
    if (!hit || hit.id === currentId) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
  }
  return `${base}-${Date.now()}`;
}

const { GET, POST } = makeCollectionRoute({
  schema: virtualTourSceneInputSchema,
  delegate: prisma.virtualTourScene as unknown as Parameters<typeof makeCollectionRoute>[0]['delegate'],
  collectionKey: 'scenes',
  itemKey: 'scene',
  orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  search: (q) => ({
    OR: [
      { name: { contains: q, mode: 'insensitive' } },
      { sceneId: { contains: q, mode: 'insensitive' } },
    ],
  }),
  toCreate: async (data) => {
    const sceneId = await uniqueSceneId(data.sceneId, data.name);
    return {
      sceneId,
      name: data.name,
      imageUrl: data.imageUrl,
      thumbnailUrl: data.thumbnailUrl,
      description: data.description,
      status: data.status,
      sortOrder: data.sortOrder,
      translations: sanitizeTranslations(data.translations),
    };
  },
  toUpdate: async () => ({}),
});

export { GET, POST };
