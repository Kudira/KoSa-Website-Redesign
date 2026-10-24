'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'gold-outline' | 'sun' | 'quiet';
type Size = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}

// Pill buttons, sentence case. The fill swells in from the bottom on hover
// like water rising, rather than a flat colour swap.
const styles: Record<Variant, string> = {
  primary: 'bg-teal text-cream hover:bg-teal-700',
  secondary: 'bg-coral text-cream hover:bg-coral-600',
  sun: 'bg-sunshine text-forest-900 hover:bg-sunshine-400',
  ghost: 'bg-transparent text-cream ring-1 ring-inset ring-cream/60 hover:bg-cream hover:text-forest',
  'gold-outline': 'bg-transparent text-current ring-1 ring-inset ring-current hover:bg-forest hover:text-cream hover:ring-forest',
  quiet: 'bg-transparent text-current hover:bg-current/5 px-2',
};

const sizes: Record<Size, string> = {
  sm: 'h-10 px-5 text-sm',
  md: 'h-12 px-7 text-[0.95rem]',
  lg: 'h-14 px-9 text-base',
};

const base =
  'inline-flex items-center justify-center gap-2.5 rounded-full font-sans font-semibold tracking-[0.005em] transition-[background-color,color,box-shadow,transform] duration-500 ease-tide active:scale-[0.98] focus-visible:outline-sunshine disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] whitespace-nowrap';

interface ButtonProps extends BaseProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> {
  href?: undefined;
}

interface LinkProps extends BaseProps {
  href: string;
  target?: string;
  rel?: string;
  prefetch?: boolean;
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps | LinkProps>(
  function Button(props, ref) {
    const { variant = 'primary', size = 'md', className, fullWidth, children } = props;
    const cls = cn(base, styles[variant], sizes[size], fullWidth && 'w-full', className);

    if ('href' in props && props.href) {
      const { href, target, rel, prefetch } = props;
      return (
        <Link
          href={href}
          target={target}
          rel={rel}
          prefetch={prefetch}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={cls}
        >
          {children}
        </Link>
      );
    }
    const { variant: _v, size: _s, className: _c, fullWidth: _f, children: _ch, ...rest } = props as ButtonProps;
    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} className={cls} {...rest}>
        {children}
      </button>
    );
  },
);
