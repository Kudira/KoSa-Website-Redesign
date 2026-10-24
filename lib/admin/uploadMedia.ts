'use client';

// Single client-side upload helper used by every admin uploader. It sends only
// tiny JSON to our API and pushes the file bytes straight to Supabase Storage
// via a signed URL, so uploads are NOT capped by the serverless request-body
// limit (~4.5MB on Vercel) that was making large images fail in production.
// Raster images are downscaled + re-encoded to WebP in the browser first.

import { getSupabaseBrowser } from '@/lib/supabase';
import { toUploadableImage } from '@/lib/admin/heic';

export interface UploadedMedia {
  id: string;
  url: string;
  path: string;
  filename: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
}

interface Optimized {
  blob: Blob;
  contentType: string;
  filename: string;
  width: number | null;
  height: number | null;
}

// Downscale to max 2200px and encode WebP in the browser. Falls back to the
// original bytes for non-raster types (svg/gif/video/pdf) or on any failure.
async function optimizeImage(file: File): Promise<Optimized> {
  const raster = /^image\/(jpeg|png|webp|avif)$/.test(file.type);
  if (!raster || typeof document === 'undefined') {
    return { blob: file, contentType: file.type || 'application/octet-stream', filename: file.name, width: null, height: null };
  }
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, 2200 / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no 2d context');
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    const blob: Blob = await new Promise((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/webp', 0.84),
    );
    return { blob, contentType: 'image/webp', filename: file.name.replace(/\.[a-z0-9]+$/i, '') + '.webp', width, height };
  } catch {
    return { blob: file, contentType: file.type || 'application/octet-stream', filename: file.name, width: null, height: null };
  }
}

export async function uploadMedia(
  raw: File,
  opts: { folder?: string; alt?: string } = {},
): Promise<UploadedMedia> {
  const heicFixed = await toUploadableImage(raw);
  const { blob, contentType, filename, width, height } = await optimizeImage(heicFixed);

  // 1) Ask our API for a signed upload URL (tiny request).
  const signRes = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'sign', filename, folder: opts.folder, contentType }),
  });
  const sign = await signRes.json().catch(() => ({}));
  if (!signRes.ok) throw new Error(sign?.error || 'Could not start upload');

  // 2) Upload the bytes straight to Supabase Storage (no serverless size cap).
  const supabase = getSupabaseBrowser();
  if (!supabase) throw new Error('Storage is not configured');
  const { error } = await supabase.storage
    .from(sign.bucket as string)
    .uploadToSignedUrl(sign.path as string, sign.token as string, blob, { contentType });
  if (error) throw new Error(error.message);

  // 3) Record the asset (tiny request).
  const recRes = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      action: 'record',
      path: sign.path,
      filename,
      mimeType: contentType,
      size: blob.size,
      width,
      height,
      alt: opts.alt ?? null,
      folder: opts.folder,
    }),
  });
  const rec = await recRes.json().catch(() => ({}));
  if (!recRes.ok) throw new Error(rec?.error || 'Could not save upload');
  return rec as UploadedMedia;
}
