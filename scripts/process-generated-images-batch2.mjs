import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const BRAIN_DIR = 'C:/Users/GusTavo/.gemini/antigravity/brain';
const PUBLIC_MEDIA_DIR = 'c:/Users/GusTavo/Desktop/Akwaba-Stays/Dev/Kosa-Beach/public/media-batch2';

const mappings = [
  // Treatments
  { prefix: 'deepcore_massage', dest: 'wellness/treatments/deepcore-massage.webp' },
  { prefix: 'couples_massage', dest: 'wellness/treatments/couples-massage.webp' },
  { prefix: 'swedish_massage', dest: 'wellness/treatments/swedish-massage.webp' },
  { prefix: 'holistic_massage', dest: 'wellness/treatments/holistic-massage.webp' },
  { prefix: 'reflexology', dest: 'wellness/treatments/reflexology.webp' },
  { prefix: 'pedicure', dest: 'wellness/treatments/pedicure.webp' },
  { prefix: 'herbal_detox_steam', dest: 'wellness/treatments/herbal-detox-steam.webp' },
  { prefix: 'glow_polish_facial', dest: 'wellness/treatments/glow-polish-facial.webp' },
  { prefix: 'full_body_glow', dest: 'wellness/treatments/full-body-glow-polish.webp' },
  { prefix: 'escape_1day', dest: 'wellness/treatments/1-day-regenerative-escape.webp' },
  { prefix: 'reset_2day', dest: 'wellness/treatments/2-day-coastal-reset.webp' },
  { prefix: 'renewal_3day', dest: 'wellness/treatments/3-day-full-renewal.webp' },

  // Batch 2
  { prefix: 'wellness_journeys', dest: 'wellness/wellness-journeys-v2.webp' },
  { prefix: 'wellness_coaching', dest: 'wellness/wellness-coaching-v2.webp' },
  { prefix: 'wellness_day', dest: 'wellness/wellness-day-v2.webp' },
  { prefix: 'cultural_rituals', dest: 'experiences/cultural-rituals.webp' },
  { prefix: 'drumming_dancing_v2', dest: 'events/drumming-dancing.webp' },
  { prefix: 'cooking_class_v2', dest: 'events/cooking-class.webp' },
  { prefix: 'castle_tours_v2', dest: 'events/castle-tours.webp' },
  { prefix: 'market_tour_v2', dest: 'events/market-tour.webp' },
  { prefix: 'batik_making_v2', dest: 'events/batik-making.webp' },
  { prefix: 'painting_class_v2', dest: 'events/painting-class.webp' },
  { prefix: 'horse_riding_v2', dest: 'events/horse-riding.webp' },
  { prefix: 'blog_slowing_down', dest: 'blog/art-of-slowing-down.webp' },
  { prefix: 'blog_kakum_canopy', dest: 'blog/kakum-canopy.webp' },
  { prefix: 'blog_hands_on', dest: 'blog/hands-on-ghana.webp' },
  { prefix: 'blog_wellness', dest: 'blog/wellness-the-kosa-way.webp' },
  { prefix: 'blog_eco_luxury', dest: 'blog/eco-luxury.webp' }
];

async function main() {
  if (!fs.existsSync(BRAIN_DIR)) {
    console.error(`Brain directory not found: ${BRAIN_DIR}`);
    process.exit(1);
  }

  // Scan all directories under brain/
  const subdirs = fs.readdirSync(BRAIN_DIR)
    .map(name => path.join(BRAIN_DIR, name))
    .filter(p => fs.statSync(p).isDirectory());

  // Collect all files from all subdirs
  const allFiles = [];
  for (const dir of subdirs) {
    try {
      const files = fs.readdirSync(dir).map(f => ({ name: f, dir }));
      allFiles.push(...files);
    } catch (err) {
      // Ignore directory read errors
    }
  }

  let successCount = 0;

  for (const mapping of mappings) {
    // Find files matching the prefix
    const matching = allFiles.filter(f => f.name.startsWith(mapping.prefix + '_') && f.name.endsWith('.png'));
    if (matching.length === 0) {
      console.warn(`[MISSING] No generated image found for prefix: ${mapping.prefix}`);
      continue;
    }

    // Sort to get the latest one (based on the timestamp suffix in name)
    matching.sort((a, b) => a.name.localeCompare(b.name));
    const latest = matching[matching.length - 1];
    const sourcePath = path.join(latest.dir, latest.name);
    const targetPath = path.join(PUBLIC_MEDIA_DIR, mapping.dest);

    // Create target dir if missing
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });

    try {
      console.log(`Processing: ${latest.name} -> ${mapping.dest}`);
      await sharp(sourcePath)
        .webp({ quality: 85 })
        .toFile(targetPath);
      console.log(`  ✓ Saved WebP to: ${targetPath}`);
      successCount++;
    } catch (err) {
      console.error(`  ✗ Failed to process ${latest.name}:`, err.message);
    }
  }

  console.log(`\nProcessed ${successCount}/${mappings.length} images.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
