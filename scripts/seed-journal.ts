// Seed the Journal with genuine KO-SA stories. Content is grounded in the
// resort's real offering (ko-sa.com Activities, Wellness, About): Kakum, Cape
// Coast & Elmina castles, cooking/drumming/batik workshops, wellness rituals,
// the fishing village of Ampenyi, and slow coastal living. Imagery is the
// owner's own photography already in Supabase.
//
// Voice follows the brand guide: warm, nurturing, "every phrase an exhale."
//
//   npm run seed:journal
//
// Idempotent: upserts each post by slug. Re-run safely.

import './_env';
import { prisma } from '../lib/prisma';

const M = 'https://ubsgvfouroqkgqufzeat.supabase.co/storage/v1/object/public/kosa-public/media';

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  author: string;
  tags: string[];
  daysAgo: number;
  readMins: number;
  body: string; // simple HTML
};

const POSTS: Post[] = [
  {
    slug: 'the-art-of-slowing-down',
    title: 'The art of slowing down',
    excerpt:
      'There is no rush at Ko-Sa, and that is the whole point - a few quiet notes on letting the coast set your pace',
    image: `${M}/scenery/scenery-kosa2.webp`,
    author: 'The Ko-Sa Journal',
    tags: ['Slow living', 'Wellness'],
    daysAgo: 4,
    readMins: 4,
    body: `
<p>The first thing the coast asks of you is to slow down. Not all at once - the body keeps its city rhythm for a day or so, reaching for a phone that does not need to be checked, planning a morning that does not need a plan. Then the second morning arrives, and something loosens.</p>
<p>At Ko-Sa we have spent over two decades learning that rest is not a luxury added on top of a holiday. It is the holiday. The sea keeps a slower time than we do, and when you stay close to it for long enough, you start to borrow its pace.</p>
<h2>Let the day arrive on its own</h2>
<p>Wake without an alarm. Take your tea to the terrace and watch the fishermen bring in the morning catch. Swim before breakfast, while the water is still cool and the beach is yours. There is nowhere you need to be.</p>
<p>This is what we mean when we say <em>simply, breathe</em> - fewer choices, more presence. The garden, the hammock, the long lunch that turns into an afternoon. You did not come all this way to be busy.</p>
<h2>A gentle invitation</h2>
<p>If slowing down feels difficult at first, that is normal. Begin with one thing: a barefoot walk along the shore at dusk, a cup of herbal tea with no screen in sight. The rest follows on its own.</p>
`,
  },
  {
    slug: 'a-morning-with-the-fishermen-of-ampenyi',
    title: 'A morning with the fishermen of Ampenyi',
    excerpt:
      'The wooden boats have come ashore at dawn for generations - a look at the village that has shaped Ko-Sa from the beginning',
    image: `${M}/culture/fisherfolks-img_8775.webp`,
    author: 'The Ko-Sa Journal',
    tags: ['Community', 'Culture'],
    daysAgo: 11,
    readMins: 5,
    body: `
<p>Ko-Sa sits beside the small fishing village of Ampenyi, and the two have grown up together. Long before the first guest arrived, the brightly painted boats were already drawing their nets onto this sand at first light. They still do.</p>
<p>Walk down to the water early enough and you will see it: the long canoes riding in on the swell, the calls between the crews, the careful sorting of the catch that will reach our kitchen by mid-morning. It is one of the most honest things you can witness on this coast.</p>
<h2>A partnership, not a backdrop</h2>
<p>The fishermen we buy from are neighbours, not scenery. Their work feeds our table, and your stay helps sustain theirs. It is a quiet kind of tourism - one where the village is better off for the resort being here, and the resort is richer for the village.</p>
<p>Ask, and we will introduce you. A handshake on the beach, a few words about the tides, an invitation to watch the nets come in. These are the moments guests remember long after the tan has faded.</p>
<h2>From net to plate</h2>
<p>Whatever comes ashore in the morning often appears at dinner - grilled simply over open fire, dressed with garden herbs and palm-wine glaze. Freshness you can taste, sourced from a few hundred metres away.</p>
`,
  },
  {
    slug: 'wellness-the-ko-sa-way',
    title: 'Wellness, the Ko-Sa way',
    excerpt:
      'Nature restores - our simple philosophy for body and mind, from sunrise yoga to the herbal tea waiting at arrival',
    image: `${M}/wellness/spa-img_3943.webp`,
    author: 'The Ko-Sa Journal',
    tags: ['Wellness', 'Rituals'],
    daysAgo: 18,
    readMins: 4,
    body: `
<p>Our wellness philosophy is simple: nature restores. We did not build a clinical spa with a long menu of treatments you cannot pronounce. We built a place where the sea air, the garden, and an unhurried day do most of the work, and a caring team does the rest.</p>
<h2>Begin gently</h2>
<p>It starts the moment you arrive, with a cup of herbal tea pressed warm into your hands. Then it unfolds at your pace: gentle yoga on the dune as the sun comes up, a massage with shea butter our kitchen also cooks with, a slow afternoon at the tea bar with nothing to do.</p>
<h2>Body, mind, and the space between</h2>
<p>Our wellness coaching is there for guests who want guidance - not a programme to complete, but a few quiet conversations toward calm and clarity. Sit with one of our team, breathe, and begin to find your way back to yourself.</p>
<p>Whether you come alone or with someone you love, we shape your time around what your body and mind actually need. That is the whole of it. Wellness here is not something you do; it is something you let happen.</p>
`,
  },
  {
    slug: 'a-day-in-the-canopy-kakum-and-beyond',
    title: 'A day in the canopy: Kakum and beyond',
    excerpt:
      'When you are ready to explore, the rainforest and the historic coast are an easy drive away - a guide to the day trips worth taking',
    image: `${M}/environment/general-environment-img_3964.webp`,
    author: 'The Ko-Sa Journal',
    tags: ['Adventure', 'Ghana'],
    daysAgo: 25,
    readMins: 6,
    body: `
<p>Ko-Sa is a place to be still - but when the urge to explore arrives, some of Ghana's most remarkable places are within easy reach. We will arrange the transport and a guide who knows these roads; you simply choose the day.</p>
<h2>Kakum National Park</h2>
<p>An hour or so inland, the rainforest canopy walkway strings seven rope bridges between giant trees, forty metres above the forest floor. It is exhilarating and serene at once - the green stretching to the horizon, birdsong rising from below. Go early, before the heat and the crowds.</p>
<h2>The castles of the coast</h2>
<p>Closer to home, Cape Coast Castle and Elmina Castle hold one of the most important and sobering histories in the world. A guided tour here is not a light morning, but it is a meaningful one - a reckoning with the past that deepens any visit to this coast.</p>
<h2>Closer still</h2>
<p>Prefer to stay near? A guided walk through Elmina's old town and harbour, a horseback ride along the shoreline, an afternoon of birdwatching in the wetlands. Whatever you choose, you return to Ko-Sa by evening, to the sound of the sea and a table set for you.</p>
`,
  },
  {
    slug: 'hands-on-ghana-cooking-drumming-and-craft',
    title: 'Hands on Ghana: cooking, drumming and craft',
    excerpt:
      'Some of the best afternoons here are spent making something - a short guide to the workshops that bring Ghanaian culture within reach',
    image: `${M}/food/food-copy-of-copy-of-copy-of-img_3471.webp`,
    author: 'The Ko-Sa Journal',
    tags: ['Culture', 'Experiences'],
    daysAgo: 33,
    readMins: 5,
    body: `
<p>You can learn a place by reading about it, or you can learn it with your hands. At Ko-Sa we lean toward the second. A handful of workshops, led by people who have practised these crafts their whole lives, turn an afternoon into a memory you carry home.</p>
<h2>In the kitchen</h2>
<p>Join a cooking class and learn to make the dishes you have been enjoying all week - jollof with its smoky depth, fresh-caught fish, ground-nut soup. Better still, begin at the local market: choose your ingredients among the colour and noise, then cook your finds with our chefs.</p>
<h2>Rhythm and colour</h2>
<p>Drumming and dancing sessions bring traditional Ghanaian rhythm into your body - no experience needed, only willingness. For quieter hands, there is batik fabric art and bead-making, each piece yours to keep. Ghanaian creativity, learned at its source.</p>
<h2>For everyone</h2>
<p>Many of these are lovely as a group - friends, family, a celebration. Tell our team what draws you, and we will arrange the rest, transport included where it is needed.</p>
`,
  },
  {
    slug: 'eco-luxury-what-it-really-means',
    title: 'Eco-luxury: what it really means',
    excerpt:
      'True luxury is not excess, it is authenticity - how care for the shoreline and the community shapes everything we do',
    image: `${M}/beach/beach-shots-screenshot-2026-02-09-081805.webp`,
    author: 'The Ko-Sa Journal',
    tags: ['Sustainability', 'Our Story'],
    daysAgo: 40,
    readMins: 4,
    body: `
<p>We use the words eco-luxury carefully. Not because the rooms are gilded - they are not - but because we believe true luxury is not about excess. It is about authenticity: the feeling of sand between your toes, the sound of waves at dawn, fresh local food prepared with care, the warmth of genuine welcome.</p>
<h2>Built from the place</h2>
<p>The kitchen draws from our own organic garden and from the nets of fishermen we have worked with for years. Care for the shoreline shapes every choice. It is simply how Ko-Sa was built, and how it stays.</p>
<h2>The sea turtles</h2>
<p>With local conservation partners, we help fishermen release sea turtles caught in their nets, compensate them for damaged gear, and train Ampenyi residents in tagging and data collection. Between November and March, guests can join evening beach walks to watch the turtles come ashore to lay their eggs - a quiet privilege, and a reminder of who this coast really belongs to.</p>
<p>Stay with us and a little of your visit flows back into the land and the lives around it. That, to us, is the only luxury worth keeping.</p>
`,
  },
];

async function main() {
  const now = Date.now();
  for (const p of POSTS) {
    const publishedAt = new Date(now - p.daysAgo * 24 * 60 * 60 * 1000);
    const data = {
      title: p.title,
      excerpt: p.excerpt,
      body: p.body.trim(),
      image: p.image,
      author: p.author,
      tags: p.tags,
      status: 'PUBLISHED' as const,
      publishedAt,
      seoTitle: `${p.title} · KO-SA Journal`,
      seoDescription: p.excerpt,
    };
    await prisma.journalPost.upsert({
      where: { slug: p.slug },
      update: data,
      create: { slug: p.slug, ...data },
    });
    console.log(`✓ ${p.slug}`);
  }
  const total = await prisma.journalPost.count();
  console.log(`\nDone. ${total} journal posts.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('FAILED:', e);
    process.exit(1);
  });
