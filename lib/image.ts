/**
 * Branded low-quality image placeholders.
 *
 * For remote URLs (Unsplash etc.), Next/Image cannot auto-generate a blurDataURL.
 * We provide a 12×16 SVG gradient in the brand cream→teal→dark palette so every
 * image's loading state is on-brand instead of empty/grey.
 *
 * When real assets ship via Supabase Storage, replace per-image with a true
 * pre-computed BlurHash → base64 LQIP via `plaiceholder` at build time.
 */

const BRAND_LQIP_SVG = `
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 16' preserveAspectRatio='none'>
  <defs>
    <linearGradient id='g' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0%' stop-color='#f0ede5'/>
      <stop offset='55%' stop-color='#2c606e'/>
      <stop offset='100%' stop-color='#1a1a1a'/>
    </linearGradient>
  </defs>
  <rect width='12' height='16' fill='url(#g)'/>
</svg>`.trim();

const toBase64 = (str: string): string => {
  if (typeof window === 'undefined') return Buffer.from(str).toString('base64');
  return window.btoa(unescape(encodeURIComponent(str)));
};

export const BRAND_LQIP = `data:image/svg+xml;base64,${toBase64(BRAND_LQIP_SVG)}`;
