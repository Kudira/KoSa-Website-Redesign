// Media ingestion pipeline for KO-SA.
//
// 1. Scrape a Pixieset gallery's photo list from its embedded __INITIAL_STATE__.
// 2. Download each source image.
// 3. Optimize with sharp (resize to a sane max width + re-encode to WebP).
// 4. Upload to Supabase Storage at a DETERMINISTIC path (so re-runs upsert
//    rather than duplicate) and upsert a MediaAsset row.
//
// Used by scripts/seed-kosa-rooms.ts and scripts/seed-kosa-media.ts.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { prisma } from '../../lib/prisma';
import { getSupabaseAdmin, ensureBucket, publicAssetUrl } from '../../lib/supabase';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

export type PixiesetPhoto = {
  id: string; // pixieset image hash
  url: string;
  width: number | null;
  height: number | null;
  name?: string;
};

// Pixieset blocks direct/datacenter requests to gallery HTML (HTTP 403,
// Cloudflare TLS fingerprinting), so we discover photo URLs through the Jina
// reader proxy (r.jina.ai), which renders the gallery from its own egress. The
// image CDN (images.pixieset.com) itself IS reachable, so once we have the
// hashes we download the high-res `xxlarge` variant straight from the CDN.

const JINA = 'https://r.jina.ai/';
const PIXIESET_CDN_RE = /https:\/\/images\.pixieset\.com\/(\d+)\/([a-f0-9]+)-(medium|large|xlarge|xxlarge|cover)\.jpe?g/gi;

/** Highest public CDN variant (≈1600px long edge). */
function toHighRes(galleryId: string, hash: string): string {
  return `https://images.pixieset.com/${galleryId}/${hash}-xxlarge.jpeg`;
}

/** Scrape a public Pixieset gallery URL → ordered list of high-res photos. */
export async function scrapePixieset(galleryUrl: string): Promise<PixiesetPhoto[]> {
  const res = await fetch(JINA + galleryUrl, {
    headers: { 'User-Agent': UA, Accept: 'text/plain' },
  });
  if (!res.ok) throw new Error(`Jina ${galleryUrl} → HTTP ${res.status}`);
  const text = await res.text();

  const seen = new Set<string>();
  const photos: PixiesetPhoto[] = [];
  let m: RegExpExecArray | null;
  PIXIESET_CDN_RE.lastIndex = 0;
  while ((m = PIXIESET_CDN_RE.exec(text)) !== null) {
    const [, galleryId, hash, variant] = m;
    if (variant === 'cover') continue; // skip the gallery cover
    if (seen.has(hash)) continue;
    seen.add(hash);
    photos.push({ id: hash, url: toHighRes(galleryId, hash), width: null, height: null });
  }
  if (!photos.length) throw new Error('No Pixieset photos found via Jina for ' + galleryUrl);
  return photos;
}

export type IngestOptions = {
  folder: string;
  name: string;
  maxEdge?: number;
  quality?: number;
  alt?: string;
};

export type IngestedAsset = {
  url: string;
  path: string;
  width: number;
  height: number;
  mediaId: string;
};

const bucket = () => process.env.SUPABASE_STORAGE_BUCKET || 'kosa-public';

// Not every Pixieset photo exposes every size (small originals 403 on the
// larger variants). Try the highest available, descending.
const VARIANT_ORDER = ['xxlarge', 'xlarge', 'large', 'medium'];

/** Download a Pixieset image, falling back to smaller variants on 403. */
async function downloadImage(sourceUrl: string): Promise<Buffer> {
  const m = sourceUrl.match(/^(https:\/\/images\.pixieset\.com\/\d+\/[a-f0-9]+)-(\w+)\.jpe?g$/i);
  const candidates = m
    ? VARIANT_ORDER.slice(VARIANT_ORDER.indexOf(m[2]) < 0 ? 0 : VARIANT_ORDER.indexOf(m[2])).map(
        (v) => `${m[1]}-${v}.jpeg`,
      )
    : [sourceUrl];
  let lastStatus = 0;
  for (const url of candidates) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    lastStatus = res.status;
  }
  throw new Error(`download ${sourceUrl} → HTTP ${lastStatus}`);
}

