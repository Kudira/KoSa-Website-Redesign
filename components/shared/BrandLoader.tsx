'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

interface BrandLoaderProps {
  size?: number;
  /** Show a label beneath the logo */
  label?: string;
  className?: string;
  /** When true, the breathing/ripple animation is disabled (static placeholder). */
  static?: boolean;
}

/**
 * Branded loading indicator the KoSa logo with a calming "tide" animation:
 * the mark breathes slowly while soft concentric rings ripple outward like
 * water settling, in brand teal. Mirrors the wave motif of the brand guide.
 *
 * Used by route-level loading screens and the virtual-tour viewer.
 */
export function BrandLoader({
  size = 64,
  label,
  className = '',
  static: isStatic = false,
}: BrandLoaderProps) {
  // Outer ring frame is ~2.4× the logo so ripples have room to expand.
  const frame = Math.round(size * 2.4);

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="relative grid place-items-center" style={{ width: frame, height: frame }}>
        {/* Calming tide ripples three rings expanding + fading in sequence */}
        {!isStatic &&
          [0, 1, 2].map((i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute rounded-full border border-teal/30"
              style={{ width: size, height: size }}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: [0.6, 2.2], opacity: [0, 0.5, 0] }}
              transition={{
                duration: 3.6,
                repeat: Infinity,
                ease: 'easeOut',
                delay: i * 1.2,
              }}
            />
          ))}

        {/* Soft halo behind the mark */}
        <span
          aria-hidden
          className="absolute rounded-full bg-teal/15 blur-2xl"
          style={{ width: size, height: size }}
        />

        {/* The logo, breathing gently */}
        <motion.div
          className="relative grid place-items-center"
          style={{ width: size, height: size }}
          animate={isStatic ? undefined : { scale: [1, 1.06, 1], opacity: [0.9, 1, 0.9] }}
          transition={
            isStatic
              ? undefined
              : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <Image
            src="/logo.png"
            alt="KoSa"
            width={size}
            height={size}
            priority
            className="relative object-contain drop-shadow-sm"
          />
        </motion.div>
      </div>

      {label && (
        <motion.span
          className="font-sans text-sm text-forest/70"
          animate={isStatic ? undefined : { opacity: [0.5, 1, 0.5] }}
          transition={isStatic ? undefined : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          {label}
        </motion.span>
      )}
    </div>
  );
}
