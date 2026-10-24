import { cn } from '@/lib/utils';

/** A small Ko-Sa wave, used as a list bullet and quiet ornament. */
export function WaveMark({ className }: { className?: string }) {
  return (
    <svg width="22" height="10" viewBox="0 0 22 10" className={cn('shrink-0', className)} aria-hidden>
      <path d="M1 8 C4 8 5 2 8 2 S12 8 15 8 18 2 21 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
