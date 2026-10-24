'use client';

/**
 * SmoothImage - next/image with a calm loading state.
 *
 * While the image loads, a slow shimmer (warm sand/cream tones) breathes in the
 * background and the image fades in once ready. If a source ever fails (e.g. a
 * cold CDN timeout), we show a soft branded gradient instead of a broken icon.
 *
 * Drop-in for <Image>. Works with both `fill` and fixed width/height:
 *  - fill   → renders a shimmer sibling (the parent is already position:relative)
 *  - sized  → wraps in a relative span so the shimmer can sit behind the image
 *
 * Reliability: we also detect images that were already cached before hydration
 * (their load event may never fire) and keep a safety timeout, so an image is
 * never left invisible.
 */

import Image, { type ImageProps } from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { BRAND_LQIP } from '@/lib/image';

type Props = ImageProps & { wrapperClassName?: string };

export function SmoothImage({ className, wrapperClassName, onLoad, onError, fill, quality, ...props }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    // Cached images may be complete before this handler attaches.
    if (ref.current?.complete && ref.current.naturalWidth > 0) setLoaded(true);
    // Safety net: never leave an image hidden if the load event is missed.
    const id = window.setTimeout(() => setLoaded(true), 4000);
    return () => window.clearTimeout(id);
  }, []);

  const overlay = (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 transition-opacity duration-700 ease-out',
        failed ? 'kosa-img-fallback opacity-100' : 'kosa-shimmer',
        loaded && !failed ? 'opacity-0' : 'opacity-100',
      )}
    />
  );

  const img = (
    <Image
      {...props}
      ref={ref}
      fill={fill}
      // High default quality so the AVIF/WebP variants stay crisp and vivid
      // (Next/Image defaults to 75). Callers can still override per-image.
      quality={quality ?? 90}
      placeholder="blur"
      blurDataURL={(props.blurDataURL as string) ?? BRAND_LQIP}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
      onError={(e) => {
        setFailed(true);
        setLoaded(true);
        onError?.(e);
      }}
      className={cn('kosa-fade-in', className)}
      data-loaded={loaded && !failed ? 'true' : 'false'}
    />
  );

  // `fill` images live inside an already-relative, sized parent - render the
  // shimmer as a sibling so it fills the same box.
  if (fill) {
    return (
      <>
        {overlay}
        {img}
      </>
    );
  }

  // Fixed-size images need their own relative box for the shimmer.
  return (
    <span className={cn('relative inline-block overflow-hidden', wrapperClassName)}>
      {overlay}
      {img}
    </span>
  );
}
