// Finds the knowledge entries that best answer a guest's question.
// Whole-word matching, simple stemming, synonyms (including common words in the
// site's other languages) and a preference for confirmed facts over page prose.

import type { KnowledgeDoc } from './index';

const STOPWORDS = new Set(
  `a an the is are was were be been being have has had do does did i you he she it we they me him her us them my your his their our
  and or but if then else when where what which who whom whose how why to of in on at by for with from about into over under out this
  that these those some any all no not can could should would will may might as than so too very just also only please kosa ko-sa ko sa
  there here get got tell know like want need much many any thanks hi hello hey there's what's whats is it there's im i'm id i'd ill
  le la les un une des du de et est sont pour avec dans sur au aux je vous nous il elle quel quelle quels quelles comment ce cette
  el los las unos unas y es son para con en por que como yo usted nosotros cual
  het een en is zijn voor met in op ik u wij wat hoe welke
  der die das ein eine und ist sind für mit im auf ich sie wir was wie welche`.split(/\s+/),
);

// Guest word -> words the knowledge base uses.
const SYNONYMS: Record<string, string[]> = {
  wifi: ['wifi', 'internet'], 'wi-fi': ['wifi'], internet: ['wifi'],
  food: ['dining', 'restaurant', 'menu', 'meal'], eat: ['dining', 'restaurant', 'meal'], eating: ['dining', 'restaurant'],
  restaurant: ['restaurant', 'dining'], menu: ['menu', 'dining'], lunch: ['restaurant', 'lunch'], dinner: ['restaurant', 'dinner'],
  drink: ['bar', 'cocktail'], drinks: ['bar', 'cocktail'], cocktail: ['bar', 'cocktail'], bar: ['bar'],
  massage: ['massage', 'spa', 'treatment'], massages: ['massage', 'spa'], spa: ['spa', 'treatment', 'massage', 'wellness'],
  facial: ['facial', 'spa'], wellness: ['wellness', 'spa'], yoga: ['yoga'], retreat: ['retreat'], detox: ['detox'],
  price: ['price', 'cost', 'ghs'], prices: ['price', 'ghs'], cost: ['price', 'ghs'], costs: ['price', 'ghs'], rate: ['price', 'rate'],
  rates: ['price', 'rate'], expensive: ['price'], cheap: ['price'], fee: ['price'],
  kid: ['children', 'family'], kids: ['children', 'family'], child: ['children'], baby: ['children', 'cot'], family: ['family', 'children'],
  airport: ['airport', 'transfer'], pickup: ['transfer', 'airport'], 'pick-up': ['transfer'], taxi: ['transfer'], transport: ['transfer', 'transport'],
  shuttle: ['transfer'], drive: ['drive', 'accra'], directions: ['location', 'accra', 'drive'], direction: ['location', 'drive'],
  where: ['location'], far: ['drive', 'minute', 'location'], distance: ['drive', 'minute', 'location'], long: ['drive', 'minute'], located: ['location'], location: ['location'], address: ['address', 'location'], map: ['location'],
  accra: ['accra', 'airport', 'drive'], elmina: ['elmina'], 'cape': ['cape'], coast: ['coast'], kakum: ['kakum'],
  checkin: ['check-in'], 'check-in': ['check-in'], checkout: ['check-out'], 'check-out': ['check-out'], arrive: ['check-in', 'arrival'], arrival: ['check-in'],
  cancel: ['cancellation', 'refund'], cancellation: ['cancellation'], refund: ['refund', 'cancellation'], deposit: ['deposit'],
  pay: ['payment', 'pay'], payment: ['payment'], payments: ['payment'], card: ['card', 'payment'], momo: ['mobile', 'money', 'payment'],
  cash: ['cashless', 'cash'], visa: ['card', 'payment'], mastercard: ['card', 'payment'], paystack: ['paystack'],
  vegetarian: ['vegetarian', 'dietary'], vegan: ['vegetarian', 'dietary'], halal: ['halal', 'dietary'], allergy: ['dietary'], allergies: ['dietary'],
  wedding: ['wedding', 'celebration'], weddings: ['wedding'], marry: ['wedding'], proposal: ['proposal'], birthday: ['birthday', 'celebration'],
  honeymoon: ['romance', 'couples'], romantic: ['romance', 'couples'], anniversary: ['celebration', 'romance'], couple: ['couples'],
  group: ['group'], groups: ['group'], tour: ['tour'], operator: ['operator', 'group'], company: ['corporate', 'group'],
  corporate: ['corporate'], team: ['corporate', 'group'], school: ['student', 'group'], church: ['faith', 'group'],
  beach: ['beach', 'swim'], swim: ['swim', 'beach'], swimming: ['swim', 'beach'], sea: ['beach', 'ocean'], ocean: ['ocean', 'beach'], pool: ['pool'],
  safe: ['security', 'safety'], safety: ['security'], security: ['security'],
  weather: ['season', 'rain', 'dry'], rain: ['rainy', 'season'], season: ['season'], best: ['best', 'season'], visit: ['visit', 'season'],
  activities: ['activities', 'experience'], activity: ['activities'], things: ['activities', 'experience'], excursion: ['tour', 'excursion'],
  excursions: ['tour', 'excursion'], castle: ['castle'], castles: ['castle'], horse: ['horse'], drumming: ['drumming'], cooking: ['cooking'],
  community: ['community', 'ampenyi'], charity: ['community'], projects: ['community'], social: ['community'],
  included: ['included', 'breakfast'], include: ['included'], includes: ['included'], breakfast: ['breakfast'],
  phone: ['phone', 'contact'], call: ['phone', 'contact'], email: ['email', 'contact'], whatsapp: ['whatsapp', 'contact'], contact: ['contact'],
  turtle: ['turtle'], turtles: ['turtle'], snorkel: ['snorkelling'], snorkelling: ['snorkelling'], snorkeling: ['snorkelling'],
  paddleboard: ['paddleboarding'], paddleboarding: ['paddleboarding'], surf: ['surf'], surfing: ['surf'],
  tea: ['tea'], juice: ['juice'], parking: ['parking'], park: ['parking'], bus: ['bus', 'parking'],
  // French
  chambre: ['room'], chambres: ['room'], disponible: ['available'], disponibles: ['available'], prix: ['price'], tarif: ['price'],
  repas: ['meal', 'dining'], restauration: ['dining'], plage: ['beach'], nager: ['swim'], aéroport: ['airport'], inclus: ['included'],
  enfants: ['children'], annulation: ['cancellation'], paiement: ['payment'], soins: ['treatment', 'spa'],
  rejoindre: ['drive', 'accra'], venir: ['drive', 'location'], séjour: ['stay', 'included'], mariage: ['wedding'], groupe: ['group'],
  // Spanish
  habitación: ['room'], habitaciones: ['room'], precio: ['price'], playa: ['beach'], aeropuerto: ['airport'],
  incluido: ['included'], niños: ['children'], cancelación: ['cancellation'], pago: ['payment'], llegar: ['drive', 'location'], estancia: ['stay', 'included'],
  boda: ['wedding'], grupo: ['group'], comida: ['dining'],
  // Dutch
  kamer: ['room'], kamers: ['room'], beschikbaar: ['available'], prijs: ['price'], strand: ['beach'], luchthaven: ['airport'],
  inbegrepen: ['included'], kinderen: ['children'], annuleren: ['cancellation'], betaling: ['payment'], verblijf: ['stay', 'included'], eten: ['dining'],
  // German
  zimmer: ['room'], verfügbar: ['available'], preis: ['price'], flughafen: ['airport'], inbegriffen: ['included'], kinder: ['children'],
  stornierung: ['cancellation'], zahlung: ['payment'], aufenthalt: ['stay', 'included'], hochzeit: ['wedding'], gruppe: ['group'], essen: ['dining'],
  komme: ['drive', 'location'], kommt: ['drive', 'location'], erzähl: [], erzählen: [],
};

