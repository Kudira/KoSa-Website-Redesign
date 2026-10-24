import type { Metadata } from 'next';
import { PageHero } from '@/components/shared/PageHero';
import { TourViewer, type Scene } from '@/components/virtual-tour/TourViewer';
import { Button } from '@/components/shared/Button';
import { getT } from '@/lib/i18n/server';
import { site } from '@/lib/site';
import { media, prose } from '@/lib/content/media';

export const metadata: Metadata = {
  title: '360° Virtual Tour',
  description: 'Step inside KoSa Beach Resort virtual tour of suites, spa, pool and shoreline in Elmina, Ghana',
};

export const dynamic = 'force-dynamic';

async function getScenes(): Promise<Scene[]> {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${base}/api/virtual-tour/scenes`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = (await res.json()) as { scenes: Scene[] };
    return data.scenes ?? [];
  } catch {
    return [];
  }
}

export default async function VirtualTourPage() {
  const { t } = getT();
  const scenes = await getScenes();
  return (
    <>
      <PageHero
        eyebrow={t('tour.eyebrow')}
        title={t('tour.headline')}
        subtitle={prose(t('tour.description'))}
        image={media.commonSpaces}
        height="sm"
        sky="noon"
      />
      <section data-sky="noon" className="py-16 md:py-20">
        <div className="container-page">
          <div className="overflow-hidden rounded-pebble">
            <TourViewer scenes={scenes} />
          </div>
          <div className="mt-12 flex flex-wrap gap-3">
            <Button href="/rooms">{t('tour.viewRooms')}</Button>
            <Button href={site.bookingUrl} target="_blank" rel="noreferrer" variant="gold-outline">{t('common.bookYourStay')}</Button>
          </div>
        </div>
      </section>
    </>
  );
}
