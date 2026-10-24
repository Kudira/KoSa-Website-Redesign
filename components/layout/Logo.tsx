import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { AdinkraIcon } from '@/components/shared/AdinkraIcon';

interface LogoProps {
  variant?: 'horizontal' | 'icon';
  className?: string;
  /**
   * `color`: the original teal wordmark, for light grounds.
   * `cream`: orange Adinkra mark with a cream wordmark, for the sea, night and photography.
   * `umber`: legacy name, treated as `color`.
   */
  tone?: 'color' | 'cream' | 'umber';
  /** Pixel height. */
  height?: number;
}

// Tightly cropped artwork: 944 × 347.
const RATIO = 944 / 347;

export function Logo({ variant = 'horizontal', className, tone = 'color', height }: LogoProps) {
  if (variant === 'icon') {
    return (
      <Link href="/" aria-label="KoSa Beach Resort, home" className={cn('inline-block', className)}>
        <AdinkraIcon name="palm" size={height ?? 32} className="text-coral" />
      </Link>
    );
  }
  const h = height ?? 44;
  const src = tone === 'cream' ? '/logo-cream.png' : '/logo-tight.png';
  return (
    <Link href="/" aria-label="KoSa Beach Resort, home" className={cn('inline-flex items-center shrink-0', className)}>
      <Image
        src={src}
        alt="KO-SA Beach Resort"
        width={Math.round(h * RATIO)}
        height={h}
        priority
        className="object-contain"
        style={{ height: h, width: 'auto' }}
      />
    </Link>
  );
}
