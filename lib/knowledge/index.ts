// Abena's knowledge.
//
// Three layers, rebuilt every 10 minutes:
//   1. KoSa facts: confirmed by the resort team (policies, payments, location,
//      groups, wellness partners). Edit FACTS below to change them.
//   2. Admin content: rooms, experiences, treatments, packages, add-ons,
//      events, daily activities and menus, exactly as published in /admin.
//   3. Cloudbeds: room types, tonight's prices and rooms left (read-only).
// Each bookable item carries its own action: rooms point to /book, everything
// else to a WhatsApp link with a message tailored to that item.

import 'server-only';
import { translate, type DictKey } from '@/lib/i18n/dictionaries';
import { listRoomsWithLive } from '@/lib/cms/rooms-live';
import { listPublicExperiences } from '@/lib/cms/experiences';
import { listPublicTreatments } from '@/lib/cms/treatments';
import { listPublicStayEnhancements } from '@/lib/cms/stay-enhancements';
import { listPublicWellnessPackages } from '@/lib/cms/wellness-packages';
import { listPublicEvents } from '@/lib/cms/events';
import { listPublicDailyActivities } from '@/lib/cms/daily-activities';
import { listPublicDiningVenues } from '@/lib/cms/dining';
import { displayCategory } from '@/lib/cms/types';
import { EXPERIENCE_DETAILS, ESCAPES, RETREAT_TIERS, PACKAGES, TREATMENTS_FALLBACK, formatGhs, roomStartingRateGhs, type EscapeKey, type PackageKey } from '@/lib/pricing';
import { wa, waUrl } from '@/lib/whatsapp';
import { site } from '@/lib/site';

const en = (key: DictKey) => translate('en', key).replace(/\s+·\s+/g, '. ');

export interface KnowledgeDoc {
  id: string;
  category: 'room' | 'experience' | 'wellness' | 'dining' | 'policy' | 'location' | 'faq' | 'amenity' | 'group' | 'event' | 'package';
  title: string;
  content: string;
}

const link = (label: string, url: string) => `[${label}](${url})`;
const WA_GENERAL = link('Message us on WhatsApp', waUrl("Hi KoSa! I have a question about my stay."));

