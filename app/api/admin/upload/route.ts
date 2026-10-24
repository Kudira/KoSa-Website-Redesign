// POST /api/admin/upload two tiny JSON actions so large files never hit the
// serverless request-body limit (the file bytes go straight from the browser to
// Supabase Storage via a signed URL):
//   { action: 'sign',   filename, folder?, contentType } -> { bucket, path, token, url }
//   { action: 'record', path, filename, mimeType, size, width?, height?, alt?, folder? } -> MediaAsset
// See lib/admin/uploadMedia (client) for the flow.

import { NextResponse, type NextRequest } from 'next/server';
import { requireRole } from '@/lib/admin/auth';
import { getSupabaseAdmin, ensureBucket, publicAssetUrl } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { badRequest, ok, serverError } from '@/lib/admin/response';
import { SAFE_MIME, sanitizeFilename, buildPath } from '@/lib/admin/upload';

export const runtime = 'nodejs';

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'kosa-public';

export async function POST(req: NextRequest) {
  const guard = await requireRole(['OWNER', 'EDITOR']);
  if (guard instanceof NextResponse) return guard;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return badRequest('Invalid JSON body');
  }

  // 1) Hand the browser a signed URL to upload directly to Supabase Storage.
  if (body.action === 'sign') {
    const contentType = String(body.contentType || '');
    if (!SAFE_MIME.has(contentType)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 });
    }
    const admin = getSupabaseAdmin();
    if (!admin) return serverError('Storage is not configured');
    const ensured = await ensureBucket(BUCKET);
    if ('error' in ensured) return serverError(ensured.error);

    const path = buildPath(
      body.folder ? String(body.folder) : undefined,
      sanitizeFilename(String(body.filename || 'file')),
    );
    const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data) return serverError(error?.message || 'Could not create upload URL');
    return ok({ bucket: BUCKET, path: data.path, token: data.token, url: publicAssetUrl(path) });
  }

  // 2) Record the finished upload as a MediaAsset row.
  if (body.action === 'record') {
    const path = String(body.path || '');
    if (!path) return badRequest('Missing path');
    try {
      const asset = await prisma.mediaAsset.create({
        data: {
          path,
          url: publicAssetUrl(path) || String(body.url || ''),
          bucket: BUCKET,
          filename: sanitizeFilename(String(body.filename || 'file')),
          mimeType: String(body.mimeType || 'application/octet-stream'),
          size: Number(body.size) || 0,
          width: typeof body.width === 'number' ? body.width : null,
          height: typeof body.height === 'number' ? body.height : null,
          alt: body.alt ? String(body.alt) : null,
          folder: body.folder ? String(body.folder) : null,
          uploadedBy: guard.user.id,
        },
      });
      return ok(
        {
          id: asset.id,
          url: asset.url,
          path: asset.path,
          filename: asset.filename,
          mimeType: asset.mimeType,
          size: asset.size,
          width: asset.width,
          height: asset.height,
        },
        201,
      );
    } catch (e) {
      return serverError((e as Error).message);
    }
  }

  return badRequest('Unknown action');
}
