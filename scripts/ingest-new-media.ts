// Ingest the owner's new local photo folders (files/*) into Supabase Storage,
// converting HEIC → JPEG → optimized WebP, into category-scoped folders. Also
// computes a "colorfulness" score per image (Hasler-Süsstrunk metric) so the
// gallery seed can prefer vibrant shots. Writes a manifest to /tmp.
//
//   npx tsx scripts/ingest-new-media.ts

import './_env';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { ingestLocalImage, readLocalAsBuffer } from './lib/ingest';

const ROOT = 'files/Kosa-Images';

// folder on disk → storage category folder
const SOURCES: { dir: string; category: string }[] = [
  { dir: 'Beach shots', category: 'beach' },
  { dir: 'Scenery', category: 'scenery' },
  { dir: 'general environment', category: 'environment' },
  { dir: 'Compound Villa', category: 'rooms-extra' },
  { dir: 'Food', category: 'food' },
  { dir: 'Drinks', category: 'drinks' },
  { dir: 'Breakfast', category: 'food' },
  { dir: 'People (Food)', category: 'dining-life' },
  { dir: 'spa', category: 'wellness' },
  { dir: 'fisherfolks', category: 'culture' },
  { dir: 'Special events', category: 'events' },
];

function listFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|heic|heif)$/i.test(f))
    .sort();
}

/** Hasler-Süsstrunk colourfulness on a downscaled image. Higher = more vivid. */
async function colourfulness(buf: Buffer): Promise<number> {
  const { data, info } = await sharp(buf)
    .resize(80, 80, { fit: 'inside' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const px = info.width * info.height;
  let sumRG = 0, sumYB = 0, sumRG2 = 0, sumYB2 = 0;
  for (let i = 0; i < data.length; i += 3) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const rg = r - g;
    const yb = 0.5 * (r + g) - b;
    sumRG += rg; sumYB += yb; sumRG2 += rg * rg; sumYB2 += yb * yb;
  }
  const meanRG = sumRG / px, meanYB = sumYB / px;
  const stdRG = Math.sqrt(Math.max(0, sumRG2 / px - meanRG * meanRG));
  const stdYB = Math.sqrt(Math.max(0, sumYB2 / px - meanYB * meanYB));
  const stdRoot = Math.sqrt(stdRG * stdRG + stdYB * stdYB);
  const meanRoot = Math.sqrt(meanRG * meanRG + meanYB * meanYB);
  return stdRoot + 0.3 * meanRoot;
}

async function main() {
  const manifest: Record<string, { url: string; width: number; height: number; colour: number; src: string }[]> = {};

  for (const src of SOURCES) {
    const dir = path.join(ROOT, src.dir);
    const files = listFiles(dir);
    if (!files.length) continue;
    console.log(`\n${src.dir} → media/${src.category}: ${files.length} file(s)`);
    manifest[src.category] ??= [];

    for (let i = 0; i < files.length; i++) {
      const file = path.join(dir, files[i]);
      const baseName = `${src.dir.replace(/[^a-z0-9]/gi, '-')}-${path.parse(files[i]).name}`.toLowerCase();
      try {
        const asset = await ingestLocalImage(file, {
          folder: `media/${src.category}`,
          name: baseName,
          alt: `KO-SA Beach Resort`,
          maxEdge: 2200,
          quality: 84,
        });
        const colour = await colourfulness(await readLocalAsBuffer(file));
        manifest[src.category].push({
          url: asset.url,
          width: asset.width,
          height: asset.height,
          colour: Math.round(colour * 10) / 10,
          src: files[i],
        });
        process.stdout.write(`  ✓ ${asset.width}x${asset.height} colour=${Math.round(colour)}\n`);
      } catch (e: any) {
        console.warn(`  ✗ ${files[i]}: ${e.message}`);
      }
    }
  }

  fs.writeFileSync('/tmp/media-manifest.json', JSON.stringify(manifest, null, 2));
  const total = Object.values(manifest).reduce((n, a) => n + a.length, 0);
  console.log(`\nDone. ${total} images ingested across ${Object.keys(manifest).length} categories.`);
  console.log('Manifest → /tmp/media-manifest.json');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('FAILED:', e);
    process.exit(1);
  });
