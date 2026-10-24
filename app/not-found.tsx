import Link from 'next/link';
import Image from 'next/image';
import { getT } from '@/lib/i18n/server';
import { Tide } from '@/components/ui/Tide';
import { prose } from '@/lib/content/media';

// "Lost at sea". Rendered outside the site chrome, so it carries its own
// logo and a wave to stand on.
export default function NotFound() {
  const { t } = getT();
  return (
    <main className="relative min-h-[100svh] flex flex-col bg-teal-600 text-cream overflow-hidden">
      <div className="container-page pt-10">
        <Link href="/" aria-label="KoSa Beach Resort, home">
          <Image src="/logo-cream.png" alt="KO-SA Beach Resort" width={130} height={48} priority style={{ height: 44, width: 'auto' }} />
        </Link>
      </div>
      <div className="container-page flex-1 flex flex-col justify-center py-20">
        <p className="eyebrow mb-6">404</p>
        <h1 className="font-display text-display-2xl">{t('notFound.headline')}</h1>
        <p className="mt-8 text-lede text-cream/85 max-w-md">{prose(t('notFound.body'))}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className="inline-flex h-14 items-center rounded-full bg-sunshine px-8 font-semibold text-forest-900 transition-colors hover:bg-cream">
            {t('common.returnHome')}
          </Link>
          <Link href="/contact" className="inline-flex h-14 items-center rounded-full px-7 font-semibold ring-1 ring-inset ring-cream/40 transition-colors hover:bg-cream hover:text-teal-700">
            {t('notFound.concierge')}
          </Link>
        </div>
      </div>
      <Tide above="#00657F" below="#F8F7F1" echo size="lg" />
    </main>
  );
}