// Chinese has no spaces: look for these words anywhere in the message.
const ZH: [string, string[]][] = [
  ['房间', ['room']], ['客房', ['room']], ['空房', ['room', 'available']], ['价格', ['price']], ['水疗', ['spa']], ['按摩', ['massage', 'spa']],
  ['阿克拉', ['accra', 'drive']], ['怎么去', ['location', 'drive']], ['机场', ['airport', 'transfer']], ['包含', ['included']], ['早餐', ['breakfast']],
  ['取消', ['cancellation']], ['付款', ['payment']], ['海滩', ['beach']], ['餐厅', ['restaurant', 'dining']], ['儿童', ['children']], ['婚礼', ['wedding']],
];

/** Plurals only: "rooms" -> "room". Anything cleverer turns "parking" into "park". */
export function stem(w: string) {
  if (w.length <= 3) return w;
  return w.replace(/['’]s$/, '').replace(/ies$/, 'y').replace(/(ss)$/, '$1').replace(/([^s])s$/, '$1');
}

export function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/\(https?:[^)]+\)|\(\/[^)]*\)/g, ' ')
    .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
    .split(/\s+/)
    .map((t) => t.replace(/^['-]+|['-]+$/g, ''))
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/** The words we search for: the guest's own words plus their synonyms. */
const PHRASES: [RegExp, string[]][] = [
  [/\bcheck[\s-]?in\b/i, ['check-in']],
  [/\bcheck[\s-]?out\b/i, ['check-out']],
  [/things to do|what (?:can|to|could) (?:we|i|you) do|around here|nearby|near by|day trips?|explore/i, ['activities', 'experience', 'tour']],
  [/how much|what does .* cost|price of|cost of/i, ['price']],
  [/get (?:to|there|here)|how (?:do|can) (?:i|we) (?:get|reach|come)|from accra|from the airport/i, ['location', 'drive']],
  [/what.{0,12}included|is .* included/i, ['included']],
  [/pay(?:ing)? (?:with|by|in)/i, ['payment']],
];

