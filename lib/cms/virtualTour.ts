import { prisma } from '@/lib/prisma';
import { applyTranslationsAll } from '@/lib/admin/i18n';
import { getServerLocale } from '@/lib/i18n/server';

export interface PublicTourScene {
  sceneId: string;
  sceneName: string;
  imageUrl: string;
  thumbnailUrl: string;
  description: string | null;
}

const TRANSLATABLE = ['sceneName', 'description'] as const;

export async function listPublicTourScenes(): Promise<PublicTourScene[]> {
  const locale = getServerLocale();
  try {
    const rows = await prisma.virtualTourScene.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    if (rows.length) {
      const overlaid = applyTranslationsAll(
        rows.map((r) => ({
          sceneId: r.sceneId,
          sceneName: r.name,
          imageUrl: r.imageUrl,
          thumbnailUrl: r.thumbnailUrl ?? r.imageUrl,
          description: r.description,
          translations: r.translations,
        })),
        TRANSLATABLE,
        locale,
      );
      return overlaid.map(({ translations: _t, ...rest }) => rest as PublicTourScene);
    }
  } catch {
    /* fall through */
  }
  return [];
}
