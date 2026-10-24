import { prisma } from '@/lib/prisma';
import { virtualTourSceneInputSchema } from '@/lib/admin/schemas/virtualTour';
import { sanitizeTranslations } from '@/lib/admin/i18n';
import { slugify } from '@/lib/utils';
import { makeItemRoute } from '@/lib/admin/crud';

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

const { GET, PATCH, DELETE } = makeItemRoute({
  schema: virtualTourSceneInputSchema,
  delegate: prisma.virtualTourScene as unknown as Parameters<typeof makeItemRoute>[0]['delegate'],
  collectionKey: 'scenes',
  itemKey: 'scene',
  toCreate: async () => ({}),
  toUpdate: async (data, existing) => {
    const e = existing as { id: string; sceneId: string; name: string };
    let sceneId = e.sceneId;
    if (data.sceneId !== undefined || data.name !== undefined) {
      sceneId = await uniqueSceneId(data.sceneId ?? e.sceneId, data.name ?? e.name, e.id);
    }
    const out: Record<string, unknown> = { sceneId };
    if (data.name !== undefined) out.name = data.name;
    if (data.imageUrl !== undefined) out.imageUrl = data.imageUrl;
    if (data.thumbnailUrl !== undefined) out.thumbnailUrl = data.thumbnailUrl;
    if (data.description !== undefined) out.description = data.description;
    if (data.status !== undefined) out.status = data.status;
    if (data.sortOrder !== undefined) out.sortOrder = data.sortOrder;
    if (data.translations !== undefined) out.translations = sanitizeTranslations(data.translations);
    return out;
  },
});

export { GET, PATCH, DELETE };
