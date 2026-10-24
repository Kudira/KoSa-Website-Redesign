// Zero-dependency PDF generator for the KoSa image-generation prompt sheet.
// Uses the built-in Courier / Courier-Bold PDF fonts (monospace -> deterministic
// wrapping). ASCII only. Run: node scripts/generate-image-prompts-pdf.mjs [out.pdf]
import { writeFileSync } from 'node:fs';

const PAGE_W = 612, PAGE_H = 792, MARGIN = 54, BOTTOM = 60;
const FONT = { F1: 'Courier', F2: 'Courier-Bold' };

const pages = [];
let cur = [];
let y = PAGE_H - MARGIN;
const usable = PAGE_W - 2 * MARGIN;

function newPage() { pages.push(cur); cur = []; y = PAGE_H - MARGIN; }
function wrap(text, size, indent) {
  const max = Math.max(8, Math.floor((usable - indent) / (size * 0.6)));
  const out = [];
  for (const para of String(text).split('\n')) {
    let line = '';
    for (const w of para.split(/\s+/)) {
      if (!w) continue;
      if (w.length > max) { if (line) { out.push(line); line = ''; } let s = w; while (s.length > max) { out.push(s.slice(0, max)); s = s.slice(max); } line = s; continue; }
      if ((line ? line.length + 1 + w.length : w.length) <= max) line = line ? line + ' ' + w : w;
      else { out.push(line); line = w; }
    }
    out.push(line);
  }
  return out;
}
function draw(font, size, leading, text, indent = 0) {
  for (const ln of wrap(text, size, indent)) {
    if (y - leading < BOTTOM) newPage();
    cur.push({ x: MARGIN + indent, y, font, size, text: ln });
    y -= leading;
  }
}
const gap = (n) => { y -= n; };
const h1 = (t) => { draw('F2', 16, 21, t); gap(6); };
const h2 = (t) => { if (y < BOTTOM + 90) newPage(); gap(10); draw('F2', 13, 17, t); gap(4); };
const h3 = (t) => { if (y < BOTTOM + 60) newPage(); gap(7); draw('F2', 10.5, 14, t); };
const body = (t) => { draw('F1', 9.5, 13, t); };
const meta = (t) => { draw('F1', 9, 12, t); };
const prompt = (t) => { gap(2); draw('F1', 9.5, 12.5, 'PROMPT: ' + t, 8); };

// ---- Content -------------------------------------------------------------
h1('KoSa - Image Generation Prompts (Nano Banana)');
body('Generated for KoSa Beach Resort. Purpose: a thorough audit found images that are repeated across the site, plus empty image slots (Stay Packages) and a section with no imagery (Free Daily Activities). Below is one ready-to-use prompt per image, written for realistic, non-AI-looking results. Paste a single prompt into Nano Banana (Google Gemini image) to generate that image, then hand the files back to be compressed and wired in.');
gap(4);
h2('How to get realistic (not AI-looking) results');
body('Every prompt already bakes in these directives, but keep them in mind if you tweak:');
meta('- Ask for a photograph: full-frame camera, a real lens (24/35/50/85mm), natural available light.');
meta('- Say candid / documentary / editorial, unposed, real Ghanaian people, true-to-life skin tones.');
meta('- Demand genuine textures and subtle imperfections; forbid plastic smoothness and CGI look.');
meta('- Always end with: not an illustration, not a 3D render, no text, no logo, no watermark.');
meta('- Match the aspect ratio noted on each item so the crop fits the slot.');
meta('- If a face looks off, re-generate; pick frames where hands and eyes read naturally.');

h2('A. Repeated images across pages (replace the duplicate)');
body('Three photos are each used in more than one place. Keep the original where it fits best and generate a fresh image for the other slot(s).');

h3('A1. About page hero  (replaces the repeat of the homepage Feeling photo)');
meta('Repeat: media/feeling/slowing-down-guests.webp is on the homepage Feeling section AND the /about hero.');
meta('Keep original on: homepage Feeling.   Generate new for: /about hero.   Aspect: 16:9.');
meta('Suggested filename: media/about/about-hero-resort-goldenhour.webp');
prompt('Wide golden-hour establishing shot of an eco-luxury beach resort on Ghana\'s Atlantic coast near Elmina. Thatched-roof lodges and airy timber buildings nestled among tall coconut palms, opening onto a long quiet golden-sand beach with gentle surf. A staff member in simple linen walks a stone garden path carrying a tray. Warm low side light, soft long shadows, hazy sea horizon. Keep the lower-left calmer and slightly darker for a headline overlay. Photorealistic candid editorial travel photograph, full-frame 24mm, deep focus, real Ghanaian people with true-to-life skin tones, natural light, genuine textures, no plastic AI smoothness, not an illustration, not a 3D render, no text, no logo, no watermark. Aspect ratio 16:9.');

