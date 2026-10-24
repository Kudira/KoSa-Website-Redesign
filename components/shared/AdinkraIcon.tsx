import { cn } from '@/lib/utils';

export type AdinkraName = 'knonsonkonson' | 'asetena' | 'denkyem' | 'community' | 'palm';

interface Props extends React.SVGProps<SVGSVGElement> {
  name: AdinkraName;
  size?: number;
}

const PATHS: Record<AdinkraName, React.ReactNode> = {
  // Linked chains "belonging"
  knonsonkonson: (
    <>
      <circle cx="22" cy="32" r="11" />
      <circle cx="42" cy="32" r="11" />
      <path d="M22 21v22M42 21v22" />
    </>
  ),
  // Throne / good life
  asetena: (
    <>
      <path d="M14 22h36v8H14z" />
      <path d="M18 30v18M46 30v18M14 48h36" />
      <path d="M22 22V14h20v8" />
    </>
  ),
  // Crocodile / adaptability "breathe"
  denkyem: (
    <>
      <path d="M8 38c8-10 16-10 24 0s16 10 24 0" />
      <circle cx="20" cy="34" r="2" />
      <circle cx="44" cy="34" r="2" />
      <path d="M8 38c6 4 18 6 24 6s18-2 24-6" />
    </>
  ),
  // Togetherness
  community: (
    <>
      <circle cx="32" cy="20" r="6" />
      <circle cx="18" cy="40" r="6" />
      <circle cx="46" cy="40" r="6" />
      <path d="M28 25l-7 11M36 25l7 11M24 40h16" />
    </>
  ),
  // Stylised palm brand mark
  palm: (
    <>
      <path d="M32 56V30" />
      <path d="M32 30c-4-10-14-12-22-10 4 8 12 12 22 10z" />
      <path d="M32 30c4-10 14-12 22-10-4 8-12 12-22 10z" />
      <path d="M32 30c-2-12-10-18-20-18 2 10 10 16 20 18z" />
      <path d="M32 30c2-12 10-18 20-18-2 10-10 16-20 18z" />
    </>
  ),
};

export function AdinkraIcon({ name, size = 64, className, ...rest }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('text-primary', className)}
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