// ── 1. Confirmed KoSa facts ────────────────────────────────────────────────
const FACTS: KnowledgeDoc[] = [
  {
    id: 'about',
    category: 'faq',
    title: 'About KoSa Beach Resort',
    content: `KoSa Beach Resort is a beachfront retreat at Beach Road No.1, Ampenyi, near Elmina in Ghana's Central Region, managed by Akwaaba Stays. Tagline: "Life is better at the beach." It is built around rest, wellness, fresh local food and Ghanaian culture. Contact: WhatsApp ${site.contact.phone}, email ${site.contact.email}.`,
  },
  { id: 'checkin', category: 'policy', title: 'Check-in and check-out', content: en('planPage.faq.checkin.a') },
  { id: 'cancellation', category: 'policy', title: 'Cancellation, deposit and payment terms', content: en('planPage.faq.cancellation.a') },
  {
    id: 'payments',
    category: 'policy',
    title: 'Payment methods (KoSa is fully cashless)',
    content:
      'KoSa is fully cashless. Guests pay by Mobile Money, card on POS, Paystack payment links, bank transfer or QR code. Cash is not accepted. Prices are in Ghana cedis (GHS). A 30% deposit is paid at booking on the secure Cloudbeds booking page (through Paystack) to confirm the reservation.',
  },
  { id: 'children', category: 'policy', title: 'Children', content: en('planPage.faq.children.a') },
  { id: 'dietary', category: 'dining', title: 'Halal, vegetarian and dietary needs', content: en('planPage.faq.halal.a') },
  {
    id: 'security',
    category: 'amenity',
    title: 'Safety and security',
    content:
      'KoSa has 24/7 professional security with gated premises and controlled access. There are clear guidelines and supervision for water activities, and first-aid facilities on site.',
  },
  { id: 'beach', category: 'amenity', title: 'Swimming and the beach', content: en('planPage.faq.swim.a') },
  {
    id: 'location',
    category: 'location',
    title: 'Where KoSa is and getting here',
    content:
      'KoSa is on the beach at Ampenyi, between Elmina and Komenda. Elmina Castle is about a 25-minute drive and Cape Coast Castle about 40 minutes. Kakum National Park is an easy day trip. From Kotoka International Airport in Accra the drive is about 3 hours.',
  },
  {
    id: 'transfer',
    category: 'location',
    title: 'Airport transfers',
    content: `${en('planPage.faq.airport.a')} ${link('Book a transfer on WhatsApp', waUrl(wa.transfer()))}`,
  },
  {
    id: 'dining',
    category: 'dining',
    title: 'Restaurant, breakfast and the bar',
    content: `The Restaurant serves breakfast, lunch and dinner from 7am to 9pm every day; breakfast is 7 to 10am. ${en('diningPage.restaurant.body')} Kooki Beach Bar serves cocktails, mocktails and fresh juices until 10pm. Private and beach dinners can be arranged for occasions. ${link('Reserve a table', waUrl(wa.table()))} or ${link('plan a private dinner', waUrl(wa.privateDining()))}.`,
  },
  {
    id: 'spa',
    category: 'wellness',
    title: 'KoSa Health Spa, O2 Wellness and GutCare',
    content:
      'Wellness at KoSa combines the KoSa Health Spa (massages, reflexology, pedicures), O2 Wellness partner treatments and rituals, the KoSa Tea Bar for herbal teas and fresh juices, wellness coaching and yoga by the sea. KoSa collaborates with GutCare Regenerative Health Centre, whose nurses are on site and oversee some spa activities. The spa is open to day guests as well as resort guests. Treatments can be reserved before arrival on WhatsApp.',
  },
  {
    id: 'free-programme',
    category: 'experience',
    title: 'Free daily activities for resort guests',
    content:
      'Resort guests have a free weekly programme: morning beach yoga, beach walks, sunrise meditation and stretching, Twi lessons, games nights, a guided walk to the fishing village, drumming lessons, village tours, sunset and golden-hour photography, and family-friendly games.',
  },
  {
    id: 'not-offered',
    category: 'experience',
    title: 'Turtle walks, paddleboarding and snorkelling',
    content:
      'KoSa does not offer turtle walks. Paddleboarding and snorkelling are not available yet: they are coming soon. Do not offer or book any of these.',
  },
  {
    id: 'community',
    category: 'faq',
    title: 'KoSa and the Ampenyi community (social projects)',
    content:
      'More than 50 of the KoSa team come from the surrounding coastal communities, and the kitchen sources fresh fish from the Ampenyi fishing community. Projects include: sponsoring road work to fill potholes on the Ayensudo to Ampenyi road (March 2025, requested by the Ampenyi Drivers Association with the chief and Assemblyman); repairing the Ampenyi public toilet facilities (March 2025); supporting the Festival at Ampenyi M/A Basic School (thank-you letter January 2025); sponsoring food for World Mental Health Day at Ankaful Psychiatric Hospital with the Beauty for Ashes Builder\'s Foundation, which fed 200 clients (October 2022); and a staff clean-up of the Ampenyi CHPS Zone health post, thanked by the Ghana Health Service KEEA Directorate (September 2021). Stories are on the Journal: [Read the stories](/blog).',
  },
  {
    id: 'groups',
    category: 'group',
    title: 'Groups, companies, schools and tour operators',
    content: `KoSa welcomes tour groups, student and educational trips, NGO and faith groups, corporate retreats, wellness groups and celebrations. Groups, companies and tour operators receive 10% off room rates, and tour operators and group organisers earn a commission. Every group has a dedicated Group Coordinator from enquiry to check-out, streamlined check-in with pre-assigned rooms, custom meal plans including dietary needs, and on-site bus and coach parking. Drivers and tour guides travelling with a group get super-discounted rates on Travelling Palm rooms, subject to availability. KoSa has a Group Guide 2026/27 with full details. More at /groups. ${link('Plan a group stay on WhatsApp', waUrl(wa.group()))}`,
  },
  {
    id: 'events',
    category: 'event',
    title: 'Weddings, celebrations and corporate retreats',
    content: `${en('eventsPage.weddings.body')} ${en('eventsPage.corporate.body')} Enquiries via /events or ${link('WhatsApp', waUrl(wa.group()))}.`,
  },
  {
    id: 'best-time',
    category: 'faq',
    title: 'When to visit',
    content: 'November to March is the dry season, with the best beach weather. December and January, around Christmas and New Year, are the busiest weeks, so book early for them. April to October is the rainy season but stays warm, with rain usually in short bursts.',
  },
];

// ── 2 & 3. Admin content and Cloudbeds, cached ────────────────────────────
let cache: { at: number; docs: KnowledgeDoc[] } | null = null;
const TTL = 10 * 60 * 1000;

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch {
    return fallback;
  }
}