h3('A2. Book page hero  (replaces the repeat of the Rooms hero photo)');
meta('Repeat: rooms/luxury-double-sea-view/0-LDRWSV.webp is on /rooms hero, /book hero and the home Virtual Tour teaser.');
meta('Keep original on: /rooms hero.   Generate new for: /book hero.   Aspect: 16:9.');
meta('Suggested filename: media/book/book-welcome-arrival.webp');
prompt('A warm arrival moment at a Ghanaian beach resort reception. A smiling Ghanaian host in linen hands a welcome drink (deep-red hibiscus juice with a slice of lime) to newly arrived guests in an open-air lobby framed by coconut palms and raffia screens, a glimpse of turquoise ocean behind. Relaxed, genuine, late-morning natural light. Photorealistic candid editorial photograph, full-frame 35mm, shallow depth of field, real Ghanaian people with true-to-life skin tones, natural textures, unposed, no plastic AI smoothness, not an illustration, not a 3D render, no text, no logo, no watermark. Aspect ratio 16:9.');

h3('A3. Home Virtual Tour teaser  (replaces the repeat of the Rooms hero photo)');
meta('Same repeat as A2. Generate new for: the "step inside" card in components/home/VirtualTourTeaser.   Aspect: 16:9.');
meta('Suggested filename: media/home/virtual-tour-teaser-suite.webp');
prompt('Inviting interior of a sea-view suite at an eco-luxury Ghanaian beach resort. A neatly made bed with crisp white linen, natural wood and woven-palm details, sheer curtains drifting at open balcony doors that frame the Atlantic and palm tops. Soft morning light pooling on the floor, calm and immersive, inviting you to step inside. Photorealistic interior photograph, full-frame 24mm, deep focus, natural light, real materials and textures, no plastic AI smoothness, not an illustration, not a 3D render, no text, no logo, no watermark. Aspect ratio 16:9.');

h3('A4. Virtual Tour page hero  (replaces the repeat of the Gallery hero photo)');
meta('Repeat: rooms/deluxe-twin-sea-view/0-DTRWSV.webp is on the /gallery hero AND the /virtual-tour hero.');
meta('Keep original on: /gallery hero.   Generate new for: /virtual-tour hero.   Aspect: 16:9.');
meta('Suggested filename: media/virtual-tour/vt-hero-common-spaces.webp');
prompt('Wide immersive view of the open-air common areas of a Ghanaian beach resort. A timber-and-thatch restaurant deck and lounge with woven chairs and hanging lanterns opening to a swimming pool and the golden-sand beach and Atlantic beyond, coconut palms overhead, a few relaxed guests in the distance. Warm afternoon light, a sense of exploration. Photorealistic editorial travel/architecture photograph, full-frame 20mm, deep focus, natural light, authentic textures, no plastic AI smoothness, not an illustration, not a 3D render, no text, no logo, no watermark. Aspect ratio 16:9.');

h2('B. Free Daily Activities - card backgrounds (experiences page)');
body('The Free Daily Activities cards are currently plain cream cards with no imagery. Add one soft background photo per day card (behind the day\'s list). Keep them atmospheric with calm negative space so the overlaid text stays legible. Portrait orientation suits the tall cards. Suggested folder: media/experiences/daily/.');

