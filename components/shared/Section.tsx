import { cn } from '@/lib/utils';
import type { SkyName } from '@/components/ui/Sky';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  bleed?: boolean;
  as?: 'section' | 'div' | 'article';
  /** Which part of the day this section belongs to. Drives the page ground. */
  sky?: SkyName;
  /** Vertical rhythm. */
  space?: 'none' | 'sm' | 'md' | 'lg';
}

const SPACE = {
  none: '',
  sm: 'py-14 md:py-20',
  md: 'py-20 md:py-28 lg:py-36',
  lg: 'py-28 md:py-40 lg:py-52',
};

export function Section({ children, className, bleed, as: Tag = 'section', sky, space = 'md', ...rest }: SectionProps) {
  return (
    <Tag data-sky={sky} className={cn('relative', SPACE[space], className)} {...rest}>
      {bleed ? children : <div className="container-page">{children}</div>}
    </Tag>
  );
}

/** A quiet signpost above a heading. Sentence case, small, never shouting. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('eyebrow', className)}>
      <span aria-hidden className="inline-block h-px w-8 bg-current opacity-60" />
      {children}
    </span>
  );
}

export function Heading({
  children,
  as: Tag = 'h2',
  className,
  size = 'md',
}: {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const sizes = { sm: 'text-display-sm', md: 'text-display-md', lg: 'text-display-lg', xl: 'text-display-xl' };
  return <Tag className={cn('font-display text-balance', sizes[size], className)}>{children}</Tag>;
}

export function Lede({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('text-lede max-w-measure text-pretty opacity-85', className)}>{children}</p>;
}

/** Kept for older markup; now renders a small tide mark instead of a gold rule. */
export function GoldDivider({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn('flex items-center gap-4 my-8 opacity-60', className)}>
      <span className="h-px flex-1 bg-current" />
      {children ?? (
        <svg width="28" height="10" viewBox="0 0 28 10" aria-hidden>
          <path d="M1 8 C5 8 6 2 10 2 S15 8 19 8 23 2 27 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
      <span className="h-px flex-1 bg-current" />
    </div>
  );
}