async function buildDynamic(): Promise<KnowledgeDoc[]> {
  const [rooms, experiences, treatments, enhancements, packages, events, activities, venues] = await Promise.all([
    safe(listRoomsWithLive(), []),
    safe(listPublicExperiences(), []),
    safe(listPublicTreatments(), []),
    safe(listPublicStayEnhancements(), []),
    safe(listPublicWellnessPackages(), []),
    safe(listPublicEvents(), []),
    safe(listPublicDailyActivities(), []),
    safe(listPublicDiningVenues(), []),
  ]);
  const docs: KnowledgeDoc[] = [];

  for (const r of rooms.filter((x) => !x.id.startsWith('fallback'))) {
    const price = r.live?.nightly ? `Tonight from ${formatGhs(r.live.nightly)} a night (live).` : `From ${formatGhs(roomStartingRateGhs(r.slug, r.price))} a night.`;
    const left = r.live?.roomsLeft === 0 ? ' Full tonight.' : r.live?.roomsLeft && r.live.roomsLeft <= 3 ? ` Only ${r.live.roomsLeft} left tonight.` : '';
    docs.push({
      id: `room-${r.slug}`,
      category: 'room',
      title: `${r.name} (${displayCategory(r.category)} room)`,
      content: [
        r.tagline,
        r.description || r.live?.description,
        `Sleeps up to ${r.maxGuests}.`,
        r.bedConfig && `Beds: ${r.bedConfig}.`,
        r.sizeSqm && `${r.sizeSqm} m².`,
        (r.amenities.length ? r.amenities : r.live?.features ?? []).length && `Features: ${(r.amenities.length ? r.amenities : r.live!.features).join(', ')}.`,
        price + left,
        `Details: /rooms/${r.slug}. To book, choose dates at /book.`,
      ].filter(Boolean).join(' '),
    });
  }

  for (const e of experiences) {
    docs.push({
      id: `experience-${e.slug}`,
      category: 'experience',
      title: e.title,
      content: `${e.label}. ${e.description}${e.duration ? ` Duration: ${e.duration}.` : ''} More: /experiences/${e.slug}. ${link(`Book ${e.title} on WhatsApp`, waUrl(wa.experience({ name: e.title, duration: e.duration })))}`,
    });
  }
  for (const [key, d] of Object.entries(EXPERIENCE_DETAILS)) {
    const title = en(`experiencesPage.signature.${key}.title` as DictKey);
    docs.push({
      id: `signature-${key}`,
      category: 'experience',
      title,
      content: `${en(`experiencesPage.signature.${key}.body` as DictKey)}. ${d.duration}, from ${formatGhs(d.fromGhs)} per person. ${link(`Book ${title} on WhatsApp`, waUrl(wa.experience({ name: title, duration: d.duration, priceGhs: d.fromGhs })))}`,
    });
  }

  const realTreatments = treatments.filter((t) => !t.id.startsWith('fallback'));
  const treatmentList = realTreatments.length
    ? realTreatments.map((t) => ({ name: t.name, durationMin: t.durationMin, priceGhs: t.price, category: t.category }))
    : TREATMENTS_FALLBACK.map((t) => ({ name: t.name, durationMin: t.durationMin, priceGhs: t.priceGhs, category: t.category ?? null }));
  docs.push({
    id: 'treatments',
    category: 'wellness',
    title: 'Spa treatment menu and prices',
    content: treatmentList
      .map((t) => `${t.name} (${t.durationMin} min, ${formatGhs(t.priceGhs)}${t.category ? `, ${t.category}` : ''}): ${link('book', waUrl(wa.treatment(t)))}`)
      .join('; '),
  });
  docs.push({
    id: 'escapes',
    category: 'wellness',
    title: 'One-Day Escapes at O2 Wellness (Detox, Relaxation, Beauty)',
    content: (Object.keys(ESCAPES) as EscapeKey[])
      .map((k) => {
        const e = ESCAPES[k];
        return `${e.name} Escape, ${e.theme}: ${e.items.map((i) => i.name).join(', ')}. ${formatGhs(e.priceGhs)} (instead of ${formatGhs(e.originalGhs)}). ${link(`Book the ${e.name} Escape`, waUrl(wa.escape({ name: e.name, priceGhs: e.priceGhs })))}`;
      })
      .join(' '),
  });
  docs.push({
    id: 'retreats',
    category: 'wellness',
    title: 'Multi-day wellness retreats (Signature Rotation)',
    content: `${RETREAT_TIERS.map((r) => `${r.days} days (${r.rotation}): spa ${formatGhs(r.spaGhs)}, ${formatGhs(r.totalGhs)} total including ${r.days} nights with room and full board`).join('; ')}. A Private Wellness Consultation costs GHS 200, credited toward a custom itinerary. ${link('Ask about a retreat', waUrl(wa.retreat({ name: 'Signature Rotation Retreat' })))}`,
  });

  for (const p of packages) {
    docs.push({
      id: `package-${p.slug}`,
      category: 'package',
      title: `${p.name} package`,
      content: `${p.tagline}. ${p.category}, ${p.durationLabel}. From ${formatGhs(p.priceGhs)} ${p.priceNote}${p.couplePriceGhs ? `, ${formatGhs(p.couplePriceGhs)} ${p.couplePriceNote ?? 'for two'}` : ''}. Includes: ${p.inclusions.join(', ')}. ${link(`Enquire about ${p.name}`, waUrl(wa.stayPackage({ name: p.name, durationLabel: p.durationLabel, priceGhs: p.priceGhs, inclusions: p.inclusions.slice(0, 4).join(', ') })))}`,
    });
  }
  for (const k of Object.keys(PACKAGES) as PackageKey[]) {
    const p = PACKAGES[k];
    const name = en(`home.itineraries.${k}.title` as DictKey);
    docs.push({
      id: `itinerary-${k}`,
      category: 'package',
      title: `${name} (${p.nights}-night sample stay)`,
      content: `${en(`home.itineraries.${k}.body` as DictKey)}. From ${formatGhs(p.fromGhs)}, includes ${p.inclusions}. ${link(`Book ${name}`, waUrl(wa.stayPackage({ name, nights: p.nights, priceGhs: p.fromGhs, inclusions: p.inclusions })))}`,
    });
  }

  if (enhancements.length) {
    docs.push({
      id: 'enhancements',
      category: 'package',
      title: 'Stay add-ons and celebrations',
      content: enhancements
        .map((e) => `${e.name}${e.description ? ` (${e.description})` : ''}: ${formatGhs(e.priceGhs)}${e.priceTo ? `–${formatGhs(e.priceTo)}` : ''} ${link('add', waUrl(wa.enhancement({ name: e.name, priceGhs: e.priceGhs, priceTo: e.priceTo })))}`)
        .join('; '),
    });
  }
  for (const ev of events) {
    docs.push({
      id: `event-${ev.slug}`,
      category: 'event',
      title: ev.title,
      content: `${ev.category}. ${ev.description}${ev.priceNote ? ` ${ev.priceNote}.` : ''}${ev.transportIncluded ? ' Transport included.' : ''} ${link(`Book ${ev.title}`, waUrl(wa.event({ title: ev.title, priceNote: ev.priceNote, transportIncluded: ev.transportIncluded })))}`,
    });
  }
  if (activities.length) {
    docs.push({
      id: 'daily-activities',
      category: 'experience',
      title: 'This week’s daily activities (free for resort guests unless marked)',
      content: activities.map((a) => `${a.day.toLowerCase()} ${a.time}: ${a.title}${a.isFree ? '' : ' (paid)'}`).join('; '),
    });
  }
  for (const v of venues) {
    const items = v.sections.flatMap((s) => s.items.map((i) => `${i.name}${i.price ? ` ${formatGhs(i.price)}` : ''}`));
    if (!items.length) continue;
    docs.push({ id: `menu-${v.slug}`, category: 'dining', title: `${v.name} menu`, content: `${v.hours ? `${v.hours}. ` : ''}${items.slice(0, 60).join(', ')}.` });
  }
  return docs;
}

