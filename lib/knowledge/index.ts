// Lightweight in-memory knowledge base for the AI concierge.
// Replaces Elasticsearch with a deterministic keyword-overlap scorer.
// For a small resort (~50-100 docs) this is fast, free, and zero-infrastructure.
// If you ever need vector search, swap this module for one backed by pgvector or Voyage.

import { rooms, experiences, adinkraGuide } from '@/lib/content/home';
import { formatCurrency } from '@/lib/utils';
import { translate, type DictKey } from '@/lib/i18n/dictionaries';

// AI knowledge base operates in English; fetch EN strings from the dictionary.
const en = (key: DictKey) => translate('en', key);

export interface KnowledgeDoc {
  id: string;
  category: 'room' | 'experience' | 'culture' | 'policy' | 'location' | 'faq' | 'amenity';
  title: string;
  content: string;
  metadata?: Record<string, string | number>;
}

const STATIC: KnowledgeDoc[] = [
  // ---- Policies
  {
    id: 'policy-checkin',
    category: 'policy',
    title: 'Check-in and check-out times',
    content:
      'Check-in is from 14:00 (2pm). Check-out is by 11:00 (11am). Early check-in and late check-out are subject to availability speak with the concierge.',
  },
  {
    id: 'policy-cancel',
    category: 'policy',
    title: 'Cancellation policy',
    content:
      'Free cancellation up to 48 hours before arrival. Within 48 hours of the arrival date, the first night is charged. No-shows are charged the full first night. Cancellations must be made by email to info@ko-sa.com or via your booking dashboard.',
  },
  {
    id: 'policy-payment',
    category: 'policy',
    title: 'Accepted payment methods',
    content:
      'KoSa accepts Ghana Cedi (GHS), US Dollar (USD), and Euro (EUR) in cash, all major credit and debit cards (Visa, Mastercard, Amex), and Mobile Money: MTN MoMo, Vodafone Cash, AirtelTigo. Bank transfers are accepted for stays of 7 nights or longer.',
  },
  {
    id: 'policy-children',
    category: 'policy',
    title: 'Children policy',
    content:
      'Children of all ages are welcome at KoSa. Under 6 stay free in their parents\' room with existing bedding. Extra beds are available for GHS 150/night. Children\'s breakfast and snack menus are available, and the pool has a shallow section.',
  },
  {
    id: 'policy-pets',
    category: 'policy',
    title: 'Pet policy',
    content: 'KoSa does not currently accept pets, with the exception of registered service animals.',
  },

  // ---- Location & getting there
  {
    id: 'location-airport',
    category: 'location',
    title: 'Getting to KoSa from Accra (ACC) airport',
    content:
      'KoSa is approximately 150km west of Accra (Kotoka International Airport, ACC) about 2.5 hours by car along the coastal road via Cape Coast. Resort transfer is available: GHS 600 one-way for up to 4 guests, GHS 900 for a luxury sedan or up to 6 guests. Hire car and tro-tro (shared minibus) are also possible.',
  },
  {
    id: 'location-nearby',
    category: 'location',
    title: 'Nearby attractions',
    content:
      'Elmina Castle (UNESCO World Heritage, 10 minutes away). Cape Coast Castle (30 minutes). Kakum National Park rainforest with canopy walkway (45 minutes). Local fishing village (5-minute walk). Brenu Beach (15 minutes). Sunday markets in Elmina town.',
  },
  {
    id: 'location-region',
    category: 'location',
    title: 'About Elmina, Ghana',
    content:
      'Elmina is a historic coastal town in the Central Region of Ghana, on the Gulf of Guinea (Atlantic). The dry season (best beach weather) runs roughly November through March; April–October is the rainy season but stays warm. The town has Portuguese, Dutch and British colonial heritage and a vibrant local fishing economy.',
  },

  // ---- Amenities
  {
    id: 'amenity-wifi',
    category: 'amenity',
    title: 'WiFi and connectivity',
    content:
      'Complimentary high-speed WiFi throughout the resort rooms, restaurant, pool deck, beach lounge. Speeds are typically 30-60 Mbps. A backup hotspot is available at reception during outages.',
  },
  {
    id: 'amenity-beach',
    category: 'amenity',
    title: 'Beach and pool',
    content:
      'KoSa fronts directly onto a quiet stretch of Atlantic coast. The beach is open to resort guests with sun loungers, parasols, and beach service. An infinity pool overlooks the shore. A lifeguard is on duty 8am–6pm. Strong currents are signposted.',
  },
  {
    id: 'amenity-spa',
    category: 'amenity',
    title: 'Spa and wellness',
    content:
      'The KoSa Health Spa offers Deepcore, Swedish, Holistic and Couples massages, plus reflexology and pedicures. O2 Wellness adds a Herbal Detox Steam Ritual, Glow Polish Facial and Full Body Glow Polish. Treatments from GHS 150. Daily morning yoga and meditation by the sea are complimentary for resort guests.',
  },
  {
    id: 'amenity-restaurant',
    category: 'amenity',
    title: 'Restaurant and dining',
    content:
      'Three dining settings: The Hearth (open-fire West African mains), The Sunrise Table (breakfast and brunch with hibiscus tea, sourdough, fonio porridge), and The Beach Bar (cocktails, palm wine spritz, light shareables). Dietary requirements are accommodated with notice.',
  },
  {
    id: 'amenity-transfer',
    category: 'amenity',
    title: 'Airport transfer',
    content:
      'Resort airport transfer from Accra (ACC): GHS 600 one-way for up to 4 guests in a sedan, GHS 900 for a luxury sedan or up to 6. Bookable when reserving or via the concierge with at least 24 hours notice.',
  },
  {
    id: 'amenity-events',
    category: 'amenity',
    title: 'Weddings and private events',
    content:
      'KoSa hosts intimate weddings, vow renewals, and private dinners on the beach. Capacity up to 80 guests. Custom packages with our wedding planner. Email events@ko-sa.com.',
  },

  // ---- FAQ
  {
    id: 'faq-best-time',
    category: 'faq',
    title: 'When is the best time to visit?',
    content:
      'November through March is the dry season sunny, breezy, golden light. April through October is the rainy season but still warm; rain typically comes in short intense bursts. December–January is the busiest period (holiday season).',
  },
  {
    id: 'faq-language',
    category: 'faq',
    title: 'What languages are spoken?',
    content:
      'English is Ghana\'s official language and is widely spoken. Local languages include Akan (Twi/Fante), Ewe, and Ga. The KoSa team speaks English and French; some staff also speak Twi.',
  },
  {
    id: 'faq-currency',
    category: 'faq',
    title: 'Currency in Ghana',
    content:
      'The Ghana Cedi (GHS) is the local currency. KoSa accepts GHS, USD, and EUR. ATMs and currency exchange are available in Elmina town (10 minutes away).',
  },
  {
    id: 'faq-safety',
    category: 'faq',
    title: 'Is Ghana safe to visit?',
    content:
      'Ghana is one of the safest and most stable countries in West Africa. Standard travel precautions apply. Tap water is not recommended for drinking bottled water is provided in all rooms.',
  },
];