const B = [
  ['B1. Monday - Morning Beach Yoga', 'mon-beach-yoga',
   'Sunrise beach yoga on Ghana\'s Atlantic coast. A small mixed group on yoga mats on smooth golden sand in a gentle seated stretch, calm ocean and soft pink-gold dawn sky behind, coconut palms to one side. Serene and airy with plenty of empty sky at the top for text. Backlit soft morning light, light sea haze. Photorealistic candid photograph, full-frame 35mm, real people with true-to-life skin tones, natural light, no plastic AI smoothness, not an illustration, not a 3D render, no text, no logo, no watermark. Aspect ratio 3:4 (portrait).'],
  ['B2. Tuesday - Beach Walk', 'tue-beach-walk',
   'Early-morning beach walk. A single person strolling barefoot along an empty white-gold shoreline, wet sand reflecting soft light, a line of footprints, gentle Atlantic surf, palms leaning at the edge. Quiet, minimal, breezy, with calm negative space. Soft golden morning light. Photorealistic candid photograph, full-frame 50mm, natural light, true-to-life skin tones, no plastic AI smoothness, not an illustration, not a 3D render, no text, no logo, no watermark. Aspect ratio 3:4 (portrait).'],
  ['B3. Wednesday - Sunrise Meditation and Stretching', 'wed-meditation',
   'A guided sunrise meditation on the beach. A person sitting cross-legged on golden sand among coconut palms, eyes closed, palms resting on knees, soft dawn light filtering through the fronds, calm ocean behind. Peaceful and still with generous empty space above for text. Warm backlight, gentle god-rays. Photorealistic candid photograph, full-frame 50mm, shallow depth of field, true-to-life skin tones, natural textures, no plastic AI smoothness, not an illustration, not a 3D render, no text, no logo, no watermark. Aspect ratio 3:4 (portrait).'],
  ['B4. Thursday - Guided Walk to the Fishing Village (Ampenyi)', 'thu-fishing-village',
   'A guided walk through a Ghanaian fishing village near the resort. Brightly painted wooden fishing canoes pulled up on the sand, weathered nets drying, local fishermen at work while a resort guide and a couple of guests look on. Authentic coastal village life, warm mid-morning light. Photorealistic candid documentary photograph, full-frame 35mm, real Ghanaian people with true-to-life skin tones, natural light, genuine textures, no plastic AI smoothness, not an illustration, not a 3D render, no text, no logo, no watermark. Aspect ratio 3:4 (portrait).'],
  ['B5. Friday - Drumming Lessons', 'fri-drumming',
   'A hands-on West African drumming lesson at a beach resort. A Ghanaian drummer teaching a small group to play djembe and conga drums under coconut palms, hands mid-beat on goat-skin drum heads, warm smiles and movement. Energetic but relaxed, dappled late-afternoon light with slight motion in the hands. Photorealistic candid photograph, full-frame 35mm, real Ghanaian people with true-to-life skin tones, natural light, authentic textures, no plastic AI smoothness, not an illustration, not a 3D render, no text, no logo, no watermark. Aspect ratio 3:4 (portrait).'],
  ['B6. Saturday - Tour of the Village', 'sat-village-tour',
   'An early-morning tour of a Ghanaian coastal village and market just waking up. Produce stalls with tomatoes, plantains and peppers, people setting up, a fishing boat heading out in the background, a resort guide leading a couple of guests. Warm soft morning light, candid street life, negative space in the sky. Photorealistic candid documentary photograph, full-frame 35mm, real Ghanaian people with true-to-life skin tones, natural light, no plastic AI smoothness, not an illustration, not a 3D render, no text, no logo, no watermark. Aspect ratio 3:4 (portrait).'],
  ['B7. Sunday - Sunset Watching, Golden Hour', 'sun-sunset',
   'Golden-hour sunset on the Atlantic. The silhouettes of two or three guests on the beach watching the sun drop to the horizon, drinks in hand, a warm orange-and-pink sky reflected on wet sand, palms dark against the glow. Warm, glowing and dreamy with empty sky for text. Backlit, any lens flare kept subtle and natural. Photorealistic candid photograph, full-frame 50mm, true-to-life skin tones, natural light, no plastic AI smoothness, not an illustration, not a 3D render, no text, no logo, no watermark. Aspect ratio 3:4 (portrait).'],
];
for (const [title, slug, p] of B) { h3(title); meta('Suggested filename: media/experiences/daily/' + slug + '.webp'); prompt(p); }

h2('C. Stay Packages - card images (plan page)');
body('All 8 Stay Packages have no image, so their cards on /plan currently show a plain gradient. Generate one image per package, matched to its theme. Card aspect is 16:10. Suggested folder: media/packages/.');