export async function getKnowledge(): Promise<KnowledgeDoc[]> {
  if (cache && Date.now() - cache.at < TTL) return cache.docs;
  const docs = [...FACTS, ...(await buildDynamic())];
  cache = { at: Date.now(), docs };
  return docs;
}

/** A one-line index of every room, so Abena can always name what exists. */
export function roomIndex(docs: KnowledgeDoc[]) {
  return docs.filter((d) => d.category === 'room').map((d) => `- ${d.title}`).join('\n');
}

export const FALLBACK_CONTACT = WA_GENERAL;

// ── Retrieval ──────────────────────────────────────────────────────────────
const STOPWORDS = new Set(
  'a an the is are was were be been being have has had do does did i you he she it we they me him her us them my your his their our and or but if then else when where what which who whom whose how why to of in on at by for with from about into over under out this that these those some any all no not can could should would will may might as than so too very just also only please kosa'.split(' '),
);
function tokenize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s'-]/g, ' ').split(/\s+/).filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

export function searchKnowledgeScored(docs: KnowledgeDoc[], query: string, k = 6): { doc: KnowledgeDoc; score: number }[] {
  const q = tokenize(query);
  if (!q.length) return [];
  const phrase = query.toLowerCase().trim();
  return docs
    .map((doc) => {
      const title = doc.title.toLowerCase();
      const content = doc.content.toLowerCase().replace(/\(https?:[^)]+\)/g, '');
      let score = 0;
      for (const t of q) {
        if (title.includes(t)) score += 3;
        score += Math.min(3, content.split(t).length - 1);
        if (doc.category.startsWith(t.replace(/s$/, ''))) score += 2;
      }
      if (phrase.length >= 4 && (title.includes(phrase) || content.includes(phrase))) score += 5;
      return { doc, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

export function searchKnowledge(docs: KnowledgeDoc[], query: string, k = 6): KnowledgeDoc[] {
  return searchKnowledgeScored(docs, query, k).map((x) => x.doc);
}
