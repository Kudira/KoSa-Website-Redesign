import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ARTIFACT_DIRS = [
  'C:/Users/GusTavo/.gemini/antigravity/brain/a054f840-6b69-48f9-b5d0-8be817528460',
  'C:/Users/GusTavo/.gemini/antigravity/brain/1b70be61-df8d-4a0b-9514-2fe6acc18c90',
  'C:/Users/GusTavo/.gemini/antigravity/brain/81356192-8309-4435-8431-09efb0aee0c2',
  'C:/Users/GusTavo/.gemini/antigravity/brain/b2787826-de9b-43b4-aec0-4edb320b7424',
  'C:/Users/GusTavo/.gemini/antigravity/brain/044307ff-2b43-4220-8e2a-f2e8bb03870f',
  'C:/Users/GusTavo/.gemini/antigravity/brain/bdbfc77a-cc5e-4264-b62f-1fa60ce20149',
  'C:/Users/GusTavo/.gemini/antigravity/brain/164f23d7-de63-4cd5-8663-e3183b3ee30e'
];
const PUBLIC_MEDIA_DIR = 'c:/Users/GusTavo/Desktop/Akwaba-Stays/Dev/Kosa-Beach/public/media';

const mappings = [
  { prefix: 'about_hero_goldenhour', dest: 'about/about-hero-resort-goldenhour.webp' },
  { prefix: 'book_welcome_arrival', dest: 'book/book-welcome-arrival.webp' },
  { prefix: 'virtual_tour_teaser', dest: 'home/virtual-tour-teaser-suite.webp' },
  { prefix: 'vt_hero_common', dest: 'virtual-tour/vt-hero-common-spaces.webp' },
  
  { prefix: 'mon_beach_yoga', dest: 'experiences/daily/mon-beach-yoga.webp' },
  { prefix: 'tue_beach_walk', dest: 'experiences/daily/tue-beach-walk.webp' },
  { prefix: 'wed_meditation', dest: 'experiences/daily/wed-meditation.webp' },
  { prefix: 'thu_fishing_village', dest: 'experiences/daily/thu-fishing-village.webp' },
  { prefix: 'fri_drumming', dest: 'experiences/daily/fri-drumming.webp' },
  { prefix: 'sat_village_tour', dest: 'experiences/daily/sat-village-tour.webp' },
  { prefix: 'sun_sunset', dest: 'experiences/daily/sun-sunset.webp' },

  { prefix: 'weekend_getaway', dest: 'packages/weekend-getaway.webp' },
  { prefix: 'kosa_reset', dest: 'packages/kosa-reset.webp' },
  { prefix: 'kosa_romance', dest: 'packages/kosa-romance.webp' },
  { prefix: 'proposal_experience', dest: 'packages/proposal-experience.webp' },
  { prefix: 'birthday_celebration', dest: 'packages/birthday-celebration.webp' },
  { prefix: 'heritage_soul_retreat', dest: 'packages/heritage-soul-retreat.webp' },
  { prefix: 'kosa_day_pass', dest: 'packages/kosa-day-pass.webp' },
  { prefix: 'slow_beach_escape', dest: 'packages/slow-beach-escape.webp' },

  { prefix: 'weddings', dest: 'events/weddings.webp' },
  { prefix: 'naming_ceremony', dest: 'events/naming-ceremony.webp' },
  { prefix: 'city_tour', dest: 'events/city-tour.webp' },
  { prefix: 'kakum_tour', dest: 'events/kakum-tour.webp' },
  { prefix: 'bead_making', dest: 'events/bead-making.webp' },
  { prefix: 'bird_watching', dest: 'events/bird-watching.webp' },
  { prefix: 'market_tour_cooking', dest: 'events/market-tour-cooking.webp' }
];

async function main() {
  const allFiles = [];
  for (const dir of ARTIFACT_DIRS) {
    if (fs.existsSync(dir)) {
      const dirFiles = fs.readdirSync(dir).map(f => ({ name: f, dir }));
      allFiles.push(...dirFiles);
    } else {
      console.warn(`Artifact directory not found: ${dir}`);
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

    // Sort to get the latest one (based on the timestamp suffix)
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
