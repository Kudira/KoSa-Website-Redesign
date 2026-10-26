// Abena, the KoSa concierge. No AI model: she answers from KoSa's own
// information (lib/knowledge) and live Cloudbeds rooms, and hands anything
// she does not know to the team on WhatsApp.

import * as chrono from 'chrono-node';
import type { KnowledgeDoc } from './index';
import { isListDoc, queryTerms, search } from './search';

export type Lang = 'en' | 'fr' | 'es' | 'nl' | 'de' | 'zh';

export interface StayQuery {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  explicitOut: boolean;
}
export interface RoomRate {
  roomTypeName: string;
  nightly: number;
  total: number;
  roomsAvailable: number;
}

export interface AbenaDeps {
  docs: () => Promise<KnowledgeDoc[]>;
  /** Live rates for a stay, or null when Cloudbeds is not connected. */
  stayRates: (s: StayQuery) => Promise<RoomRate[] | null>;
  tonight: () => Promise<{ roomTypeName: string; nightly: number; roomsAvailable: number }[] | null>;
  bookingHref: (s: StayQuery) => string;
  whatsapp: string; // markdown link
  phone: string;
  email: string;
  formatMoney: (n: number) => string;
  today?: Date;
}

export interface AbenaReply {
  text: string;
  ids: string[];
  /** True when Abena could not answer, so the team can review it in the admin. */
  flagged: boolean;
}

