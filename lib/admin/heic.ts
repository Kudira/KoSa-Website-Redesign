'use client';

// Client-side HEIC/HEIF → JPEG conversion, run in the browser before upload so
// it works everywhere (including the Vercel serverless runtime, which has no
// libheif decoder). iPhone photos are often HEIC; this lets editors upload them
// directly. The server still optimises the resulting JPEG → WebP.

const HEIC_RE = /\.(heic|heif)$/i;

function isHeic(file: File): boolean {
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    (file.type === '' && HEIC_RE.test(file.name)) // some browsers report empty type for HEIC
  );
}

/**
 * If `file` is HEIC/HEIF, convert it to a JPEG File in the browser. Otherwise
 * return it unchanged. Never throws - on failure it returns the original file
 * so the server can surface a clear error.
 */
export async function toUploadableImage(file: File): Promise<File> {
  if (!isHeic(file)) return file;
  try {
    // Dynamic import keeps heic2any (and its libheif wasm) out of the main
    // bundle; it only loads when an editor actually picks a HEIC file.
    const heic2any = (await import('heic2any')).default;
    const blob = (await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })) as Blob;
    const name = file.name.replace(HEIC_RE, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    return file;
  }
}
