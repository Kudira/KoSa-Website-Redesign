'use client';

import { Button } from '@/components/shared/Button';
import { AdinkraIcon } from '@/components/shared/AdinkraIcon';
import { useT } from '@/lib/i18n';
import { prose } from '@/lib/content/media';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const { t } = useT();
  return (
    <section data-sky="morning" className="min-h-[70vh] grid place-items-center py-32 px-6 text-center">
      <div className="max-w-md mx-auto">
        <AdinkraIcon name="denkyem" size={64} className="text-coral mx-auto mb-6" />
        <h1 className="font-display text-display-md">{t('error.headline')}</h1>
        <p className="mt-4 text-lede opacity-80">{prose(t('error.body'))}</p>
        <div className="mt-8 flex gap-3 justify-center">
          <Button onClick={reset}>{t('error.retry')}</Button>
          <Button href="/" variant="gold-outline">{t('common.returnHome')}</Button>
        </div>
      </div>
    </section>
  );
}