// ── Words Abena says, per language ────────────────────────────────────────
const SAY: Record<Lang, Record<string, string>> = {
  en: {
    welcome: "Akwaaba, welcome to KoSa! I'm Abena. Ask me about rooms and live prices, the spa, food, things to do, getting here, or anything else about your stay. For prices, just tell me your dates, like “12 to 15 December, 2 adults”.",
    thanks: 'You’re very welcome. Life is better at the beach, and we can’t wait to have you.',
    bye: 'Safe travels, and see you by the sea.',
    human: 'Of course. The team would love to help you directly.',
    humanBody: 'WhatsApp is quickest: {wa}. You can also call {phone} or email {email}.',
    unsure: 'I’m not sure about that one, and I’d rather not guess.',
    unsureBody: 'The team can answer you properly on WhatsApp: {wa}.',
    roomsUnsure: 'You can see every room and live price on [our booking page](/book), or ask the team: {wa}.',
    askDates: 'I’d love to check for you. Which dates are you thinking of, and how many guests? For example: “12 to 15 December, 2 adults”.',
    tonight: 'Here’s what’s free tonight:',
    tonightFull: 'Tonight looks fully booked, but other dates may well be open.',
    openFor: 'Good news! Here’s what’s open for {when}:',
    nothing: 'I’m sorry, nothing is free for {when}. Moving a day either side often helps, or the team can look for you: {wa}.',
    assumed: 'I’ve assumed one night. Tell me your check-out date if you’re staying longer.',
    book: '[Book these dates]({href}). A 30% deposit secures your room.',
    night: 'night', nights: 'nights', adult: 'adult', adults: 'adults', child: 'child', children: 'children',
    aNight: 'a night', total: 'total', left: 'left',
    englishOnly: '',
    more: 'Anything else I can help with?',
    error: 'Something went wrong on my side. The team can help right away on WhatsApp: {wa}.',
  },
  fr: {
    welcome: 'Akwaaba, bienvenue à KoSa ! Je suis Abena. Demandez-moi les chambres et les prix du jour, le spa, la cuisine, les activités ou comment venir. Pour les prix, donnez-moi vos dates, par exemple « du 12 au 15 décembre, 2 adultes ».',
    thanks: 'Avec plaisir. La vie est plus belle à la plage, et nous avons hâte de vous accueillir.',
    bye: 'Bon voyage, et à bientôt au bord de la mer.',
    human: 'Bien sûr, l’équipe sera ravie de vous aider.',
    humanBody: 'Le plus rapide est WhatsApp : {wa}. Vous pouvez aussi appeler le {phone} ou écrire à {email}.',
    unsure: 'Je ne suis pas sûre pour celle-ci, et je préfère ne pas deviner.',
    unsureBody: 'L’équipe vous répondra sur WhatsApp : {wa}.',
    roomsUnsure: 'Toutes les chambres et les prix du jour sont sur [notre page de réservation](/book), ou demandez à l’équipe : {wa}.',
    askDates: 'Avec plaisir. Quelles dates, et pour combien de personnes ? Par exemple : « du 12 au 15 décembre, 2 adultes ».',
    tonight: 'Voici ce qui est libre ce soir :',
    tonightFull: 'Ce soir semble complet, mais d’autres dates sont peut-être libres.',
    openFor: 'Bonne nouvelle ! Voici ce qui est libre pour {when} :',
    nothing: 'Désolée, rien n’est libre pour {when}. Décaler d’un jour aide souvent, ou l’équipe peut chercher pour vous : {wa}.',
    assumed: 'J’ai compté une nuit. Donnez-moi votre date de départ si vous restez plus longtemps.',
    book: '[Réserver ces dates]({href}). Un acompte de 30 % confirme votre chambre.',
    night: 'nuit', nights: 'nuits', adult: 'adulte', adults: 'adultes', child: 'enfant', children: 'enfants',
    aNight: 'la nuit', total: 'au total', left: 'restantes',
    englishOnly: '(Je réponds en anglais pour ces détails.)',
    more: 'Puis-je vous aider pour autre chose ?',
    error: 'Un souci de mon côté. L’équipe peut vous aider sur WhatsApp : {wa}.',
  },
  es: {
    welcome: '¡Akwaaba, bienvenido a KoSa! Soy Abena. Pregúntame por habitaciones y precios del día, el spa, la comida, actividades o cómo llegar. Para precios, dime tus fechas, por ejemplo «del 12 al 15 de diciembre, 2 adultos».',
    thanks: 'Con mucho gusto. La vida es mejor en la playa, y te esperamos.',
    bye: 'Buen viaje, y hasta pronto junto al mar.',
    human: 'Claro, al equipo le encantará ayudarte.',
    humanBody: 'Lo más rápido es WhatsApp: {wa}. También puedes llamar al {phone} o escribir a {email}.',
    unsure: 'No estoy segura de eso y prefiero no adivinar.',
    unsureBody: 'El equipo te responderá por WhatsApp: {wa}.',
    roomsUnsure: 'Todas las habitaciones y precios están en [nuestra página de reservas](/book), o pregunta al equipo: {wa}.',
    askDates: 'Con gusto lo miro. ¿Qué fechas y cuántas personas? Por ejemplo: «del 12 al 15 de diciembre, 2 adultos».',
    tonight: 'Esto es lo que queda libre esta noche:',
    tonightFull: 'Esta noche parece completo, pero otras fechas pueden estar libres.',
    openFor: '¡Buenas noticias! Esto está libre para {when}:',
    nothing: 'Lo siento, no hay nada libre para {when}. Mover un día suele ayudar, o el equipo puede buscar por ti: {wa}.',
    assumed: 'He contado una noche. Dime tu fecha de salida si te quedas más.',
    book: '[Reservar estas fechas]({href}). Un depósito del 30 % asegura tu habitación.',
    night: 'noche', nights: 'noches', adult: 'adulto', adults: 'adultos', child: 'niño', children: 'niños',
    aNight: 'por noche', total: 'en total', left: 'disponibles',
    englishOnly: '(Te respondo en inglés para estos detalles.)',
    more: '¿Te ayudo con algo más?',
    error: 'Algo falló por mi parte. El equipo te ayuda por WhatsApp: {wa}.',
  },
  nl: {
    welcome: 'Akwaaba, welkom bij KoSa! Ik ben Abena. Vraag me naar kamers en actuele prijzen, de spa, het eten, activiteiten of hoe je ons bereikt. Voor prijzen: noem je data, bijvoorbeeld „12 tot 15 december, 2 volwassenen”.',
    thanks: 'Graag gedaan. Het leven is mooier aan het strand, en we kijken ernaar uit je te ontvangen.',
    bye: 'Goede reis, en tot snel aan zee.',
    human: 'Natuurlijk, het team helpt je graag persoonlijk.',
    humanBody: 'WhatsApp is het snelst: {wa}. Je kunt ook bellen naar {phone} of mailen naar {email}.',
    unsure: 'Dat weet ik niet zeker, en ik gok liever niet.',
    unsureBody: 'Het team helpt je verder via WhatsApp: {wa}.',
    roomsUnsure: 'Alle kamers en actuele prijzen staan op [onze boekingspagina](/book), of vraag het team: {wa}.',
    askDates: 'Ik kijk het graag na. Welke data, en met hoeveel personen? Bijvoorbeeld: „12 tot 15 december, 2 volwassenen”.',
    tonight: 'Dit is vannacht nog vrij:',
    tonightFull: 'Vannacht lijkt vol, maar andere data kunnen vrij zijn.',
    openFor: 'Goed nieuws! Dit is vrij voor {when}:',
    nothing: 'Helaas is er niets vrij voor {when}. Een dag schuiven helpt vaak, of het team zoekt voor je: {wa}.',
    assumed: 'Ik ben uitgegaan van één nacht. Laat je vertrekdatum weten als je langer blijft.',
    book: '[Boek deze data]({href}). Met 30% aanbetaling is je kamer zeker.',
    night: 'nacht', nights: 'nachten', adult: 'volwassene', adults: 'volwassenen', child: 'kind', children: 'kinderen',
    aNight: 'per nacht', total: 'totaal', left: 'over',
    englishOnly: '(Deze details geef ik in het Engels.)',
    more: 'Kan ik nog ergens mee helpen?',
    error: 'Er ging iets mis aan mijn kant. Het team helpt je via WhatsApp: {wa}.',
  },
  de: {
    welcome: 'Akwaaba, willkommen bei KoSa! Ich bin Abena. Frag mich nach Zimmern und aktuellen Preisen, dem Spa, dem Essen, Aktivitäten oder der Anreise. Für Preise nenn mir deine Daten, zum Beispiel „12. bis 15. Dezember, 2 Erwachsene“.',
    thanks: 'Sehr gern. Das Leben ist schöner am Strand, und wir freuen uns auf dich.',
    bye: 'Gute Reise, und bis bald am Meer.',
    human: 'Natürlich, das Team hilft dir gern persönlich.',
    humanBody: 'Am schnellsten per WhatsApp: {wa}. Du kannst auch {phone} anrufen oder an {email} schreiben.',
    unsure: 'Da bin ich mir nicht sicher, und ich rate lieber nicht.',
    unsureBody: 'Das Team antwortet dir auf WhatsApp: {wa}.',
    roomsUnsure: 'Alle Zimmer und aktuellen Preise findest du auf [unserer Buchungsseite](/book), oder frag das Team: {wa}.',
    askDates: 'Gern schaue ich nach. Welche Daten, und für wie viele Personen? Zum Beispiel: „12. bis 15. Dezember, 2 Erwachsene“.',
    tonight: 'Das ist heute Nacht noch frei:',
    tonightFull: 'Heute Nacht scheint ausgebucht, andere Daten können aber frei sein.',
    openFor: 'Gute Nachricht! Das ist frei für {when}:',
    nothing: 'Leider ist für {when} nichts frei. Einen Tag zu verschieben hilft oft, oder das Team sucht für dich: {wa}.',
    assumed: 'Ich bin von einer Nacht ausgegangen. Nenn mir dein Abreisedatum, wenn du länger bleibst.',
    book: '[Diese Daten buchen]({href}). Eine Anzahlung von 30 % sichert dein Zimmer.',
    night: 'Nacht', nights: 'Nächte', adult: 'Erwachsener', adults: 'Erwachsene', child: 'Kind', children: 'Kinder',
    aNight: 'pro Nacht', total: 'gesamt', left: 'frei',
    englishOnly: '(Diese Details gebe ich auf Englisch.)',
    more: 'Kann ich sonst noch helfen?',
    error: 'Bei mir ist etwas schiefgelaufen. Das Team hilft dir per WhatsApp: {wa}.',
  },
  zh: {
    welcome: 'Akwaaba，欢迎来到 KoSa！我是 Abena。可以问我客房和实时房价、水疗、餐饮、活动或如何到达。想查价格，请告诉我日期，例如“12 月 12 日到 15 日，2 位成人”。',
    thanks: '不客气。海边的生活更美好，期待您的到来。',
    bye: '一路顺风，海边见。',
    human: '当然，团队很乐意直接为您服务。',
    humanBody: '最快的方式是 WhatsApp：{wa}。也可以致电 {phone} 或发邮件至 {email}。',
    unsure: '这个问题我不太确定，不想乱猜。',
    unsureBody: '团队会在 WhatsApp 上为您解答：{wa}。',
    roomsUnsure: '所有客房和实时价格都在[预订页面](/book)，也可以询问团队：{wa}。',
    askDates: '我很乐意帮您查。请问哪几天、几位客人？例如“12 月 12 日到 15 日，2 位成人”。',
    tonight: '今晚还有这些空房：',
    tonightFull: '今晚似乎已满，但其他日期可能有空房。',
    openFor: '好消息！{when} 有这些空房：',
    nothing: '抱歉，{when} 没有空房。提前或推后一天通常会有，或者让团队帮您找：{wa}。',
    assumed: '我按一晚计算。如果住得更久，请告诉我退房日期。',
    book: '[预订这些日期]({href})。支付 30% 定金即可确认房间。',
    night: '晚', nights: '晚', adult: '位成人', adults: '位成人', child: '位儿童', children: '位儿童',
    aNight: '每晚', total: '总计', left: '间剩余',
    englishOnly: '（这些详情我用英文回答。）',
    more: '还有什么可以帮您？',
    error: '我这边出了点问题。团队可以在 WhatsApp 上帮您：{wa}。',
  },
};