const C = [
  ['C1. Weekend Getaway  ("Everything Accra is not. For two days")', 'weekend-getaway',
   'A relaxed weekend escape at a Ghanaian beach resort. Two friends or a couple unwinding on wooden sun loungers under a canvas umbrella on golden sand, cold drinks on a side table, turquoise Atlantic and palms behind, shoes kicked off. Easy, carefree Friday-afternoon mood, warm natural light. Photorealistic candid photograph, full-frame 35mm, real people with true-to-life skin tones, natural light, no plastic AI smoothness, not an illustration, not a 3D render, no text, no logo, no watermark. Aspect ratio 16:10.'],
  ['C2. The KoSa Reset  (wellness, "ocean air, healing rituals and stillness")', 'kosa-reset',
   'A calm wellness morning by the sea. A single guest in soft linen sitting quietly with a cup of herbal tea on a wooden deck overlooking the misty Atlantic at dawn, a rolled yoga mat and a few smooth stones nearby, palms in soft focus. Serene, restorative, minimal, cool soft morning light. Photorealistic candid photograph, full-frame 50mm, shallow depth of field, true-to-life skin tones, natural textures, no plastic AI smoothness, not an illustration, not a 3D render, no text, no logo, no watermark. Aspect ratio 16:10.'],
  ['C3. The KoSa Romance  ("Where the Atlantic meets your love story")', 'kosa-romance',
   'An intimate candlelit dinner for two on the beach at dusk. A small table with a white cloth, warm candle lanterns and simple florals set on golden sand at the water\'s edge, a couple sharing a quiet moment, the last violet-orange light on the Atlantic behind. Romantic, warm, understated, candle glow. Photorealistic candid photograph, full-frame 50mm, shallow depth of field, real people with true-to-life skin tones, natural low light, no plastic AI smoothness, not an illustration, not a 3D render, no text, no logo, no watermark. Aspect ratio 16:10.'],
  ['C4. The Proposal Experience  ("The Atlantic as your backdrop")', 'proposal-experience',
   'A beach proposal at sunset on Ghana\'s Atlantic coast. A romantic setup on golden sand with a simple arch of tropical flowers, scattered rose petals and lanterns, a couple in silhouette at the moment of a proposal, a glowing orange sky over the ocean. Emotional, cinematic, warm. Photorealistic candid photograph, full-frame 85mm, shallow depth of field, true-to-life skin tones, natural golden light, no plastic AI smoothness, not an illustration, not a 3D render, absolutely no text or signage, no logo, no watermark. Aspect ratio 16:10.'],
  ['C5. Birthday Celebration  ("a birthday with the ocean")', 'birthday-celebration',
   'A joyful beach birthday celebration at a Ghanaian resort in the early evening. A wooden table set on the sand with a small decorated cake, tropical fruit and drinks, warm fairy lights and a few balloons, friends laughing together, palms and a darkening sea behind. Festive, warm, candid, warm evening light. Photorealistic candid photograph, full-frame 35mm, real people with true-to-life skin tones, natural light, no plastic AI smoothness, not an illustration, not a 3D render, no text, no logo, no watermark. Aspect ratio 16:10.'],
  ['C6. Heritage and Soul Retreat  ("Come home to yourself")', 'heritage-soul-retreat',
   'A moving diaspora homecoming moment at a Ghanaian beach resort. A small group dressed in white with kente-cloth accents gathered on the sand for a welcome blessing, an elder and a drummer present, warm and heartfelt, coconut palms and the Atlantic behind. Cultural, dignified, emotional, warm late-afternoon light. Photorealistic candid documentary photograph, full-frame 35mm, real Ghanaian and diaspora people with true-to-life skin tones, natural light, authentic fabrics and textures, no plastic AI smoothness, not an illustration, not a 3D render, no text, no logo, no watermark. Aspect ratio 16:10.'],
  ['C7. The KoSa Day Pass  ("No room needed. Just a great day by the sea")', 'kosa-day-pass',
   'A bright midday scene of day guests enjoying a Ghanaian beach resort. People relaxing on loungers under umbrellas by a clean swimming pool, a couple walking to the golden-sand beach with towels, drinks and a light lunch on a table, palms and turquoise Atlantic behind. Sunny, breezy, welcoming, bright natural midday light. Photorealistic candid photograph, full-frame 28mm, real people with true-to-life skin tones, natural light, no plastic AI smoothness, not an illustration, not a 3D render, no text, no logo, no watermark. Aspect ratio 16:10.'],
  ['C8. The Slow Beach Escape  (eco, "No agenda. Just ocean, good food and time to breathe")', 'slow-beach-escape',
   'An utterly relaxed slow escape. A striped hammock slung between two coconut palms in a lush green eco-garden by the beach, an open book and a glass of fresh juice resting nearby, dappled sunlight, the Atlantic just visible through the palms. Peaceful, unhurried, eco-luxe, warm dappled light, shallow depth of field. Photorealistic photograph, full-frame 50mm, natural light, authentic textures, no plastic AI smoothness, not an illustration, not a 3D render, no text, no logo, no watermark. Aspect ratio 16:10.'],
];
for (const [title, slug, p] of C) { h3(title); meta('Suggested filename: media/packages/' + slug + '.webp'); prompt(p); }

