// Shared upload helpers (server). The file bytes are uploaded straight from the
// browser to Supabase Storage via a signed URL (see /api/admin/upload and
// lib/admin/uploadMedia), so large files are never limited by the serverless
// request-body cap. These helpers just validate the type and build a safe path.

import { randomBytes } from 'crypto';

export const SAFE_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
  'image/heic',
  'image/heif',
  'video/mp4',
  'video/webm',
  'application/pdf',
]);

export function sanitizeFilename(name: string): string {
  const stripped = name.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/-+/g, '-');
  return stripped.replace(/^-|-$/g, '').slice(0, 120) || 'file';
}

export function buildPath(folder: string | undefined, filename: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const safe = sanitizeFilename(filename);
  const rand = randomBytes(4).toString('hex');
  const cleanFolder = (folder || 'uploads').replace(/(^\/+|\/+$)/g, '');
  return `${cleanFolder}/${today}/${rand}-${safe}`;
}