const fill = (s: string, v: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');

// ── What the guest wants ──────────────────────────────────────────────────
const GREETING = /^\s*(hi+|hello|hey|hiya|yo|good\s?(morning|afternoon|evening|day)|akwaaba|bonjour|salut|hola|buenas|hallo|goedemorgen|goedemiddag|guten\s(tag|morgen|abend)|moin|你好|您好)\b[\s!.,?🙂😊👋]*(abena|there|kosa)?[\s!.,?🙂😊👋]*$/iu;
const THANKS = /^\s*(thanks?|thank\s?you|thx|ty|cheers|medaase|merci|gracias|danke|dank\s?je|bedankt|谢谢)\b/iu;
const BYE = /^\s*(bye|goodbye|see\s?you|ciao|au\s?revoir|adiós|adios|tot\s?ziens|tschüss|tschuss|再见)\b/iu;
const HUMAN = /\b(human|real person|person|someone|staff|agent|manager|receptionist|front desk|speak|talk|call (you|me)|phone number|contact (you|the team|someone)|parler|hablar|spreken|sprechen)\b|人工|客服/iu;
const ROOMS = /\b(rooms?|suites?|available|availability|vacanc(y|ies)|book(ing)?|reserve|reservation|accommodation|sleep|chambres?|disponib\w*|habitaci\w+|kamers?|beschikbaar|zimmer|verfügbar|übernacht\w*)\b|房|空房|预订/iu;
const ROOM_WORDS = ['family', 'triple', 'twin', 'double', 'palm', 'traveling', 'travelling', 'deluxe', 'luxury', 'garden', 'sea'];

const OPENERS: Partial<Record<KnowledgeDoc['category'], string[]>> = {
  wellness: ['Lovely choice.', 'Our favourite way to slow down.'],
  dining: ['Good food is half the holiday.', 'Hungry already? Here’s the scoop.'],
  experience: ['There’s lots to enjoy here.', 'Here’s what you can do.'],
  location: ['Happy to help you find us.'],
  group: ['We love hosting groups.'],
  event: ['What a lovely thing to celebrate here.'],
  package: ['Here’s a good one.'],
  room: ['Here’s that room.'],
};

function chronoFor(lang: Lang) {
  const c = chrono as unknown as Record<string, { parse: typeof chrono.parse } | undefined>;
  const local = lang !== 'en' ? c[lang] : undefined;
  return local ? [local, chrono] : [chrono];
}

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

/** Stay dates and guest numbers from what the guest wrote. */
export function extractStay(texts: string[], lang: Lang = 'en', ref = new Date()): StayQuery | null {
  const year = ref.getUTCFullYear();
  let text = texts.join(' \n ')
    .replace(/\b(christmas|xmas|no[eë]l|navidad|kerst(?:mis)?|weihnachten)\b/gi, `24 December ${year}`)
    .replace(/\b(new year'?s?(?: eve)?|nouvel an|año nuevo|oud en nieuw|silvester)\b/gi, `31 December ${year}`);
  // "the 5th to the 8th of November" and "5-8 Nov" -> "5 November to 8 November"
  text = text.replace(
    /(\d{1,2})(?:st|nd|rd|th)?\s*(?:to|until|till|-|–|au|al|tot|bis)\s*(?:the\s*)?(\d{1,2})(?:st|nd|rd|th)?\s*(?:of\s+|de\s+)?(jan\w*|ene\w*|feb\w*|f[ée]v\w*|mar\w*|apr\w*|avr\w*|abr\w*|may|mai|mei|mayo|jun\w*|juin|jul\w*|juil\w*|aug\w*|ao[uû]t|ago\w*|sep\w*|oct\w*|okt\w*|nov\w*|dec\w*|d[ée]c\w*|dez\w*|dic\w*)/gi,
    (_m, a, b, mon) => `${a} ${mon} to ${b} ${mon}`,
  );
  // Guest numbers are read separately; left in, "Nov 2 adults" can parse as the year 2 AD.
  const COUNT = /(\d+)\s*(?:adults?|people|persons?|guests?|of us|pax|kids?|children|child|adultes?|personnes?|enfants?|adultos?|personas?|niños?|volwassenen?|personen|kinderen|erwachsene?|kinder|位成人|位儿童|儿童|人)/gi;
  const dateText = text.replace(COUNT, ' ').replace(/[ \t]+/g, ' ').trim();
  let checkIn: Date | undefined;
  let checkOut: Date | undefined;
  let hadRange = false;
  for (const parser of chronoFor(lang)) {
    const results = parser.parse(dateText, ref, { forwardDate: true });
    if (!results.length) continue;
    // Ignore vague matches such as "a day pass"; a date needs a number, a month, a weekday or a word like "tomorrow".
    const real = results.filter((r) => /\d|jan|feb|f[ée]v|mar|apr|avr|abr|may|mai|mei|jun|juin|jul|juil|aug|ao[uû]t|ago|sep|oct|okt|nov|dec|d[ée]c|dez|dic|ene|mon|tue|wed|thu|fri|sat|sun|lun|mar|mer|jeu|ven|sam|dim|tomorrow|tonight|weekend|week|demain|mañana|morgen|月|日|明天|周/i.test(r.text));
    for (const r of real) {
      if (!checkIn) checkIn = r.start.date();
      if (r.end) {
        checkOut = r.end.date();
        hadRange = true;
      } else if (checkIn && r.start.date() > checkIn) {
        checkOut = r.start.date();
        hadRange = true;
      }
    }
    if (checkIn) break;
  }
  const nightsMatch = text.match(/(\d+)\s*(?:nights?|nuits?|noches?|nachten|nächte|晚)/i);
  if (checkIn && !hadRange && nightsMatch) checkOut = addDays(checkIn, Number(nightsMatch[1]));
  if (!checkIn) return null;
  const num = (re: RegExp, d: number) => Number(text.match(re)?.[1] ?? d);
  const adults = num(/(\d+)\s*(?:adults?|people|persons?|guests?|of us|pax|adultes?|personnes?|adultos?|personas?|volwassenen?|personen|erwachsene?|位成人|人)/i, 2);
  const children = num(/(\d+)\s*(?:kids?|children|child|enfants?|niños?|kinderen|kinder|位儿童|儿童)/i, 0);
  if (!checkOut || checkOut <= checkIn) checkOut = addDays(checkIn, 1);
  if (iso(checkIn) < iso(ref)) return null;
  return {
    checkIn: iso(checkIn),
    checkOut: iso(checkOut),
    adults: Math.min(12, Math.max(1, adults)),
    children: Math.min(10, Math.max(0, children)),
    explicitOut: hadRange || Boolean(nightsMatch),
  };
}

const LOCALE_TAG: Record<Lang, string> = { en: 'en-GB', fr: 'fr-FR', es: 'es-ES', nl: 'nl-NL', de: 'de-DE', zh: 'zh-CN' };
function niceDate(isoDate: string, lang: Lang) {
  return new Intl.DateTimeFormat(LOCALE_TAG[lang], { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${isoDate}T00:00:00Z`));
}

function describeStay(s: StayQuery, lang: Lang) {
  const t = SAY[lang];
  const n = Math.round((Date.parse(s.checkOut) - Date.parse(s.checkIn)) / 86400000);
  const who = `${s.adults} ${s.adults === 1 ? t.adult : t.adults}${s.children ? `, ${s.children} ${s.children === 1 ? t.child : t.children}` : ''}`;
  return `${niceDate(s.checkIn, lang)} – ${niceDate(s.checkOut, lang)} (${n} ${n === 1 ? t.night : t.nights}, ${who})`;
}

// ── Turning a knowledge entry into a reply ────────────────────────────────
const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Keep replies short: the first few sentences, plus every link the entry offers. */
const PAGE_FOR: Partial<Record<KnowledgeDoc['category'], [string, string]>> = {
  wellness: ['Wellness', '/wellness'],
  dining: ['Dining', '/dining'],
  experience: ['Experiences', '/experiences'],
  package: ['Plan your visit', '/plan'],
  event: ['Events', '/events'],
  group: ['Groups', '/groups'],
  room: ['Rooms', '/rooms'],
};

function summarise(doc: KnowledgeDoc, whatsapp: string, terms: string[] = [], maxChars = 420): string {
  const content = doc.content;
  const items = content.split(/;\s+/);
  // List-style entries (menus, treatments, add-ons) read better as short bullets, with one way to book.
  if (items.length >= 4) {
    const clean = (i: string) => i.replace(LINK, '').replace(/[:\s]+$/, '').replace(/\s{2,}/g, ' ').trim().replace(/[.;]$/, '');
    const shown = items.slice(0, 8).map((i) => `- ${clean(i)}`).filter((l) => l.length > 3);
    const page = PAGE_FOR[doc.category];
    const more = items.length > 8 ? `\n…and ${items.length - 8} more` : '';
    return `${shown.join('\n')}${more}\n\n${page ? `See everything on [${page[0]}](${page[1]}), or book` : 'Book'} on ${whatsapp.replace(/^\[[^\]]+\]/, '[WhatsApp]')}.`;
  }
  // Keep links whole while cutting to the first few sentences.
  const links: string[] = [];
  const safe = content.replace(LINK, (m) => `\u0000${links.push(m) - 1}\u0000`);
  const restore = (s: string) => s.replace(/\u0000(\d+)\u0000/g, (_, i) => links[Number(i)]);
  if (content.length <= maxChars) return content.trim();
  const sentences = safe.match(/[^.!?]+(?:[.!?]+|$)(?:\s|$)/g) ?? [safe];
  // Lead with the sentence that answers the question, then fill in order.
  const hasTerm = (x: string) => terms.some((t) => t.length > 2 && x.toLowerCase().includes(t));
  const order = [0, ...sentences.map((x, i) => (i > 0 && hasTerm(x) ? i : -1)).filter((i) => i > 0), ...sentences.map((_, i) => i)];
  const chosen = new Set<number>();
  let len = 0;
  for (const i of order) {
    if (chosen.has(i)) continue;
    const add = restore(sentences[i]).length;
    if (len + add > maxChars && chosen.size) continue;
    chosen.add(i);
    len += add;
  }
  const out = Array.from(chosen).sort((a, b) => a - b).map((i) => sentences[i]).join('');
  const used = new Set(Array.from(out.matchAll(/\u0000(\d+)\u0000/g)).map((m) => Number(m[1])));
  const rest = links.filter((_, i) => !used.has(i));
  return `${restore(out).trim()}${rest.length ? `\n${Array.from(new Set(rest)).join(' · ')}` : ''}`;
}

function pick<T>(arr: T[] | undefined, seed: number): T | undefined {
  return arr && arr.length ? arr[seed % arr.length] : undefined;
}

export async function abenaReply(message: string, history: string[], lang: Lang, deps: AbenaDeps): Promise<AbenaReply> {
  const t = SAY[lang] ?? SAY.en;
  const vars = { wa: deps.whatsapp, phone: deps.phone, email: deps.email };
  const msg = message.trim();
  const turn = history.length;

  if (!msg || GREETING.test(msg)) return { text: t.welcome, ids: [], flagged: false };
  if (THANKS.test(msg) && msg.length < 60) return { text: t.thanks, ids: [], flagged: false };
  if (BYE.test(msg) && msg.length < 40) return { text: t.bye, ids: [], flagged: false };
  if (HUMAN.test(msg) && !ROOMS.test(msg)) return { text: `${t.human} ${fill(t.humanBody, vars)}`, ids: ['contact'], flagged: false };

  // Rooms, dates and live prices.
  const ownStay = extractStay([msg], lang, deps.today);
  const wantsRooms = ROOMS.test(msg) || Boolean(ownStay);
  // A follow-up like "2 adults" or "what about the 20th?" builds on dates given earlier.
  const stay = ownStay ?? (wantsRooms || /\b\d+\s*(adults?|people|guests?|kids?|children|nights?)\b/i.test(msg) ? extractStay([...history.slice(-2), msg], lang, deps.today) : null);
  if (wantsRooms || (stay && !ownStay && /\b(adults?|people|guests?|kids?|children|nights?)\b/i.test(msg))) {
    try {
      if (stay) {
        const rates = await deps.stayRates(stay);
        if (rates) {
          const when = describeStay(stay, lang);
          if (!rates.length) return { text: fill(t.nothing, { ...vars, when }), ids: ['cloudbeds'], flagged: false };
          const lower = msg.toLowerCase();
          const asked = ROOM_WORDS.filter((w) => lower.includes(w));
          const matching = asked.length ? rates.filter((r) => asked.every((w) => r.roomTypeName.toLowerCase().includes(w === 'travelling' ? 'traveling' : w))) : [];
          const list = (matching.length ? matching : rates)
            .map((r) => `- ${r.roomTypeName}: ${deps.formatMoney(r.nightly)} ${t.aNight}, ${deps.formatMoney(r.total)} ${t.total} (${r.roomsAvailable} ${t.left})`)
            .join('\n');
          return {
            text: `${fill(t.openFor, { when })}\n${list}${stay.explicitOut ? '' : `\n${t.assumed}`}\n\n${fill(t.book, { href: deps.bookingHref(stay) })}`,
            ids: ['cloudbeds'],
            flagged: false,
          };
        }
      } else {
        // "Tell me about the family room": describe it, then offer to check dates.
        const about = search(await deps.docs(), msg, 1)[0];
        if (about && about.doc.category === 'room' && about.score >= 6 && !/\b(available|availability|free|vacanc|price|cost|how much)\b/i.test(msg)) {
          return { text: `${summarise(about.doc, deps.whatsapp, queryTerms(msg))}\n\n${t.askDates}`, ids: [about.doc.id], flagged: false };
        }
        const tonight = await deps.tonight();
        if (tonight) {
          const list = tonight.map((r) => `- ${r.roomTypeName}: ${deps.formatMoney(r.nightly)} ${t.aNight} (${r.roomsAvailable} ${t.left})`).join('\n');
          return { text: `${t.askDates}\n\n${tonight.length ? `${t.tonight}\n${list}` : t.tonightFull}`, ids: ['cloudbeds'], flagged: false };
        }
      }
    } catch {
      /* fall through to the knowledge base */
    }
  }

  // Everything else, from KoSa's own information.
  const docs = await deps.docs();
  const hits = search(docs, msg, 3);
  const top = hits[0];
  // Confident when the best match covers the question well, or scores strongly.
  const confident = top && (top.score >= 6 || (top.coverage >= 0.5 && top.score >= 2.5) || (top.coverage === 1 && top.score >= 0.85));
  if (!top || !confident) {
    if (wantsRooms) return { text: fill(t.roomsUnsure, vars), ids: [], flagged: true };
    return { text: `${t.unsure} ${fill(t.unsureBody, vars)}`, ids: [], flagged: true };
  }
  const picked = [top];
  const second = hits[1];
  if (second && second.score >= top.score * 0.92 && second.doc.category !== 'page' && top.doc.category !== 'page' && top.doc.content.length + second.doc.content.length < 700) {
    picked.push(second);
  }
  // A warm first line for descriptions; price lists and plain facts go straight to the point.
  const plain = top.doc.id === 'not-offered' || isListDoc(top.doc) || /\b(how (far|long|much)|what time|when)\b/i.test(msg);
  const opener = lang === 'en' ? (plain ? '' : pick(OPENERS[top.doc.category], turn)) : t.englishOnly;
  const terms = queryTerms(msg);
  const body = picked.map((h) => summarise(h.doc, deps.whatsapp, terms)).join('\n\n');
  const closer = turn % 3 === 1 ? `\n\n${t.more}` : '';
  return { text: `${opener ? `${opener} ` : ''}${body}${closer}`.trim(), ids: picked.map((h) => h.doc.id), flagged: false };
}

export function errorReply(lang: Lang, whatsapp: string) {
  return fill((SAY[lang] ?? SAY.en).error, { wa: whatsapp });
}