const ROOM_DOCS: KnowledgeDoc[] = rooms.map((r) => {
  const name = en(`rooms.${r.slug}.name` as DictKey);
  const tagline = en(`rooms.${r.slug}.tagline` as DictKey);
  return {
    id: `room-${r.slug}`,
    category: 'room',
    title: name,
    content: `${name} ${tagline}. Category: ${r.category}. From ${formatCurrency(r.price, r.currency)} per night, breakfast included. Book at /book?room=${r.slug}.`,
    metadata: { price: r.price, currency: r.currency, slug: r.slug, image: r.image },
  };
});

const EXPERIENCE_DOCS: KnowledgeDoc[] = experiences.map((e) => {
  const label = en(`experiences.${e.slug}.label` as DictKey);
  const title = en(`experiences.${e.slug}.title` as DictKey);
  const description = en(`experiences.${e.slug}.description` as DictKey);
  return {
    id: `experience-${e.slug}`,
    category: 'experience',
    title,
    content: `${label}: ${title}. ${description}`,
    metadata: { slug: e.slug, image: e.image },
  };
});

const CULTURE_DOCS: KnowledgeDoc[] = adinkraGuide.map((a) => {
  const meaning = en(`adinkra.${a.name}.meaning` as DictKey);
  const line = en(`adinkra.${a.name}.line` as DictKey);
  return {
    id: `culture-${a.twi.toLowerCase()}`,
    category: 'culture',
    title: `${a.twi} ${meaning}`,
    content: `${a.twi} is the Akan symbol for ${meaning.toLowerCase()}. At KoSa: ${line}`,
  };
});

export const KNOWLEDGE: KnowledgeDoc[] = [...STATIC, ...ROOM_DOCS, ...EXPERIENCE_DOCS, ...CULTURE_DOCS];

const STOPWORDS = new Set([
  'a','an','the','is','are','was','were','be','been','being','have','has','had','do','does','did',
  'i','you','he','she','it','we','they','me','him','her','us','them','my','your','his','their','our',
  'and','or','but','if','then','else','when','where','what','which','who','whom','whose','how','why',
  'to','of','in','on','at','by','for','with','from','about','into','over','under','out',
  'this','that','these','those','some','any','all','no','not','can','could','should','would','will','may','might',
  'as','than','so','too','very','just','also','only',
]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s'\-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

interface ScoredDoc extends KnowledgeDoc {
  score: number;
}

/**
 * Keyword-overlap retriever. Scores each doc by:
 *   - title hits (×3)
 *   - content hits (×1)
 *   - exact phrase bonus (+5)
 * Returns top-k.
 */
export function searchKnowledge(query: string, k = 5): KnowledgeDoc[] {
  const qTokens = tokenize(query);
  if (qTokens.length === 0) return [];
  const phrase = query.toLowerCase().trim();

  const scored: ScoredDoc[] = KNOWLEDGE.map((doc) => {
    const title = doc.title.toLowerCase();
    const content = doc.content.toLowerCase();
    let score = 0;
    for (const t of qTokens) {
      if (title.includes(t)) score += 3;
      const matches = content.split(t).length - 1;
      score += matches;
    }
    if (phrase.length >= 4 && (title.includes(phrase) || content.includes(phrase))) score += 5;
    return { ...doc, score };
  });

  return scored
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