/** Optimize a source image buffer → upload (deterministic path) → upsert MediaAsset. */
export async function ingestBuffer(input: Buffer, opts: IngestOptions): Promise<IngestedAsset> {
  const maxEdge = opts.maxEdge ?? 2000;
  const quality = opts.quality ?? 82;

  const output = await sharp(input, { failOn: 'none' })
    .rotate()
    .resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true })
    .webp({ quality })
    .toBuffer({ resolveWithObject: true });
  const buffer = output.data;
  const width = output.info.width;
  const height = output.info.height;

  const cleanFolder = opts.folder.replace(/[^a-z0-9/_-]/gi, '');
  const safeName = opts.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 80);
  const path = `${cleanFolder}/${safeName}.webp`;
  const b = bucket();

  const ensured = await ensureBucket(b);
  if ('error' in ensured) throw new Error('ensureBucket: ' + ensured.error);

  const client = getSupabaseAdmin();
  if (!client) throw new Error('Supabase admin not configured');
  const { error: upErr } = await client.storage.from(b).upload(path, buffer, {
    contentType: 'image/webp',
    upsert: true,
  });
  if (upErr) throw new Error('upload: ' + upErr.message);

  const url = publicAssetUrl(path, b)!;
  const media = await prisma.mediaAsset.upsert({
    where: { path },
    update: { url, size: buffer.byteLength, width, height, alt: opts.alt, mimeType: 'image/webp' },
    create: {
      path,
      url,
      bucket: b,
      filename: `${safeName}.webp`,
      mimeType: 'image/webp',
      size: buffer.byteLength,
      width,
      height,
      alt: opts.alt,
      folder: cleanFolder,
      uploadedBy: 'seed:ingest',
    },
  });

  return { url, path, width, height, mediaId: media.id };
}

/** Download a remote image (Pixieset variant fallback) → ingest. */
export async function ingestImage(sourceUrl: string, opts: IngestOptions): Promise<IngestedAsset> {
  const input = await downloadImage(sourceUrl);
  return ingestBuffer(input, opts);
}

/**
 * Read a local image file → ingest. Transparently converts HEIC/HEIF to JPEG
 * first (via macOS `sips`, since sharp's libvips build here lacks a HEIC
 * decoder) so iPhone photos can be ingested directly.
 */
export async function ingestLocalImage(filePath: string, opts: IngestOptions): Promise<IngestedAsset> {
  let input: Buffer;
  if (/\.(heic|heif)$/i.test(filePath)) {
    const tmp = path.join(os.tmpdir(), `kosa-heic-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`);
    try {
      execFileSync('sips', ['-s', 'format', 'jpeg', filePath, '--out', tmp], { stdio: 'ignore' });
      input = await fs.promises.readFile(tmp);
    } finally {
      fs.promises.unlink(tmp).catch(() => {});
    }
  } else {
    input = await fs.promises.readFile(filePath);
  }
  return ingestBuffer(input, opts);
}

/** Decode any local image (HEIC included) to a sharp-readable JPEG buffer. */
export async function readLocalAsBuffer(filePath: string): Promise<Buffer> {
  if (/\.(heic|heif)$/i.test(filePath)) {
    const tmp = path.join(os.tmpdir(), `kosa-heic-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`);
    try {
      execFileSync('sips', ['-s', 'format', 'jpeg', filePath, '--out', tmp], { stdio: 'ignore' });
      return await fs.promises.readFile(tmp);
    } finally {
      fs.promises.unlink(tmp).catch(() => {});
    }
  }
  return fs.promises.readFile(filePath);
}
