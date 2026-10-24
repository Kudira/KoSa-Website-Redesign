import { SmoothImage as Image } from '@/components/shared/SmoothImage';
import { Tide } from '@/components/ui/Tide';
import { cn } from '@/lib/utils';
import type { SkyName } from '@/components/ui/Sky';

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image: string;
  /** Height of the photograph under the title. */
  height?: 'sm' | 'md' | 'lg' | 'full';
  /** Ground colour for the page this hero opens. */
  sky?: SkyName;
  /** Optional slot under the subtitle (buttons, chips). */
  children?: React.ReactNode;
}

// Inner-page hero. The title is set large on the sky, with the subtitle in a
// narrow column beside it; the photograph follows full-bleed and its lower edge
// is the Ko-Sa wave, carrying the reader into the page.
export function PageHero({ eyebrow, title, subtitle, image, height = 'md', sky = 'dawn', children }: Props) {
  const h = {
    sm: 'h-[44vh] min-h-[300px]',
    md: 'h-[62vh] min-h-[380px]',
    lg: 'h-[76vh] min-h-[460px]',
    full: 'h-[88svh] min-h-[520px]',
  }[height];

  return (
    <section data-sky={sky} className="relative">
      <div className="container-page pt-32 md:pt-44 pb-10 md:pb-16">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            {eyebrow && <p className="eyebrow mb-6">{eyebrow}</p>}
            <h1 className="font-display text-display-xl text-balance">{title}</h1>
          </div>
          {(subtitle || children) && (
            <div className="lg:col-span-4 lg:pb-3">
              {subtitle && <p className="text-lede text-pretty opacity-85 max-w-measure">{subtitle}</p>}
              {children && <div className="mt-7 flex flex-wrap gap-3">{children}</div>}
            </div>
          )}
        </div>
      </div>

      <div className={cn('relative w-full overflow-hidden grain', h)}>
        <Image src={image} alt="" fill priority sizes="100vw" className="object-cover branded-img" />
        <Tide below="var(--sky)" className="absolute bottom-[-1px] left-0" size="md" echo />
      </div>
    </section>
  );
}