export function queryTerms(message: string): string[] {
  const out = new Set<string>();
  for (const [re, words] of PHRASES) if (re.test(message)) words.forEach((w) => out.add(stem(w)));
  for (const t of tokenize(message.replace(/\bcheck[\s-]?(in|out)\b/gi, 'check-$1'))) {
    const syn = SYNONYMS[t];
    if (syn) syn.forEach((x) => out.add(stem(x)));
    if (!syn || syn.length) out.add(stem(t));
  }
  for (const [zh, words] of ZH) if (message.includes(zh)) words.forEach((w) => out.add(stem(w)));
  return Array.from(out).filter((t) => t.length > 1);
}

const WEIGHT: Partial<Record<KnowledgeDoc['category'], number>> = { page: 0.6 };
export const isListDoc = (d: KnowledgeDoc) => d.content.split(/;\s+/).length >= 4;

const isList = (d: KnowledgeDoc) => d.content.split(/;\s+/).length >= 4;

const index = new WeakMap<KnowledgeDoc, { title: Set<string>; body: Set<string> }>();
function terms(doc: KnowledgeDoc) {
  let e = index.get(doc);
  if (!e) {
    e = { title: new Set(tokenize(doc.title).map(stem)), body: new Set(tokenize(doc.content).map(stem)) };
    index.set(doc, e);
  }
  return e;
}

export interface Hit { doc: KnowledgeDoc; score: number; coverage: number }

export function search(docs: KnowledgeDoc[], message: string, k = 3): Hit[] {
  const q = queryTerms(message);
  if (!q.length) return [];
  const wantsPrice = q.includes('price');
  const wantsDistance = /\b(how far|distance|how long .*(drive|take|ride))\b/i.test(message);
  return docs
    .map((doc) => {
      const t = terms(doc);
      let score = 0;
      let hits = 0;
      for (const w of q) {
        const inTitle = t.title.has(w);
        const inBody = t.body.has(w);
        if (inTitle) score += 4;
        if (inBody) score += 1.5;
        if (inTitle || inBody) hits++;
      }
      // Reward answering more of the question, not one word many times.
      if (hits > 1) score += hits * 1.5;
      // Price lists answer "how much"; descriptions answer "tell me about".
      const shape = isList(doc) ? (wantsPrice ? 1.25 : 0.8) : 1;
      const near = wantsDistance && doc.category === 'location' ? 1.6 : 1;
      return { doc, score: score * (WEIGHT[doc.category] ?? 1) * shape * near, coverage: hits / q.length };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
