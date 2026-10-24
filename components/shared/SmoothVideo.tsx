'use client';

/**
 * SmoothVideo - a <video> with the same calm loading state as SmoothImage.
 *
 * While the clip buffers, the warm sand/cream shimmer breathes behind it; once
 * the first frame is ready (`loadeddata`) the video fades in. If the source
 * fails, a soft branded gradient shows instead of a black box.
 *
 * The wrapper is `position: relative` so the shimmer can fill the same box.
 * Pass `wrapperClassName` to size/position the wrapper (e.g. "absolute inset-0")
 * and `className` to style the video element itself (e.g. "h-full w-full
 * object-cover").
 */

import { useEffect, useRef, useState, type VideoHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Props = VideoHTMLAttributes<HTMLVideoElement> & { wrapperClassName?: string };

export function SmoothVideo({ className, wrapperClassName, onLoadedData, onError, ...props }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // The clip may already be buffered before this handler attaches.
    if (ref.current && ref.current.readyState >= 2) setLoaded(true);
    // Safety net: never leave the video hidden if the event is missed.
    const id = window.setTimeout(() => setLoaded(true), 8000);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <span className={cn('relative block overflow-hidden', wrapperClassName)}>
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 transition-opacity duration-700 ease-out',
          failed ? 'kosa-img-fallback opacity-100' : 'kosa-shimmer',
          loaded && !failed ? 'opacity-0' : 'opacity-100',
        )}
      />
      <video
        ref={ref}
        className={cn('kosa-fade-in', className)}
        data-loaded={loaded && !failed ? 'true' : 'false'}
        onLoadedData={(e) => {
          setLoaded(true);
          onLoadedData?.(e);
        }}
        onError={(e) => {
          setFailed(true);
          setLoaded(true);
          onError?.(e);
        }}
        {...props}
      />
    </span>
  );
}