h2('D. Events reusing generic gallery photos (replace the duplicate)');
body('These 7 event tiles currently reuse photos that also appear in the public Gallery (or the dining venue). Give each its own purpose-shot. Aspect: 4:3 (or 3:4 if your event tiles are tall). Suggested folder: media/events/.');

const D = [
  ['D1. Weddings and Celebrations  (currently reuses a gallery events photo)', 'weddings',
   'An elegant beach wedding ceremony at a Ghanaian resort. Rows of simple white chairs on golden sand facing a floral arch at the water\'s edge, a couple at the altar, guests in bright attire, the Atlantic and palms behind, warm late-afternoon light. Joyful and refined. Photorealistic candid photograph, full-frame 35mm, real people with true-to-life skin tones, natural light, authentic textures, no plastic AI smoothness, not an illustration, not a 3D render, no text, no logo, no watermark. Aspect ratio 4:3.'],
  ['D2. Naming Ceremony  (currently reuses a gallery events photo)', 'naming-ceremony',
   'An authentic Ghanaian outdoor naming ceremony at a beach resort. Family and friends dressed in white and kente cloth gathered around an elder holding an infant, drummers to the side, warm and celebratory, palms and golden sand around them. Documentary, heartfelt, culturally accurate, warm natural light. Photorealistic candid documentary photograph, full-frame 35mm, real Ghanaian people with true-to-life skin tones, natural light, genuine fabrics and textures, no plastic AI smoothness, not an illustration, not a 3D render, no text, no logo, no watermark. Aspect ratio 4:3.'],
  ['D3. Guided City Tour  (currently reuses gallery scenery-kosa2)', 'city-tour',
   'A guided city tour of historic Elmina on Ghana\'s coast. Weathered colonial-era buildings and colourful streets, a fishing harbour with painted canoes, a local guide walking with a couple of visitors, everyday street life. Documentary, warm, authentic, bright natural daylight. Photorealistic candid documentary photograph, full-frame 35mm, real Ghanaian people with true-to-life skin tones, natural light, no plastic AI smoothness, not an illustration, not a 3D render, no text, no logo, no watermark. Aspect ratio 4:3.'],
  ['D4. Kakum Tour  (currently reuses gallery scenery-kosa3)', 'kakum-tour',
   'The famous canopy walkway at Kakum National Park, Ghana. A long rope-and-timber suspension bridge strung high between giant rainforest trees, dense green canopy stretching to a misty horizon, one or two visitors crossing carefully. Lush, adventurous, atmospheric, soft diffused forest light with light mist. Photorealistic travel photograph, full-frame 24mm, deep focus, natural light, authentic textures, no plastic AI smoothness, not an illustration, not a 3D render, no text, no logo, no watermark. Aspect ratio 4:3.'],
  ['D5. Bead Making Class  (currently reuses a gallery environment photo)', 'bead-making',
   'A hands-on Ghanaian glass-bead making class. A close view of hands stringing colourful traditional recycled-glass Krobo beads on a worktable scattered with vivid beads, an artisan guiding a guest, warm workshop light. Tactile, colourful, authentic craft. Photorealistic candid photograph, full-frame 50mm, shallow depth of field, real hands with true-to-life skin tones, natural light, genuine textures, no plastic AI smoothness, not an illustration, not a 3D render, no text, no logo, no watermark. Aspect ratio 4:3.'],
  ['D6. Bird Watching  (currently reuses a gallery environment photo)', 'bird-watching',
   'A gentle bird-watching moment at the green edge of a Ghanaian coastal eco-resort. A guest raising binoculars at the edge of a lush garden and wetland in soft morning light, a colourful tropical bird (kingfisher or weaver) perched on a reed nearby, palms and mist behind. Calm, natural, immersive, shallow depth of field. Photorealistic wildlife/travel photograph, true-to-life skin tones and natural feather detail, natural light, no plastic AI smoothness, not an illustration, not a 3D render, no text, no logo, no watermark. Aspect ratio 4:3.'],
  ['D7. Market Tour with Cooking  (currently reuses the dining venue photo)', 'market-tour-cooking',
   'A lively Ghanaian open-air market tour. Colourful stalls piled with tomatoes, peppers, plantains, yams and spices, a chef in an apron and a couple of guests choosing ingredients, vendors and shoppers around them, bright and bustling. Warm daylight, candid documentary energy. Photorealistic candid documentary photograph, full-frame 28mm, real Ghanaian people with true-to-life skin tones, natural light, authentic textures, no plastic AI smoothness, not an illustration, not a 3D render, no text, no logo, no watermark. Aspect ratio 4:3.'],
];
for (const [title, slug, p] of D) { h3(title); meta('Suggested filename: media/events/' + slug + '.webp'); prompt(p); }

