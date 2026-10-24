import type { Metadata } from 'next';
import { PageHero } from '@/components/shared/PageHero';
import { Gallery } from '@/components/gallery/Gallery';
import { media } from '@/lib/content/media';
import { listPublicGallery } from '@/lib/cms/gallery';
import { getT } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'A visual journey through KoSa Beach Resort suites, spa, dining, shoreline and palms',
};

export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
  const { t } = getT();
  const items = await listPublicGallery();
  return (
    <>
      <PageHero
        eyebrow={t('gallery.eyebrow')}
        title={t('gallery.headline')}
        subtitle={t('gallery.description')}
        image={media.rooms.deluxeTwinSea}
        height="sm"
        sky="noon"
      />
      <Gallery items={items} />
    </>
  );
}
