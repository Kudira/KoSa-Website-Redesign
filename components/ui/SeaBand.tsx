// A stretch of open sea: a teal band that arrives on a wave and leaves on
// one. Sets the sky to "sea" while it is in the middle of the screen.

import { Tide } from '@/components/ui/Tide';
import { cn } from '@/lib/utils';

export const SEA = '#00657F';

export function SeaBand({
  children,
  className,
  innerClassName,
  id,
  exit = true,
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  id?: string;
  /** Draw the wave back to the sky at the bottom. */
  exit?: boolean;
}) {
  return (
    <section id={id} data-sky="sea" className={cn('relative text-cream', className)}>
      <Tide above="var(--sky)" below={SEA} echo size="lg" />
      <div className={cn('bg-[#00657F] pb-24 md:pb-32', innerClassName)}>{children}</div>
      {exit && <Tide above={SEA} below="var(--sky)" size="md" />}
    </section>
  );
}
