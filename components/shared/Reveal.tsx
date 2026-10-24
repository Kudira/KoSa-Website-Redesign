'use client';

// Scroll-triggered reveal. Wraps any content and fades/slides it in as it
// enters the viewport (Holistika-style "the copy feels alive"). Honors
// prefers-reduced-motion by rendering statically. Animates once.

import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** seconds to wait before animating (stagger lines/blocks) */
  delay?: number;
  /** vertical travel in px */
  y?: number;
  /** wrapper element */
  as?: 'div' | 'span' | 'li';
}

export function Reveal({ children, className, delay = 0, y = 26, as = 'div' }: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = motion[as] as React.ComponentType<HTMLMotionProps<'div'>>;
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-90px' }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </MotionTag>
  );
}
