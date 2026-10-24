// The Ko-Sa wave, lifted from the brand guide: a thick, soft-crested band that
// rides the edge where one ground meets the next. Used as the divider between
// every "land" and "sea" section, and as the bottom edge of every page hero.
//
// The SVG is two identical periods wide and drifts left by half its width on a
// slow loop, so the seam is invisible. Reduced-motion users get a still wave.

import { cn } from '@/lib/utils';

type Tone = string; // any CSS colour; we pass hex values from the palette

interface TideProps {
  /** Colour above the wave (the section you are leaving). */
  above?: Tone;
  /** Colour below the wave (the section you are entering). */
  below: Tone;
  /** Colour of the band itself. */
  band?: Tone;
  /** Draw a second, thinner echo band below the main one, as in the guide. */
  echo?: boolean;
  /** Visual height of the divider. */
  size?: 'sm' | 'md' | 'lg';
  /** Flip vertically, for a wave that hangs from the top of a section. */
  flip?: boolean;
  speed?: 'slow' | 'normal' | 'still';
  className?: string;
}

// One period is 720 wide. Rounded crests, gently pointed troughs, like the
// brand guide's scalloped band.
const PERIOD = 720;
const PERIODS = 4; // two visible widths of 1440, duplicated for the loop
function edge(baseline: number, amp: number) {
  let d = `M0 ${baseline}`;
  for (let i = 0; i < PERIODS; i++) {
    const x = i * PERIOD;
    d += ` C ${x + PERIOD * 0.18} ${baseline} ${x + PERIOD * 0.3} ${baseline - amp} ${x + PERIOD * 0.5} ${baseline - amp}`;
    d += ` C ${x + PERIOD * 0.7} ${baseline - amp} ${x + PERIOD * 0.82} ${baseline} ${x + PERIOD} ${baseline}`;
  }
  return d;
}

const W = PERIOD * PERIODS;

export function Tide({
  above = 'transparent',
  below,
  band = '#EEDDC2',
  echo = false,
  size = 'md',
  flip = false,
  speed = 'normal',
  className,
}: TideProps) {
  const H = 160;
  const base = 120;
  const amp = 64;
  const line = edge(base, amp);
  const fill = `${line} L ${W} ${H} L 0 ${H} Z`;
  const echoLine = edge(base + 34, amp * 0.85);

  const heights = { sm: 'h-[56px] md:h-[72px]', md: 'h-[80px] md:h-[120px]', lg: 'h-[110px] md:h-[170px]' };
  const anim = speed === 'still' ? '' : speed === 'slow' ? 'motion-safe:animate-tide-drift-slow' : 'motion-safe:animate-tide-drift';

  return (
    <div
      aria-hidden
      className={cn('relative w-full overflow-hidden pointer-events-none select-none', heights[size], flip && '-scale-y-100', className)}
      style={{ background: above }}
    >
      <svg
        className={cn('absolute inset-y-0 left-0 h-full', anim)}
        style={{ width: '200%' }}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
      >
        <path d={fill} style={{ fill: below, transition: 'fill 1.4s cubic-bezier(0.22,1,0.36,1)' }} />
        <path d={line} fill="none" style={{ stroke: band }} strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {echo && (
          <path d={echoLine} fill="none" style={{ stroke: band }} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} vectorEffect="non-scaling-stroke" />
        )}
      </svg>
    </div>
  );
}

/** A standalone band (no fill), for laying over photography or as an ornament. */
export function TideLine({
  color = '#EEDDC2',
  className,
  thickness = 18,
  speed = 'slow',
}: {
  color?: string;
  className?: string;
  thickness?: number;
  speed?: 'slow' | 'normal' | 'still';
}) {
  const H = 120;
  const line = edge(90, 52);
  const anim = speed === 'still' ? '' : speed === 'slow' ? 'motion-safe:animate-tide-drift-slow' : 'motion-safe:animate-tide-drift';
  return (
    <div aria-hidden className={cn('relative w-full overflow-hidden pointer-events-none', className)}>
      <svg className={cn('absolute inset-y-0 left-0 h-full', anim)} style={{ width: '200%' }} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <path d={line} fill="none" style={{ stroke: color }} strokeWidth={thickness} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
