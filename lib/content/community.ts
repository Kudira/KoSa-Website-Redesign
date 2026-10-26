// Ko-Sa in Ampenyi: community projects, written up as Journal articles.
//
// Every fact here comes from the letters and records in the resort's Drive
// folder (appreciation letters from the Ghana Health Service KEEA Directorate,
// the Beauty for Ashes Builder's Foundation and Ampenyi M/A Basic School; the
// Ampenyi Drivers Union request and the toilet-facility estimate, both marked
// received in March 2025) and from the Ko-Sa Community, Training, Local
// Procurement & Employment Plan. Amounts are left out on purpose.
//
// These posts show on the Journal even before they are added in the admin.
// If a post with the same slug is published in the admin, that one wins, so
// the team can swap in real photos or edit the wording there.

import { BUCKET_BASE, media } from '@/lib/content/media';
import type { PublicJournalPost } from '@/lib/cms/journal';

const fisherfolk = `${BUCKET_BASE}/media/culture/fisherfolks-img_8775.webp`;
const AUTHOR = 'The Ko-Sa Journal';

type Draft = Omit<PublicJournalPost, 'id' | 'seoTitle' | 'seoDescription'> & { publishedAt: string };

const POSTS: Draft[] = [
  {
    slug: 'fixing-the-road-to-ampenyi',
    title: 'Filling the potholes on the road to Ampenyi',
    excerpt:
      'The drivers of Ampenyi, the chief and the Assemblyman asked for help with the road from Ayensudo. In March 2025, Ko-Sa sponsored the road work.',
    image: fisherfolk,
    author: AUTHOR,
    tags: ['Community', 'Ampenyi'],
    publishedAt: '2025-03-16',
    body: `
<p>Anyone who has driven to Ko-Sa knows the last stretch. The road from Ayensudo to Ampenyi had become badly broken, and it was hurting the people who use it most: drivers, their passengers, pregnant women on their way to care, and visitors coming to the village.</p>
<p>On 10 February 2025, the Ampenyi Drivers Association met with the chief of Ampenyi, Nana Takyi Akyen IV, and the Assemblyman at the palace. Together they agreed to ask Ko-Sa for support to buy clay and quarry dust to fill the potholes. The request reached us a week later.</p>
<h2>What we did</h2>
<p>Ko-Sa sponsored the road work, and the support was received by the drivers on 16 March 2025. It is a small part of a road we all share, but it makes every journey into Ampenyi a little easier: for the people who live here, and for the guests who come to stay.</p>
<p>The road is also how our team gets to work, how fresh fish reaches our kitchen, and how the village reaches the rest of the coast. Looking after it is looking after all of us.</p>
`,
  },
  {
    slug: 'public-toilets-for-ampenyi',
    title: 'New doors for the Ampenyi public toilets',
    excerpt:
      'In March 2025 we funded the timber, doors, padlocks, labour and cleaning supplies to put the village public toilets back in order.',
    image: media.environment1,
    author: AUTHOR,
    tags: ['Community', 'Ampenyi'],
    publishedAt: '2025-03-16',
    body: `
<p>Clean, working public toilets are one of the things a village only notices when they are missing. In March 2025, the community brought us an estimate to repair the Ampenyi public toilet facilities.</p>
<h2>What it covered</h2>
<ul>
<li>Timber, nails and door hinges to rebuild the doors</li>
<li>Six padlocks, one for each door</li>
<li>Transport for the materials and the workmanship</li>
<li>Cleaning supplies to keep it that way: mop buckets, mop sticks, toilet brushes, small buckets and a large container for storing water</li>
</ul>
<p>Ko-Sa covered the work, and the support was received on 16 March 2025. Sanitation matters to us beyond our own gate. At the resort we use Biofil sanitation systems, and we want the village around us to have decent facilities too.</p>
`,
  },
  {
    slug: 'a-festival-at-ampenyi-basic-school',
    title: 'A festival at Ampenyi Basic School',
    excerpt:
      'Ko-Sa supported the Festival of Nine Lessons and Carols at Ampenyi M/A Basic School. In January 2025 the school wrote to say thank you.',
    image: media.drumCircle,
    author: AUTHOR,
    tags: ['Community', 'Education'],
    publishedAt: '2025-01-13',
    body: `
<p>Ampenyi M/A Basic School is the basic school in Ampenyi, our village. When the school held its Festival of Nine Lessons and Carols, Ko-Sa contributed to the celebration.</p>
<p>In January 2025 the school wrote to us. They said our support "made the event not only memorable but also a source of inspiration for our pupils, staff, and the entire community."</p>
<h2>Why schools matter to us</h2>
<p>More than fifty members of our team come from the coastal communities around Ko-Sa. Supporting the school, in big ways and small, is one of the simplest ways we can say thank you to the village we call home.</p>
`,
  },
  {
    slug: 'mental-health-day-at-ankaful',
    title: 'World Mental Health Day at Ankaful Psychiatric Hospital',
    excerpt:
      'On 10 October 2022 we sponsored food for the Mental Health Day celebration at Ankaful, helping the Beauty for Ashes Builder’s Foundation feed 200 clients.',
    image: media.dining.restaurant,
    author: AUTHOR,
    tags: ['Community', 'Health'],
    publishedAt: '2022-10-16',
    body: `
<p>The Beauty for Ashes Builder's Foundation in Cape Coast, in partnership with Ankaful Psychiatric Hospital and local media houses, held a Mental Health Day celebration for the hospital's clients.</p>
<p>For the celebration on Monday 10 October 2022, Ko-Sa sponsored ten packs of food. With them, the foundation was able to feed all two hundred clients, and some of the health staff too.</p>
<h2>A shared meal</h2>
<p>The foundation wrote to us afterwards. They said the meal "put a smile on the faces of the clients" and "inspired hope in them." Sharing a meal is one of the simplest ways we know to show care, and we hope to keep doing it.</p>
`,
  },
  {
    slug: 'clean-up-at-the-ampenyi-chps-zone',
    title: 'A clean-up day at the Ampenyi CHPS Zone',
    excerpt:
      'In September 2021 the Ko-Sa team spent a day cleaning up the village health post. The KEEA Municipal Health Directorate wrote to thank the whole staff.',
    image: media.environment2,
    author: AUTHOR,
    tags: ['Community', 'Health'],
    publishedAt: '2021-09-14',
    body: `
<p>The Ampenyi CHPS Zone is the community health post that serves Ampenyi and the villages around it. On Tuesday 7 September 2021, the Ko-Sa team went down and spent the day on a clean-up of the facility.</p>
<p>Afterwards, the Ghana Health Service KEEA Municipal Health Directorate in Elmina wrote to thank the manager and "the entire staff" for "an excellent work well done." They said the clean-up had strengthened their commitment to the people of Ampenyi, and hoped the collaboration would keep growing.</p>
<h2>Our team, our community</h2>
<p>Most of our team come from Ampenyi and the communities nearby. A health post in good condition is something their own families rely on.</p>
`,
  },
];

export const COMMUNITY_POSTS: PublicJournalPost[] = POSTS.map((p) => ({
  ...p,
  id: `community-${p.slug}`,
  body: p.body.trim(),
  seoTitle: null,
  seoDescription: p.excerpt,
}));

export const COMMUNITY_SLUGS = COMMUNITY_POSTS.map((p) => p.slug);
