/**
 * Seed script: Daily Activities, Wellness Packages, Stay Enhancements,
 * and Ko-Sa Health Spa treatments.
 *
 * Run: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed-kosa-content.ts
 * Or via: npx tsx scripts/seed-kosa-content.ts
 */

import { PrismaClient, type Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Ko-Sa content...');

  // ── Daily Activities ─────────────────────────────────────────────────────

  await prisma.dailyActivity.deleteMany();

  const activities: Prisma.DailyActivityCreateInput[] = [
    // Monday
    { day: 'MONDAY', time: '8:00 AM', title: 'Morning Beach Yoga', sortOrder: 0,
      description: 'Start your week right. A gentle flow session on the sand as the sun rises over the Atlantic.',
      tag: 'All levels welcome, just bring yourself.' },
    { day: 'MONDAY', time: '5:00 PM', title: 'Sunset Watching and Photography Golden Hour', sortOrder: 1,
      description: 'The Ghana sky puts on a show every evening. Grab your phone or camera and catch the Atlantic at its most golden.',
      tag: 'No filter needed.' },
    // Tuesday
    { day: 'TUESDAY', time: '7:00 AM', title: 'Beach Walk', sortOrder: 0,
      description: 'The best way to wake up, barefoot on white sand with the Atlantic breeze in your face. A peaceful morning stroll along Ko-Sa\'s beachfront to clear your head and fill your lungs.',
      tag: null },
    { day: 'TUESDAY', time: '7:00 PM', title: 'Twi Lessons', sortOrder: 1,
      description: 'Pick up a few words of Ghana\'s most spoken language. Learn to greet, bargain at the market and make locals smile.',
      tag: 'Fun, informal and surprisingly addictive.' },
    // Wednesday
    { day: 'WEDNESDAY', time: '8:00 AM', title: 'Sunrise Meditation and Stretching', sortOrder: 0,
      description: 'Begin your Wednesday with stillness. A guided meditation and gentle stretching session in Ko-Sa\'s golden sand as the morning light filters through the palms.',
      tag: 'Breathe in, slow down.' },
    { day: 'WEDNESDAY', time: '7:00 PM', title: 'Games Night', sortOrder: 1,
      description: 'Board games, card games, laughter - the midweek social highlight at Ko-Sa. Pull up a chair, meet fellow guests and let the evening run away with you.',
      tag: 'Snacks welcome.' },
    // Thursday
    { day: 'THURSDAY', time: '11:00 AM', title: 'Guided Walk to the Fishing Village', sortOrder: 0,
      description: 'Step beyond the resort and into Ampenyi. Walk through the local fishing village with a Ko-Sa guide, meet the fishermen, see the boats and feel the real rhythm of life on Ghana\'s coast.',
      tag: null },
    { day: 'THURSDAY', time: '5:00 PM', title: 'Walk in Ko-Sa Garden', sortOrder: 1,
      description: 'A slow, guided stroll through Ko-Sa\'s lush garden grounds. Learn about the tropical plants, herbs and eco-landscaping that make Ko-Sa one of Ghana\'s most distinctive green spaces.',
      tag: null },
    // Friday
    { day: 'FRIDAY', time: '8:00 AM', title: 'Sunrise Meditation and Stretching', sortOrder: 0,
      description: 'Close out the week with intention. A grounding morning meditation and stretch session in Ko-Sa\'s golden sand. The perfect way to arrive at Friday feeling clear, calm and present.',
      tag: null },
    { day: 'FRIDAY', time: '3:00 PM', title: 'Drumming Lessons', sortOrder: 1,
      description: 'Feel the rhythm of Ghana. A hands-on introduction to West African drumming, no experience needed, just a willingness to move and laugh. One of Ko-Sa\'s most popular afternoon sessions.',
      tag: null },
    // Saturday
    { day: 'SATURDAY', time: '7:00 AM', title: 'Tour of the Village', sortOrder: 0,
      description: 'An early morning walk through Ampenyi and the surrounding area with a Ko-Sa guide. See local life waking up, the market opening, fishing boats heading out - the real Ghana before the day gets busy.',
      tag: null },
    { day: 'SATURDAY', time: '7:00 PM', title: 'Twi Lessons', sortOrder: 1,
      description: 'Back by popular demand. Saturday evening Twi. Learn the phrases that will get you smiles, good deals and warm welcomes anywhere in Ghana.',
      tag: 'Casual, fun and genuinely useful.' },
    // Sunday
    { day: 'SUNDAY', time: '10:00 AM', title: 'Family-Friendly Games', sortOrder: 0,
      description: 'Sunday morning is for everyone. A relaxed games session designed for guests of all ages - fun, low-key and a great way to spend the morning before checkout or a lazy beach afternoon.',
      tag: null },
    { day: 'SUNDAY', time: '5:00 PM', title: 'Sunset Watching and Photography Golden Hour', sortOrder: 1,
      description: 'End your weekend the Ko-Sa way. Watch the Atlantic turn gold as the sun drops below the horizon. Bring your camera, your drink and someone worth sharing a sunset with.',
      tag: null },
  ];

  for (const a of activities) {
    await prisma.dailyActivity.create({ data: { ...a, isFree: true, status: 'PUBLISHED' } });
  }
  console.log(`  Created ${activities.length} daily activities`);

  // ── Wellness Packages ───────────────────────────────────────────────────

  await prisma.wellnessPackage.deleteMany();

  const packages: Prisma.WellnessPackageCreateInput[] = [
    {
      slug: 'weekend-getaway', name: 'Weekend Getaway', category: 'Leisure',
      tagline: 'Everything Accra is not. For two days.',
      durationLabel: '2 Nights (Fri-Sun)', priceGhs: 2200, originalPriceGhs: 2240,
      priceNote: 'Solo', couplePriceGhs: 1900, couplePriceNote: 'Per Person (Couple)',
      sortOrder: 0,
      inclusions: [
        '2 nights Garden View Double or Twin (upgradeable to Sea View)',
        'Daily breakfast at Kosa Breeze restaurant',
        'Complimentary 10-min welcome massage on arrival',
        '1 activity of your choice: canoe ride, bead making, painting or horseback riding',
        'Beach access with complimentary sunbed all weekend',
        'Sunset drink voucher: Friday or Saturday evening at Kosa Breeze bar',
        'Late check-out Sunday at 12 PM (standard)',
      ],
    },
    {
      slug: 'the-ko-sa-reset', name: 'The Ko-Sa Reset', category: 'Wellness',
      tagline: 'Five days of ocean air, healing rituals and stillness.',
      durationLabel: '5 Nights Minimum', priceGhs: 5800, originalPriceGhs: 6496,
      priceNote: 'Solo', couplePriceGhs: 5000, couplePriceNote: 'Per Person (Couple)',
      sortOrder: 1,
      inclusions: [
        '5 nights Garden View Double (upgradeable to Sea View)',
        'Daily breakfast at Kosa Breeze restaurant',
        'Complimentary 10-min welcome massage on arrival',
        'Ko-Sa Health Spa: Holistic Massage (60 min)',
        'O2 Wellness: Herbal Detox Steam Ritual',
        'O2 Wellness: Glow Polish Facial Ritual',
        'Daily morning yoga and meditation (on schedule)',
        'Ko-Sa kitchen cooking class: your choice of Ghanaian dish',
        'Guided fishing village walk (Thursday)',
        'Sunset beach setup: golden hour session',
        'Welcome fresh juice and farewell seasonal fruit bowl',
      ],
    },
    {
      slug: 'the-ko-sa-romance', name: 'The Ko-Sa Romance', category: 'Romance',
      tagline: 'Where the Atlantic meets your love story.',
      durationLabel: '2-3 Nights', priceGhs: 5500, originalPriceGhs: 6098,
      priceNote: 'Per couple (2 nights)', couplePriceGhs: 7000, couplePriceNote: 'Per couple (3 nights)',
      sortOrder: 2,
      inclusions: [
        '2 nights Deluxe or Luxury Double (Sea View)',
        'Daily breakfast in bed or private beach breakfast',
        'Complimentary 10-min welcome massage for both guests on arrival',
        'Room decorated on arrival: rose petals, candles, welcome card',
        'Welcome champagne or sparkling wine on arrival',
        'Ko-Sa Health Spa: Couples Massage (60 min)',
        'Private candle dinner on the beach: Kosa Breeze set menu for two',
        'O2 Wellness: Herbal Detox Steam Ritual for two',
        'O2 Wellness: Sunset Beach Setup with fresh juice and flowers',
        'Late check-out at 2 PM (subject to availability)',
        'Complimentary anniversary or honeymoon cake',
      ],
    },
    {
      slug: 'the-proposal-experience', name: 'The Proposal Experience', category: 'Romance',
      tagline: 'The Atlantic as your backdrop. She will say yes.',
      durationLabel: '1-2 Nights', priceGhs: 3200, originalPriceGhs: 3325,
      priceNote: '1 Night', couplePriceGhs: 5000, couplePriceNote: '2 Nights (Extended)',
      sortOrder: 3,
      inclusions: [
        '1 night Luxury Double or Deluxe Double (Sea View)',
        'Complimentary 10-min welcome massage for both guests',
        'Private decorated beach setup: floral arch or table, candles, rose petals',
        'Ko-Sa staff on standby for the proposal moment',
        'Chilled sparkling wine: 2 bottles',
        'Fresh tropical fruit platter',
        'Ko-Sa staff photographer for the proposal: 30 minutes',
        'Welcome card personally signed by Ko-Sa management',
        'Champagne breakfast in bed the morning after',
        'Option to extend stay: discounted second night available',
      ],
    },
    {
      slug: 'birthday-celebration', name: 'Birthday Celebration', category: 'Celebration',
      tagline: 'Because you deserve a birthday with the ocean.',
      durationLabel: '2-3 Nights', priceGhs: 4500, originalPriceGhs: 4760,
      priceNote: 'Birthday Guest', couplePriceGhs: 825, couplePriceNote: 'Extra Group Rooms (per room/night)',
      sortOrder: 4,
      inclusions: [
        '2 nights Garden or Sea View room (birthday person\'s choice)',
        'Daily breakfast at Kosa Breeze restaurant',
        'Complimentary 10-min welcome massage on arrival',
        'Personalised birthday cake from Ko-Sa kitchen',
        'Room decorated on arrival: balloons, petals, birthday banner',
        'Welcome cocktail or mocktail round for the group (up to 8 guests)',
        '1 complimentary activity: drumming workshop, cooking class or canoe ride',
        'Group beach bonfire setup: firewood, fairy lights, seating arranged',
        'Birthday dinner at Kosa Breeze: dedicated table reserved',
      ],
    },
    {
      slug: 'heritage-and-soul-retreat', name: 'Heritage and Soul Retreat', category: 'Culture',
      tagline: 'Come home to yourself. Ghana has always been waiting.',
      durationLabel: '4 Nights', priceGhs: 8500, originalPriceGhs: 9750,
      priceNote: 'Solo', couplePriceGhs: 7200, couplePriceNote: 'Per Person (Couple)',
      sortOrder: 5,
      inclusions: [
        '4 nights Luxury Double or Twin (Sea View)',
        'Daily breakfast at Kosa Breeze restaurant',
        'Complimentary 10-min welcome massage on arrival',
        'Welcome Ghanaian set dinner: Jollof Rice, Red Red or Groundnut Soup',
        'Cape Coast Castle and Elmina Castle guided tours',
        'Kakum National Park Tour',
        'Drumming and Dancing Workshop',
        'Batik Making class in Elmina',
        'Guided City Tour and Street Food Tasting, Cape Coast',
        'Twi language lesson: complimentary (Tuesday and Saturday)',
        'Farewell beach sunset drink',
      ],
    },
    {
      slug: 'the-ko-sa-day-pass', name: 'The Ko-Sa Day Pass', category: 'Day Visit',
      tagline: 'No room needed. Just a great day by the sea.',
      durationLabel: 'Day Visit (10AM - 6PM)', priceGhs: 320, originalPriceGhs: null,
      priceNote: 'Tier A (Beach and Lunch)', couplePriceGhs: 550, couplePriceNote: 'Tier C (Full Wellness Day)',
      sortOrder: 6,
      inclusions: [
        'TIER A (GHC 320): Beach access and sunbed for the full day',
        'TIER A: Set lunch at Kosa Breeze, 2 courses from Local Favourites menu',
        'TIER A: Welcome fresh juice on arrival',
        'TIER B (GHC 520): Everything in Tier A',
        'TIER B: 1 activity of your choice: bead making, painting or horseback riding',
        'TIER C (GHC 550): Everything in Tier B',
        'TIER C: Ko-Sa Health Spa Swedish Massage or O2 Wellness ritual of your choice',
      ],
    },
    {
      slug: 'the-slow-beach-escape', name: 'The Slow Beach Escape', category: 'Eco',
      tagline: 'No agenda. Just ocean, good food and time to breathe.',
      durationLabel: '2-3 Nights', priceGhs: 3800, originalPriceGhs: 4580,
      priceNote: 'Solo', couplePriceGhs: 2100, couplePriceNote: 'Per Person (Couple)',
      sortOrder: 7,
      inclusions: [
        '2 nights minimum: Sea View Premium Room (Luxury Double)',
        'Daily breakfast at Kosa Breeze restaurant',
        'Complimentary 10-min welcome massage on arrival',
        'Ko-Sa Health Spa: Swedish Massage (60 min)',
        'Guided canoe ride with local Ampenyi fishermen',
        'Ko-Sa garden walk and grounds tour',
        'Village tour, Saturday morning (complimentary)',
        'Beachside dinner for two: Kosa Breeze set menu',
        'Welcome fresh juice on arrival',
        'Sunset photography golden hour session',
        'Bead making or painting class (guest\'s choice)',
      ],
    },
  ];

  for (const p of packages) {
    await prisma.wellnessPackage.create({ data: { ...p, status: 'PUBLISHED' } });
  }
  console.log(`  Created ${packages.length} wellness packages`);

  // ── Stay Enhancements ───────────────────────────────────────────────────

  await prisma.stayEnhancement.deleteMany();

  const enhancements: Prisma.StayEnhancementCreateInput[] = [
    // Experiences & Celebrations
    { category: 'Experiences & Celebrations', name: 'Private Beach Breakfast for Two', priceGhs: 250, priceTo: null, priceNote: null, sortOrder: 0 },
    { category: 'Experiences & Celebrations', name: 'Couples Professional Photoshoot', description: '1 hour on the beach', priceGhs: 800, priceTo: null, priceNote: null, sortOrder: 1 },
    { category: 'Experiences & Celebrations', name: 'Beach Bonfire Setup', description: 'Evening, firewood, fairy lights and seating', priceGhs: 350, priceTo: null, priceNote: null, sortOrder: 2 },
    { category: 'Experiences & Celebrations', name: 'Candle Dinner on the Beach', description: 'Kosa Breeze set menu for two', priceGhs: 800, priceTo: null, priceNote: null, sortOrder: 3 },
    { category: 'Experiences & Celebrations', name: 'Birthday or Celebration Cake', description: 'From Ko-Sa kitchen', priceGhs: 400, priceTo: 500, priceNote: null, sortOrder: 4 },
    { category: 'Experiences & Celebrations', name: 'Room Decoration', description: 'Rose petals, candles, banner', priceGhs: 200, priceTo: 350, priceNote: null, sortOrder: 5 },
    // Activities & Excursions
    { category: 'Activities & Excursions', name: 'Ko-Sa Cooking Class', description: 'Your choice of Ghanaian dish', priceGhs: 625, priceTo: null, priceNote: null, sortOrder: 0 },
    { category: 'Activities & Excursions', name: 'Drumming and Dancing Workshop', priceGhs: 750, priceTo: null, priceNote: null, sortOrder: 1 },
    { category: 'Activities & Excursions', name: 'Cape Coast and Elmina Castle Tours', priceGhs: 1000, priceTo: null, priceNote: 'per person', sortOrder: 2 },
    { category: 'Activities & Excursions', name: 'Kakum National Park Tour', priceGhs: 800, priceTo: null, priceNote: 'per person', sortOrder: 3 },
    { category: 'Activities & Excursions', name: 'Guided Canoe Ride', priceGhs: 600, priceTo: null, priceNote: null, sortOrder: 4 },
    { category: 'Activities & Excursions', name: 'Horseback Riding', priceGhs: 250, priceTo: null, priceNote: null, sortOrder: 5 },
  ];

  for (const e of enhancements) {
    await prisma.stayEnhancement.create({ data: { ...e, status: 'PUBLISHED' } });
  }
  console.log(`  Created ${enhancements.length} stay enhancements`);

  // ── Ko-Sa Health Spa treatments (replace with real data) ────────────────

  await prisma.treatment.deleteMany();

  const treatments: Prisma.TreatmentCreateInput[] = [
    // Ko-Sa Health Spa
    { slug: 'deepcore-massage', name: 'Deepcore Massage', category: 'Ko-Sa Health Spa',
      description: 'A unique combination of deep tissue, trigger points and energy flow. Releases deep tension while restoring the body\'s natural energy pathways.', durationMin: 45, price: 350, currency: 'GHS', sortOrder: 0 },
    { slug: 'deepcore-massage-60', name: 'Deepcore Massage (60 min)', category: 'Ko-Sa Health Spa',
      description: 'Extended session: deep tissue, trigger points and energy flow for a deeper release.', durationMin: 60, price: 400, currency: 'GHS', sortOrder: 1 },
    { slug: 'couples-massage', name: 'Couples Massage', category: 'Ko-Sa Health Spa',
      description: 'Simultaneous massage for two in the same room. Share the experience of relaxation together.', durationMin: 45, price: 550, currency: 'GHS', sortOrder: 2 },
    { slug: 'couples-massage-60', name: 'Couples Massage (60 min)', category: 'Ko-Sa Health Spa',
      description: 'Extended couples massage: simultaneous massage for two in the same room.', durationMin: 60, price: 700, currency: 'GHS', sortOrder: 3 },
    { slug: 'swedish-massage', name: 'Swedish Massage', category: 'Ko-Sa Health Spa',
      description: 'Improves blood flow, reduces tension and enhances flexibility. A classic relaxation massage using long, flowing strokes.', durationMin: 45, price: 300, currency: 'GHS', sortOrder: 4 },
    { slug: 'swedish-massage-60', name: 'Swedish Massage (60 min)', category: 'Ko-Sa Health Spa',
      description: 'Extended Swedish massage for deeper relaxation and full-body tension release.', durationMin: 60, price: 350, currency: 'GHS', sortOrder: 5 },
    { slug: 'holistic-massage', name: 'Holistic Massage', category: 'Ko-Sa Health Spa',
      description: 'Treats body, mind and spirit to balance energy and promote wellbeing. A whole-person approach to relaxation and restoration.', durationMin: 45, price: 330, currency: 'GHS', sortOrder: 6 },
    { slug: 'holistic-massage-60', name: 'Holistic Massage (60 min)', category: 'Ko-Sa Health Spa',
      description: 'Extended holistic massage: treats body, mind and spirit for complete restoration.', durationMin: 60, price: 380, currency: 'GHS', sortOrder: 7 },
    { slug: 'reflexology', name: 'Reflexology', category: 'Ko-Sa Health Spa',
      description: 'Pressure applied to feet, hands and ears to restore balance. A deeply relaxing treatment that works on the body\'s reflex points.', durationMin: 30, price: 200, currency: 'GHS', sortOrder: 8 },
    { slug: 'reflexology-45', name: 'Reflexology (45 min)', category: 'Ko-Sa Health Spa',
      description: 'Extended reflexology: pressure applied to feet, hands and ears for deeper balance restoration.', durationMin: 45, price: 250, currency: 'GHS', sortOrder: 9 },
    { slug: 'pedicure', name: 'Pedicure', category: 'Ko-Sa Health Spa',
      description: 'Cleaning, exfoliating and moisturising of feet and toenails. A complete foot treatment to leave you feeling refreshed.', durationMin: 45, price: 150, currency: 'GHS', sortOrder: 10 },
    // O2 Wellness
    { slug: 'herbal-detox-steam', name: 'Herbal Detox Steam Ritual', category: 'O2 Wellness',
      description: 'Circulation, relaxation and cleansing. A deeply purifying steam ritual using herbal blends to detoxify and restore the body.', durationMin: 60, price: 264, currency: 'GHS', sortOrder: 0 },
    { slug: 'glow-polish-facial', name: 'Glow Polish Facial Ritual', category: 'O2 Wellness',
      description: 'Radiance, hydration and skin refresh. A revitalising facial treatment to restore your natural glow.', durationMin: 60, price: 302, currency: 'GHS', sortOrder: 1 },
    { slug: 'full-body-glow-polish', name: 'Full Body Glow Polish', category: 'O2 Wellness',
      description: 'Exfoliation, skin renewal and softening. A full-body scrub treatment that leaves skin silky and luminous.', durationMin: 75, price: 672, currency: 'GHS', sortOrder: 2 },
    { slug: '1-day-regenerative-escape', name: '1-Day Regenerative Escape', category: 'O2 Wellness',
      description: 'Therapy, meal and wellness consultation. A full day of restoration combining treatments, nourishment and personalised wellness guidance.', durationMin: 480, price: 1200, currency: 'GHS', sortOrder: 3 },
    { slug: '2-day-coastal-reset', name: '2-Day Coastal Reset Retreat', category: 'O2 Wellness',
      description: 'Therapies, meals and guided wellness reset. Two days of immersive coastal wellness to fully recharge.', durationMin: 960, price: 2400, currency: 'GHS', sortOrder: 4 },
    { slug: '3-day-full-renewal', name: '3-Day Full Renewal Retreat', category: 'O2 Wellness',
      description: 'Immersive healing, meals and premium therapies. Three days of comprehensive renewal combining the best of Ko-Sa\'s wellness offerings.', durationMin: 1440, price: 3600, currency: 'GHS', sortOrder: 5 },
  ];

  for (const t of treatments) {
    await prisma.treatment.create({ data: { ...t, status: 'PUBLISHED' } });
  }
  console.log(`  Created ${treatments.length} spa treatments`);

  console.log('Seeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
