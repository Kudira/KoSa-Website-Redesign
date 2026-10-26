// Tailored WhatsApp messages. Every "book" or "enquire" button for something
// that is not a room (experiences, packages, spa, add-ons, events, groups)
// opens WhatsApp with a message that names exactly what the guest picked,
// repeats its key details, and leaves blanks for what the team needs to reply.
//
// Rooms are different: they go to the Cloudbeds booking engine with dates
// pre-filled (see lib/cloudbeds/client.ts → bookingEngineUrl).

import { site } from '@/lib/site';
import { formatGhs } from '@/lib/pricing';

export function waUrl(message: string) {
  // Brackets are encoded too, so links stay whole inside [label](url) text.
  return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message).replace(/\(/g, '%28').replace(/\)/g, '%29')}`;
}

const lines = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join('\n');
const money = (ghs?: number | null) => (ghs ? formatGhs(ghs) : null);

export const wa = {
  experience: (o: { name: string; duration?: string | null; priceGhs?: number | null; perPerson?: boolean }) =>
    lines(
      `Hi KoSa! I'd like to book the ${o.name}${o.duration || o.priceGhs ? ` (${[o.duration, money(o.priceGhs) && `from ${money(o.priceGhs)}${o.perPerson === false ? '' : ' per person'}`].filter(Boolean).join(', ')})` : ''}.`,
      '',
      'Preferred date:',
      'Number of people:',
      'Staying at KoSa: yes / no',
    ),

  stayPackage: (o: { name: string; nights?: number | null; durationLabel?: string | null; priceGhs?: number | null; inclusions?: string | null }) =>
    lines(
      `Hi KoSa! I'm interested in the ${o.name} package${[o.nights ? `${o.nights} nights` : o.durationLabel, money(o.priceGhs) && `from ${money(o.priceGhs)}`].filter(Boolean).length ? ` (${[o.nights ? `${o.nights} nights` : o.durationLabel, money(o.priceGhs) && `from ${money(o.priceGhs)}`].filter(Boolean).join(', ')})` : ''}.`,
      o.inclusions && `It includes ${o.inclusions}.`,
      '',
      'Preferred dates:',
      'Number of guests:',
      'Anything you would like us to know:',
    ),

  customiseStay: (base?: string) =>
    lines(
      base ? `Hi KoSa! I like the ${base} but would like to shape it around me.` : "Hi KoSa! I'd like help planning a stay that fits me.",
      '',
      'Dates:',
      'Number of guests:',
      'What I would love to do:',
    ),

  escape: (o: { name: string; priceGhs: number }) =>
    lines(
      `Hi KoSa! I'd like to book the ${o.name} One-Day Escape at O2 Wellness (${formatGhs(o.priceGhs)}).`,
      '',
      'Preferred date:',
      'Number of people:',
      'Anything about my health the team should know:',
    ),

  retreat: (o: { name: string; days?: number; priceGhs?: number }) =>
    lines(
      `Hi KoSa! I'm interested in the ${o.name}${o.days ? ` (${o.days} days${o.priceGhs ? `, ${formatGhs(o.priceGhs)}` : ''})` : ''}.`,
      '',
      'Preferred dates:',
      'Number of people:',
      'What I would like to get from it:',
    ),

  treatment: (o: { name: string; durationMin?: number; priceGhs?: number }) =>
    lines(
      `Hi KoSa! I'd like to book a ${o.name}${o.durationMin || o.priceGhs ? ` (${[o.durationMin && `${o.durationMin} min`, money(o.priceGhs)].filter(Boolean).join(', ')})` : ''}.`,
      '',
      'Preferred date and time:',
      'Number of people:',
      'Staying at KoSa: yes / no',
    ),

  consultation: () =>
    lines(
      "Hi KoSa! I'd like to book a Private Wellness Consultation (GHS 200, credited toward my itinerary).",
      '',
      'Preferred date:',
      'What I would like help with:',
    ),

  enhancement: (o: { name: string; priceGhs?: number; priceTo?: number | null }) =>
    lines(
      `Hi KoSa! I'd like to add ${o.name}${o.priceGhs ? ` (${formatGhs(o.priceGhs)}${o.priceTo ? `–${formatGhs(o.priceTo)}` : ''})` : ''} to my stay.`,
      '',
      'Booking name or stay dates:',
      'Date for this:',
      'Any details:',
    ),

  event: (o: { title: string; priceNote?: string | null; transportIncluded?: boolean }) =>
    lines(
      `Hi KoSa! I'm interested in ${o.title}${o.priceNote ? ` (${o.priceNote})` : ''}.`,
      o.transportIncluded && 'I see transport is included.',
      '',
      'Preferred date:',
      'Number of people:',
    ),

  table: () => lines("Hi KoSa! I'd like to reserve a table at the restaurant.", '', 'Date:', 'Time:', 'Number of people:'),

  privateDining: () =>
    lines("Hi KoSa! I'd like to plan a private or beach dinner.", '', 'Occasion:', 'Date:', 'Number of people:'),

  transfer: () =>
    lines("Hi KoSa! I'd like to book an airport transfer from Kotoka International Airport.", '', 'Flight number:', 'Arrival date and time:', 'Number of passengers:'),


  group: () =>
    lines(
      "Hi KoSa! I'm planning a group stay.",
      '',
      'Organisation or tour company:',
      'Number of guests:',
      'Dates:',
      'Type of trip (tour, school, corporate, retreat, celebration):',
    ),

  groupGuide: () => "Hi KoSa! Could you send me the Group Guide 2026/27 for groups, companies and tour operators?",

  roomHelp: (o: { checkIn?: string; checkOut?: string; adults?: number; children?: number; room?: string }) =>
    lines(
      `Hi KoSa! I'd like help booking${o.room ? ` the ${o.room}` : ' a room'}${o.checkIn && o.checkOut ? ` from ${o.checkIn} to ${o.checkOut}` : ''}.`,
      o.adults ? `Guests: ${o.adults} adult${o.adults > 1 ? 's' : ''}${o.children ? `, ${o.children} child${o.children > 1 ? 'ren' : ''}` : ''}` : 'Number of guests:',
    ),
};
