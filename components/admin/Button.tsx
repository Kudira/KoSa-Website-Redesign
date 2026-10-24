import Link from 'next/link';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-poppins uppercase tracking-tracked-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-umber hover:bg-primary/90',
  secondary: 'border border-umber/30 text-umber hover:border-primary hover:text-primary',
  ghost: 'text-umber/70 hover:text-umber',
  danger: 'bg-red-600 text-cream hover:bg-red-700',
};

const sizes: Record<Size, string> = {
  sm: 'text-[10px] px-3 py-1.5',
  md: 'text-xs px-4 py-2',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, ...rest },
  ref,
) {
  return <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...rest} />;
});

interface LinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: Variant;
  size?: Size;
}

export function LinkButton({ variant = 'primary', size = 'md', className, href, ...rest }: LinkButtonProps) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...rest} />
  );
}