h2('Notes / non-issues');
body('- Every room uses its hero photo as the first gallery slide (room.image == gallery[0]). That is intentional (cover = first slide), not a problem.');
body('- Seven more Event tiles also reuse generic gallery photos (Cooking Class, Drumming and Dancing, Castle Tours, Market Tour, Batik Making, Painting Class, Horse Back Riding). They work, but if you want each event to feel unique you can generate purpose-shots for them too using the same style as section D.');
body('- After you generate the images, drop them into a folder and they can be compressed to WebP, uploaded to storage, and wired into the exact slots above (Stay Packages and Daily Activities also need a small code change to display an image).');

// ---- footers + assemble --------------------------------------------------
newPage();
pages.forEach((pg, i) => {
  const t = 'KoSa image-generation prompts   -   page ' + (i + 1) + ' of ' + pages.length;
  const w = t.length * 8 * 0.6;
  pg.push({ x: (PAGE_W - w) / 2, y: 34, font: 'F1', size: 8, text: t });
});

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
const streamFor = (list) =>
  list.map((d) => `BT /${d.font} ${d.size} Tf 1 0 0 1 ${d.x.toFixed(2)} ${d.y.toFixed(2)} Tm (${esc(d.text)}) Tj ET`).join('\n') + '\n';

const P = pages.length;
const offsets = {};
let out = '';
const put = (s) => { out += s; };
const obj = (n) => { offsets[n] = out.length; put(`${n} 0 obj\n`); };

put('%PDF-1.4\n%\xff\xff\xff\xff\n');
obj(1); put('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
const kids = pages.map((_, p) => `${5 + p * 2} 0 R`).join(' ');
obj(2); put(`<< /Type /Pages /Kids [ ${kids} ] /Count ${P} >>\nendobj\n`);
obj(3); put(`<< /Type /Font /Subtype /Type1 /BaseFont /${FONT.F1} >>\nendobj\n`);
obj(4); put(`<< /Type /Font /Subtype /Type1 /BaseFont /${FONT.F2} >>\nendobj\n`);
pages.forEach((pg, p) => {
  const pageNum = 5 + p * 2, contentNum = 6 + p * 2;
  obj(pageNum);
  put(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentNum} 0 R >>\nendobj\n`);
  const stream = streamFor(pg);
  obj(contentNum);
  put(`<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}endstream\nendobj\n`);
});
const total = 4 + 2 * P;
const xref = out.length;
put(`xref\n0 ${total + 1}\n0000000000 65535 f \n`);
for (let n = 1; n <= total; n++) put(String(offsets[n]).padStart(10, '0') + ' 00000 n \n');
put(`trailer\n<< /Size ${total + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);

const dest = process.argv[2] || 'files/KoSa-Image-Generation-Prompts.pdf';
writeFileSync(dest, Buffer.from(out, 'latin1'));
console.log(`Wrote ${dest} - ${P} pages, ${(out.length / 1024).toFixed(1)} KB`);
