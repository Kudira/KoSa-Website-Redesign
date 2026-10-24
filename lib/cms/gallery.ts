import { prisma } from '@/lib/prisma';
import { applyTranslationsAll } from '@/lib/admin/i18n';
import { getServerLocale } from '@/lib/i18n/server';
import { gallery as fallbackGallery } from '@/lib/content/home';
import type { PublicGalleryItem } from '@/lib/cms/types';

export type { PublicGalleryItem };

const TRANSLATABLE = ['caption', 'alt'] as const;

export async function listPublicGallery(): Promise<PublicGalleryItem[]> {
  const locale = getServerLocale();
  try {
    const rows = await prisma.galleryItem.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    if (rows.length) {
      const overlaid = applyTranslationsAll(
        rows.map((r) => ({
          id: r.id,
          imageUrl: r.imageUrl,
          caption: r.caption,
          alt: r.alt,
          category: r.category,
          width: r.width,
          height: r.height,
          sortOrder: r.sortOrder,
          translations: r.translations,
        })),
        TRANSLATABLE,
        locale,
      );
      return overlaid.map(({ translations: _t, ...rest }) => rest as PublicGalleryItem);
    }
  } catch {
    /* fall through */
  }
  return fallbackGallery.map((url, i) => ({
    id: `fallback-${i}`,
    imageUrl: url,
    caption: null,
    alt: null,
    category: null,
    width: null,
    height: null,
    sortOrder: i,
  }));
}
