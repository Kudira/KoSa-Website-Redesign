/**
 * KoSa i18n dictionary lightweight, cookie-driven, no route restructure.
 * Add keys with EN as source of truth; FR, ES, NL & DE translations follow.
 * Used via `useT()` (client) and `getT()` (server).
 */

import { zh } from './zh';
import { enRedesign, frRedesign, esRedesign, nlRedesign, deRedesign, zhRedesign } from './redesign';

export const SUPPORTED_LOCALES = ['en', 'fr', 'es', 'nl', 'de', 'zh'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_COOKIE = 'kosa_locale';

/**
 * Display metadata for each supported language. Used by the LanguageSwitcher.
 * `country` is the ISO-3166 alpha-2 code used to render a real flag graphic
 * (emoji flags do not render on Windows). `flag` is kept as an emoji fallback.
 */
export const LOCALE_META: Record<
  Locale,
  { label: string; native: string; flag: string; country: string; code: string }
> = {
  en: { label: 'English',  native: 'English',    flag: '🇬🇧', country: 'gb', code: 'EN' },
  fr: { label: 'French',   native: 'Français',   flag: '🇫🇷', country: 'fr', code: 'FR' },
  es: { label: 'Spanish',  native: 'Español',    flag: '🇪🇸', country: 'es', code: 'ES' },
  nl: { label: 'Dutch',    native: 'Nederlands', flag: '🇳🇱', country: 'nl', code: 'NL' },
  de: { label: 'German',   native: 'Deutsch',    flag: '🇩🇪', country: 'de', code: 'DE' },
  zh: { label: 'Chinese',  native: '中文',        flag: '🇨🇳', country: 'cn', code: 'ZH' },
};

const enBase = {
  // Navigation
  'nav.rooms': 'Rooms',
  'nav.experiences': 'Experiences',
  'nav.dining': 'Dining',
  'nav.wellness': 'Wellness',
  'nav.gallery': 'Gallery',
  'nav.virtualTour': 'Virtual Tour',
  'nav.about': 'About',
  'nav.blog': 'Journal',
  'nav.contact': 'Contact',
  'nav.book': 'Book Now',
  'nav.bookYourStay': 'Book Your Stay',

  // Hero
  'hero.location': 'Elmina · Ghana · West Africa',
  'hero.headline': 'Life is better at the beach',
  'hero.tagline': 'Breathe · Beach · Belong',
  'hero.bookCta': 'Book Your Escape',
  'hero.exploreCta': 'Explore the Resort',
  'hero.scrollAria': 'Scroll to next section',

  // Intro
  'intro.eyebrow': 'Welcome · Akwaaba',
  'intro.headline.l1': 'KoSa is not a hotel',
  'intro.headline.l2': 'It is a place you return to',
  'intro.body':
    'On a stretch of soft Atlantic coast in Elmina, where palms lean toward the wind and the ocean keeps a slower clock, we built a place to be still · Eco-luxe in its bones, grounded in Ghanaian craft, and elevated by the rituals of the people who tend it',
  'intro.script': 'Simply, Breathe',
  'intro.philosophyCta': 'Read our philosophy the 5 layers of self',

  // Rooms section
  'rooms.eyebrow': 'Stay with us',
  'rooms.headline': 'Boutique by the Atlantic',
  'rooms.statRooms': 'Room Types',
  'rooms.statSuites': 'Garden View',
  'rooms.statBeach': 'Beach',
  'rooms.filter.all': 'All',
  'rooms.filter.beachView': 'Sea View',
  'rooms.filter.palmSide': 'Palm Side',
  'rooms.filter.suite': 'Garden View',
  'rooms.priceFrom': 'From',
  'rooms.perNight': 'night',
  'rooms.view': 'View',

  // Experiences section
  'experiences.eyebrow': 'Live fully',
  'experiences.headline': 'Four ways to feel rooted',
  'experiences.blurb':
    'From sunrise yoga on the bluff to fire-lit drum circles, every day at KoSa is composed of small returns to yourself',
  'experiences.discover': 'Discover',

  // Wellness section
  'wellness.bgWord': 'Simply, Breathe',
  'wellness.eyebrow': 'Breathe',
  'wellness.headline.l1': 'Spa, yoga, sound',
  'wellness.headline.l2': 'the five layers of self',
  'wellness.blurb':
    'Treatments born of West African materia shea, palm, salt performed in open cabanas where the only sound is the tide',
  'wellness.bookCta': 'Book a Treatment',

  // Testimonials
  'testimonials.via': 'via',
  'testimonials.eyebrow': 'Returning Guests',
  'testimonials.headline': 'Words from the shore',

  // Booking CTA
  'booking.eyebrow': 'Reserve Your Return',
  'booking.headline.l1': 'The shore is ready',
  'booking.headline.l2': 'Are you?',
  'booking.blurb':
    'Real-time availability, best-rate guarantee, and a warm welcome at the gate · Book in under two minutes',
  'booking.badgeSecure': 'Secure Booking',
  'booking.badgeBestRate': 'Best Rate Guaranteed',
  'booking.badgeCancel': 'Free Cancellation',
  'booking.formTitle': 'Check Availability',
  'booking.checkIn': 'Check in',
  'booking.checkOut': 'Check out',
  'booking.adults': 'Adults',
  'booking.adult': 'adult',
  'booking.adultsPlural': 'adults',
  'booking.children': 'Children',
  'booking.child': 'child',
  'booking.childrenPlural': 'children',
  'booking.submit': 'Check Availability',
  'booking.submitting': 'Checking…',

  // Footer
  'footer.tagline': 'Life is better at the beach',
  'footer.about':
    "An eco-luxury beach sanctuary on Ghana's Atlantic coast where the rhythm of the ocean meets the warmth of Akan hospitality",
  'footer.explore': 'Explore',
  'footer.connect': 'Connect',
  'footer.newsletter': 'Stay in the feeling',
  'footer.newsletterBlurb': 'Seasonal letters from the shore · No spam only seasons',
  'footer.copyright': 'All rights reserved',
  'footer.privacy': 'Privacy',
  'footer.terms': 'Terms',
  'footer.admin': 'Admin',

  // Chat widget
  'chat.cta': 'Chat with Abena',
  'chat.title': 'Abena',
  'chat.subtitle': 'Digital concierge · usually replies instantly',
  'chat.greeting':
    "Akwaaba I'm Abena, your KoSa concierge · Ask me anything about the resort, our rooms, or planning your stay",
  'chat.placeholder': 'Ask anything…',
  'chat.send': 'Send',
  'chat.close': 'Close chat',
  'chat.suggested.rooms': 'What rooms are available?',
  'chat.suggested.directions': 'How do I get to KoSa from Accra?',
  'chat.suggested.spa': 'Tell me about the spa',
  'chat.suggested.included': "What's included in my stay?",

  // Contact form
  'contact.name': 'Name',
  'contact.email': 'Email',
  'contact.phone': 'Phone (optional)',
  'contact.subject': 'Subject (optional)',
  'contact.message': 'Message',
  'contact.send': 'Send Enquiry',
  'contact.sending': 'Sending…',
  'contact.thankTitle': 'Thank you',
  'contact.thankBody': "We'll be in touch within a day usually sooner",
  'contact.error.name': 'Please enter your name',
  'contact.error.email': 'Please enter a valid email',
  'contact.error.message': 'Please share a few more words',
  'contact.error.generic': 'Could not send',

  // Cultural section
  'cultural.eyebrow': 'Adinkra · Symbols of the Akan',
  'cultural.headline': 'Rooted in Ghana',
  'cultural.description': 'We carry these four symbols through the resort etched in wood, drawn in linen, traced in every welcome',
  'cultural.footer': 'Akwaaba you are welcome here',

  // Gallery section
  'gallery.eyebrow': 'Through the Lens',
  'gallery.headline': 'Gallery',
  'gallery.description': 'A slow scroll through the resort and the shoreline that holds it',
  'gallery.loadMore': 'Load More',

  // Virtual tour section
  'tour.eyebrow': '360° Virtual Tour',
  'tour.headline': 'Step Inside · Simply, Explore',
  'tour.description': 'Wander the suites, the spa, the shoreline from anywhere in the world',
  'tour.cta': 'Enter the Tour',
  'tour.footer': 'Powered by Google Drive · 6 Scenes',

  // Common
  'common.learnMore': 'Learn More',
  'common.discover': 'Discover',
  'common.bookNow': 'Book Now',
  'common.viewAll': 'View All',
  'common.languageEn': 'English',
  'common.languageFr': 'Français',
  'common.languageEs': 'Español',
  'common.languageNl': 'Nederlands',
  'common.languageDe': 'Deutsch',
  'common.toggleLanguage': 'Toggle language',
  'common.selectLanguage': 'Select language',

  // Experiences (dynamic cards on home)
  'experiences.wellness.label': 'Wellness',
  'experiences.wellness.title': 'Rituals of the Shore',
  'experiences.wellness.description': 'Slow mornings, salt-warmed massages, breath by the palms · A return to the body',
  'experiences.ocean.label': 'Ocean Activities',
  'experiences.ocean.title': 'Where the Atlantic Sings',
  'experiences.ocean.description': 'Sunrise paddleboard, fishing-village walks, snorkel reefs only locals know',
  'experiences.dining.label': 'Dining',
  'experiences.dining.title': 'A Coast on the Plate',
  'experiences.dining.description': 'Open-fire grouper, palm-wine glaze, garden herbs cut at dusk · Stories on every plate',
  'experiences.cultural.label': 'Cultural Rituals',
  'experiences.cultural.title': 'Rooted in Ghana',
  'experiences.cultural.description': 'Elmina Castle reflections, kente weaving, drum circles around the fire',

  // Rooms (dynamic cards)
  'rooms.beachfront-suite.name': 'Beachfront Suite',
  'rooms.beachfront-suite.tagline': 'Wake to the tide',
  'rooms.palm-garden-villa.name': 'Palm Garden Villa',
  'rooms.palm-garden-villa.tagline': 'Held by the canopy',
  'rooms.ocean-view-room.name': 'Ocean View Room',
  'rooms.ocean-view-room.tagline': 'Light, linen, the long horizon',
  'rooms.signature-villa.name': 'Signature Villa',
  'rooms.signature-villa.tagline': 'For when belonging needs its own gate',
  'rooms.beach-bungalow.name': 'Beach Bungalow',
  'rooms.beach-bungalow.tagline': 'Sand at the doorstep',
  'rooms.garden-room.name': 'Garden Room',
  'rooms.garden-room.tagline': 'Quiet, green, and unhurried',

  // Testimonials
  'testimonials.0.country': 'Accra, Ghana',
  'testimonials.0.quote': "I came for a weekend and left having found a part of myself I hadn't met · The light here is different",
  'testimonials.1.country': 'London, UK',
  'testimonials.1.quote': "The most quietly luxurious place I've stayed in West Africa · Everything is intentional, and nothing is loud",
  'testimonials.2.country': 'Paris, France',
  'testimonials.2.quote': 'A sanctuary in the truest sense · The staff make you feel like a returning friend, not a guest',
  'testimonials.3.country': 'Lagos, Nigeria',
  'testimonials.3.quote': 'KoSa is what every African coastline could be rooted, beautiful, dignified',

  // Spa treatments
  'treatments.atlantic-salt-scrub.name': 'Atlantic Salt Scrub',
  'treatments.palm-oil-deep-tissue.name': 'Palm Oil Deep Tissue',
  'treatments.shea-honey-wrap.name': 'Shea & Honey Wrap',
  'treatments.sound-bath.name': 'Sound Bath by the Sea',
  'treatments.kente-crystal.name': 'Kente Crystal Healing',
  'treatments.coastal-yoga.name': 'Coastal Yoga (Group)',

  // Adinkra guide
  'adinkra.knonsonkonson.meaning': 'Belong',
  'adinkra.knonsonkonson.line': 'A chain of links we hold one another',
  'adinkra.asetena.meaning': 'Good Life',
  'adinkra.asetena.line': 'A throne for ease, for slow days, for return',
  'adinkra.denkyem.meaning': 'Breathe',
  'adinkra.denkyem.line': 'The crocodile breathes air though it lives in water adapt, soften',
  'adinkra.community.meaning': 'Togetherness',
  'adinkra.community.line': 'A circle wider than the self',

  // ─── Content Brief 2026 ────────────────────────────────────────────────
  // Navigation (brief §02)
  'nav.stay': 'Stay',
  'nav.dine': 'Dine',
  'nav.explore': 'Explore',
  'nav.experience': 'Experience',
  'nav.plan': 'Plan Your Visit',
  'nav.events': 'Events & Gatherings',
  'nav.story': 'Our Story',

  // Hero (Change Request §Page 01)
  'home.hero.headline': 'Rest. Reconnect. Come back to yourself',
  'home.hero.subhead': "Ghana's coastal retreat for the soul - Ampenyi, Elmina",
  'home.hero.ctaPrimary': 'Book Your Stay',
  'home.hero.ctaSecondary': 'Explore KoSa',
  // Urgency nudge beneath the hero buttons (Change Request §Page 01)
  'home.hero.urgency': 'Rooms filling for July & August - book direct for the best rate',

  // Social proof bar - score + real guest quote (Change Request §Page 01)
  'home.social.copy':
    '5,000+ guests · 9.1/10 on Booking.com · “The most peaceful place I’ve been in years.” · Book direct - best rate guaranteed',

  // Feeling section (brief §01)
  'home.feeling.headline': 'This is what slowing down looks like',
  'home.feeling.body':
    'KoSa is a coastal retreat designed for connection with nature, with others, and with yourself · It’s a space where every sunrise and sea breeze invites you to be still · Where the food is fresh and the pace is gentle · Where the ocean is not just a view it’s the whole point',

  // Sample itineraries (brief §01)
  'home.itineraries.eyebrow': 'Sample Itineraries',
  'home.itineraries.weekend': 'Weekend Escape · 2 nights',
  'home.itineraries.short': 'Short Break · 4 nights',
  'home.itineraries.full': 'Full Reset · 7 nights',
  'home.itineraries.closing':
    "Every stay is yours to shape · Tell us what you need and we’ll take care of the rest",
  'home.itineraries.cta': 'Start Planning',
  'home.itineraries.weekend.title': 'A Weekend by the Sea',
  'home.itineraries.weekend.body':
    "Arrive Friday at golden hour · Welcome drink, slow dinner, a long sleep · Saturday: yoga at sunrise, herbal tea, swim, beach lunch, an afternoon massage, a fire-lit dinner under the stars · Sunday: a soft morning, brunch on the deck, and a transfer when you're ready",
  'home.itineraries.short.title': 'A Short Break that Resets You',
  'home.itineraries.short.body':
    "Four nights to truly arrive · Add a half-day in Elmina, a guided fishing-village walk, two spa treatments and a private dinner on the sand · By night three, even your shoulders have forgotten what tension feels like",
  'home.itineraries.full.title': 'A Week to Come Back to Yourself',
  'home.itineraries.full.body':
    "Seven nights of breath and Ghanaian sun · Coaching sessions, daily yoga, Cape Coast and Kakum excursions, market mornings, beach afternoons, and slow evenings · Leave lighter than you came",

  // Rooms teaser (brief §01)
  'home.roomsTeaser.headline': 'A room that belongs to the coast',
  'home.roomsTeaser.body':
    "Wake to birdsong and sea light · Our rooms are thoughtfully designed for rest simple, beautiful, and deeply comfortable · From garden retreats to ocean-facing suites, your space is waiting",
  'home.roomsTeaser.cta': 'See Our Rooms →',

  // Testimonials block (brief §01)
  'home.testimonials.example':
    'I arrived exhausted and left feeling like myself again · KoSa has a way of doing that',

  // Email capture (brief §01)
  'home.email.headline': 'Be the first to know',
  'home.email.body':
    'Early access to rates, new experiences, and quiet moments from the coast straight to your inbox · No noise · Unsubscribe any time',
  'home.email.placeholder': 'your@email.com',
  'home.email.cta': 'Subscribe',

  // Rooms page (brief §02 page 02)
  'roomsPage.headline': 'Your place by the sea',
  'roomsPage.intro':
    'Every room at KoSa was designed with one question in mind: what does it feel like to truly rest? Light that comes from the ocean · Air that carries the garden · Comfort that doesn’t announce itself it just surrounds you',
  'roomsPage.cardCta': 'Book Now',
  'roomsPage.trust':
    'Book direct for the best available rate · Flexible cancellation on all rooms · A welcome drink on arrival our way of saying we’re glad you came · Questions? We’re on WhatsApp',

  // Wellness page (brief §02 page 03)
  'wellnessPage.headline': 'Well-being, the KoSa way',
  'wellnessPage.hero.title': 'Well-being, the KoSa way',
  'wellnessPage.hero.sub': 'Nature restores discover balance in body and mind',
  'wellnessPage.approach.eyebrow': 'Our approach',
  'wellnessPage.approach.title': 'Wellness through nature',
  'wellnessPage.approach.body1': 'We built KoSa on a simple belief: well-being should be beautiful, natural, and within reach. Here, wellness isn’t a programme - it’s the rhythm of the place. It’s in the herbal tea waiting for you at arrival. The sea air that greets you at dawn. The quiet you didn’t realise you needed.',
  'wellnessPage.approach.body2': 'Wellness here isn’t something you do. It’s something you remember.',
  'wellnessPage.features.heading': 'Wellness features',
  'wellnessPage.feat.spa.title': 'Spa Services',
  'wellnessPage.feat.spa.body': 'Herbal treatments and massage therapies using natural local ingredients',
  'wellnessPage.feat.coaching.title': 'Wellness Coaching',
  'wellnessPage.feat.coaching.body': 'Personalised guidance for calm, clarity, and long-lasting well-being',
  'wellnessPage.feat.tea.title': 'Herbal Tea & Juice Bar',
  'wellnessPage.feat.tea.body': 'A curated selection of nourishing beverages for body and mind',
  'wellnessPage.feat.yoga.title': 'Yoga by the Sea',
  'wellnessPage.feat.yoga.body': 'Gentle movement sessions with ocean views and sea breeze',
  'wellnessPage.feat.mindful.title': 'Guided Mindfulness',
  'wellnessPage.feat.mindful.body': 'Meditation and breathing practices in serene natural settings',
  'wellnessPage.feat.nature.title': 'Nature Connection',
  'wellnessPage.feat.nature.body': 'Restorative walks and immersive experiences in a coastal environment',
  'wellnessPage.holistic.eyebrow': 'A holistic approach',
  'wellnessPage.holistic.title': 'Body, mind and spirit',
  'wellnessPage.holistic.body1': 'Our wellness programmes address the whole person body, mind, and spirit · Whether you seek deep relaxation, renewed energy, or inner peace, our experienced team will guide you on a personalised journey',
  'wellnessPage.holistic.body2': 'From sunrise yoga on the beach to sunset meditation, from nourishing herbal teas to therapeutic massages, every element works together to restore your natural balance',
  'wellnessPage.benefits.heading': 'The benefits of wellness at KoSa',
  'wellnessPage.benefit.stress.title': 'Stress Relief',
  'wellnessPage.benefit.stress.body': 'Release tension and anxiety through natural therapies and peaceful surroundings',
  'wellnessPage.benefit.renewal.title': 'Physical Renewal',
  'wellnessPage.benefit.renewal.body': 'Restore vitality and energy through movement, nutrition, and rest',
  'wellnessPage.benefit.clarity.title': 'Mental Clarity',
  'wellnessPage.benefit.clarity.body': 'Gain perspective and focus through mindfulness practices and coaching',
  'wellnessPage.benefit.lasting.title': 'Lasting Change',
  'wellnessPage.benefit.lasting.body': 'Develop sustainable wellness habits that extend beyond your stay',
  'wellnessPage.intro':
    "We built KoSa on a simple belief: well-being should be beautiful, natural, and within reach · Here, wellness isn’t a programme it’s the rhythm of the place · It’s in the herbal tea waiting for you at arrival · The sea air that greets you at dawn · The quiet you didn’t realise you needed",
  'wellnessPage.journeys.title': 'Wellness Journeys',
  'wellnessPage.journeys.body':
    'Guided experiences in rest, reflection, and renewal · Whether you come alone or with someone you love, we shape your time here around what your mind and body actually need',
  'wellnessPage.coaching.title': 'Wellness Coaching',
  'wellnessPage.coaching.body':
    'Personalised support for balance and mindfulness · Sit with one of our coaches, breathe, and begin to find your way back to yourself',
  'wellnessPage.spa.title': 'Spa Services',
  'wellnessPage.spa.body':
    'Massage, aromatherapy, and herbal treatments each one chosen for what it gives back to the body · Hands that know how to listen · Treatments rooted in the land',
  'wellnessPage.tea.title': 'KoSa Tea Bar',
  'wellnessPage.tea.body':
    'Herbal teas and fresh juices that nourish quietly · No rush · No noise · Just warmth in a cup and the sound of the ocean not too far away',
  'wellnessPage.cta.book': 'Book a Wellness Experience',
  'wellnessPage.cta.ask': 'Ask Us What You Need',

  // Dining page (brief §02 page 04)
  'diningPage.headline': 'Food the way the coast intended',
  'diningPage.popular': 'Popular',
  'diningPage.intro':
    'At KoSa, the kitchen is part of the wellness · We work with local fishermen and farmers people who know this land and these waters and we let the freshness do the talking · Ghanaian flavours, lovingly prepared · Nourishment that tastes like it was made for you',
  'diningPage.restaurant.title': 'The Restaurant',
  'diningPage.restaurant.body':
    'Where the day begins and the evening slows · Our restaurant serves fresh, seasonal food rooted in Ghanaian tradition with care for every guest at the table including halal options, vegetarian dishes, and meals that feel as good as they taste',
  'diningPage.restaurant.cta': 'Reserve a Table',
  'diningPage.bar.title': 'The Bar',
  'diningPage.bar.body':
    'Cocktails, mocktails, and fresh juices made with what the season gives us · Come as the sun goes down · Stay as long as the night allows',
  'diningPage.breakfast.title': 'Breakfast',
  'diningPage.breakfast.body':
    'The first meal of your day should feel like a gift · Colourful, fresh, and unhurried Ghanaian, continental, and full options available · Dietary needs accommodated just let us know',
  'diningPage.private.title': 'Private & Beach Dining',
  'diningPage.private.lead': 'A table just for you',
  'diningPage.private.body':
    'Celebrating something? Let us set a table on the beach - under the stars, with the ocean as your backdrop. Tell us the occasion and we’ll take care of everything else.',
  'diningPage.private.cta': 'Enquire About Private Dining',

  // Food gallery (dine page)
  'diningPage.gallery.eyebrow': 'Fresh from the kitchen',
  'diningPage.gallery.title': 'Food gallery',
  'diningPage.gallery.body': 'A closer look at what lands on the table · caught, grown and cooked along this coast',
  'diningPage.gallery.filter.dishes': 'Dishes',
  'diningPage.gallery.filter.breakfast': 'Breakfast',
  'diningPage.gallery.filter.drinks': 'Drinks',
  'diningPage.gallery.filter.moments': 'At the table',

  // Experiences page (brief §02 page 05)
  'experiencesPage.headline': 'Ghana begins here',
  'experiencesPage.intro':
    'KoSa sits at the edge of one of the most beautiful and historically rich coastlines in West Africa · We are your base, your guide, and your welcome home after every adventure · Whether you stay on the property or venture beyond it, we make sure every experience is one worth carrying home',
  'experiencesPage.property.title': 'On the Property',
  'experiencesPage.property.body':
    'The ocean is just there · So is the pool, the garden, the yoga mat, and the hammock with your name on it · On the days when you simply want to be, KoSa is more than enough',
  'experiencesPage.ghana.title': 'Into Ghana',
  'experiencesPage.ghana.body':
    "When you’re ready to explore, we’re ready to take you · Cape Coast Castle · Elmina · Kakum · The fishing villages · The markets · The histories that deserve to be known · We connect you with guides who know these places deeply not as tourists, but as people who belong here",
  'experiencesPage.cta': 'Plan Your Experiences',

  // Events page (brief §02 page 06)
  'eventsPage.headline': 'Always something to do',
  'eventsPage.enquire': 'Book This',
  'eventsPage.transport': 'Transport included',
  'eventsPage.empty': 'Nothing in this category yet - check back soon.',

  'eventsPage.intro':
    'From cooking classes and drumming circles to castle tours, bead making and beach-side naming ceremonies, there is always something to do at KoSa. Pick what calls to you, or let us build the perfect day around you.',
  'eventsPage.weddings.title': 'Weddings & Celebrations',
  'eventsPage.weddings.body':
    'A wedding at KoSa is the beach ceremony you always pictured the sound of waves, the warmth of the coast, the people you love most gathered in one beautiful place · We handle every detail with care · You just show up and celebrate',
  'eventsPage.weddings.cta': 'Start Planning Your Wedding',
  'eventsPage.retreats.title': 'Wellness Retreats',
  'eventsPage.retreats.body':
    'KoSa was built for restoration · Group wellness retreats yoga intensives, mindfulness weekends, or custom healing programmes find a natural home here · We bring the space, the stillness, and the support · You bring the intention',
  'eventsPage.corporate.title': 'Corporate Retreats & Offsite Meetings',
  'eventsPage.corporate.body':
    "The best ideas don’t come from conference rooms · Bring your team to the coast, step away from the ordinary, and watch what happens when people can finally think · KoSa offers meeting space, group accommodation, and team experiences designed to reconnect the people behind the work",
  'eventsPage.corporate.cta': 'Enquire About Group Bookings',
  'eventsPage.form.name': 'Name',
  'eventsPage.form.company': 'Company',
  'eventsPage.form.type': 'Event type',
  'eventsPage.form.dates': 'Dates',
  'eventsPage.form.guests': 'Guest count',
  'eventsPage.form.message': 'Message',
  'eventsPage.form.response': 'We respond within 24 hours',

  // Plan Your Stay (brief §02 page 07)
  'planPage.headline': 'Everything you need to arrive ready',
  'planPage.intro':
    'We want your KoSa experience to begin before you get here · Below you’ll find everything to help you plan sample itineraries, directions, FAQs, and the practical information that actually makes a difference',
  'planPage.experiences.eyebrow': 'What to do here',
  'planPage.experiences.body':
    'Real experiences at KoSa, from the shore to the surrounding coast pick what calls to you',
  'planPage.experiences.cta': 'See all experiences',
  'planPage.itineraries.eyebrow': 'Sample Itineraries',
  'planPage.itineraries.body':
    'Three pre-built stays in a day-by-day format not schedules, but stories · Each one ends with: this is one version of your KoSa stay · Yours will be your own shape it with us on arrival, or tell us what you need before you come',
  'planPage.itineraries.cta1': 'Book This Stay',
  'planPage.itineraries.cta2': 'Customise Your Plan',
  'planPage.getting.title': 'Getting Here',
  'planPage.getting.body':
    "KoSa Beach Resort is located on Ghana’s Central Region coast, about 25 km from Elmina and 30 km from Cape Coast Castle · From Accra’s Kotoka International Airport, the drive takes approximately 3 hours and we can arrange your transfer so that your rest begins the moment you land",
  'planPage.getting.cta': 'Book an Airport Transfer',
  'planPage.faqs.title': 'Frequently Asked Questions',
  'planPage.faq.checkin.q': 'What time is check-in and check-out?',
  'planPage.faq.checkin.a':
    'Check-in is from 2pm. Check-out is by 11am. We have a 24-hour front desk - if you’re arriving late, just let us know and we’ll make sure someone is ready for you.',
  'planPage.faq.cancellation.q': 'What is your cancellation policy?',
  'planPage.faq.cancellation.a':
    'Free cancellation up to 72 hours (3 days) before arrival. Cancellations within 3 days receive a 50% refund of the deposit. Cancellations within 24 hours or no-shows forfeit 50% of the deposit. A 30% deposit is required to confirm all bookings - the deposit invoice is valid for 2 days. The remaining balance is due on arrival.',
  'planPage.faq.airport.q': 'Do you offer airport transfers?',
  'planPage.faq.airport.a':
    'Yes. We arrange door-to-door transfers from Kotoka International Airport. WhatsApp us your flight details before you travel and we handle the rest.',
  'planPage.faq.halal.q': 'Are halal meals available?',
  'planPage.faq.halal.a':
    'Yes. Our kitchen accommodates halal, vegetarian, and other dietary requirements. Just let us know at the time of booking.',
  'planPage.faq.children.q': 'Can I bring children?',
  'planPage.faq.children.a':
    'Children are warmly welcome at KoSa. We have family rooms and can arrange cots and child-friendly meals on request.',
  'planPage.faq.payment.q': 'What payment methods do you accept?',
  'planPage.faq.payment.a':
    'We accept Visa, Mastercard, and mobile money (MTN MoMo, Vodafone Cash). All transactions are processed in GHS.',
  'planPage.faq.swim.q': 'Is the beach swimmable?',
  'planPage.faq.swim.a':
    'The beach at Ampenyi is best enjoyed at low tide. We share a daily tide schedule on arrival and will always point you to the best access spots.',
  'planPage.faq.wellness.q': 'Can I book wellness treatments in advance?',
  'planPage.faq.wellness.a':
    'Yes - and we recommend it. WhatsApp us before you arrive and we’ll reserve your treatments so you’re not waiting on the day.',

  // Our Story (brief §02 page 08)
  'aboutPage.headline': 'Two decades by the sea And still, every guest feels like the first',
  'aboutPage.opening':
    'KoSa Beach Resort was not built from a business plan. It was built from a belief - that the Ghanaian coast is one of the most restorative places on earth, and that everyone who comes here should be able to feel that. For over twenty years, we have held that belief.',
  'aboutPage.enrichedSetting':
    'It shows in the fishermen we partner with, the farmers who supply our kitchen, the artisans whose hands shaped what you see around you.',
  'aboutPage.enrichedEco':
    "We never set out to build a luxury resort. We set out to build a place where people could feel the coast the way it actually is - unhurried, generous, alive.",
  'aboutPage.continued':
    'We are part of the Akwaaba Stays Hospitality Group - a family of properties across Ghana and West Africa that share a commitment to hospitality rooted in care, community, and the places we call home. KoSa is where that commitment lives closest to the water.',
  'aboutPage.values': 'Our Values',
  'aboutPage.values.authenticity.title': 'Authenticity',
  'aboutPage.values.authenticity.body':
    'Honest hospitality that reflects the real rhythm of this coast · No performance · No pretence · Just KoSa as it is and as it always has been',
  'aboutPage.values.community.title': 'Community',
  'aboutPage.values.community.body':
    'We are in partnership with the people around us local fishermen, farmers, and artisans whose work and knowledge make KoSa what it is · When you stay here, their livelihoods grow too',
  'aboutPage.values.wellness.title': 'Wellness',
  'aboutPage.values.wellness.body':
    'Nourishing body and mind through healthy food, coaching, and calm · We believe well-being should be beautiful, natural, and within reach not a luxury reserved for a few',
  'aboutPage.values.sustainability.title': 'Sustainability',
  'aboutPage.values.sustainability.body':
    'Respect for the shoreline, the land, and the lives it sustains · We are stewards of this place responsible to it and to the generations who will come after us',
  'aboutPage.values.legacy.title': 'Legacy',
  'aboutPage.values.legacy.body':
    'Two decades of genuine connection and continuous care by the sea · The ocean keeps us humble · The guests who return keep us going',
  'aboutPage.closing.headline': 'Come and see for yourself',
  'aboutPage.closing.body':
    'We could tell you more but KoSa is best experienced in person · The sea air, the food, the people, the quiet · There is something here that does not translate into words · But it is waiting for you',
  'aboutPage.closing.ctaBook': 'Book Your Stay',
  'aboutPage.closing.ctaGet': 'Get in Touch',

  // Exit-intent popup
  'exit.headline': 'Get KoSa rates before they fill up',
  'exit.body': "Early access to seasonal rates, quiet weeks, and new experiences · Once a month, no more",
  'exit.cta': 'Send Me Updates',
  'exit.placeholder': 'your@email.com',
  'exit.dismiss': 'No thanks',
  'exit.thanks': 'Thank you · Watch your inbox',

  // Common CTAs
  'common.bookYourStay': 'Book Your Stay',
  'common.exploreKosa': 'Explore KoSa',
  'common.whatsapp': 'WhatsApp',
  'common.getInTouch': 'Get in Touch',
  'common.startPlanning': 'Start Planning',
  'common.readMore': 'Read More',

  // Footer (additions per brief)
  'footer.quickLinks': 'Quick Links',
  'footer.reviews': 'Loved by guests on',
  'footer.address': 'Beach Road No.1, Ampenyi, Elmina, Ghana',
  'footer.group': 'A property of Akwaaba Stays Hospitality Group',

  // ─── Full-coverage UI strings (2026 i18n sweep) ────────────────────────
  // Newsletter form
  'newsletter.placeholder': 'you@somewhere.com',
  'newsletter.success': 'Welcome ashore',
  'newsletter.error': 'Something went wrong',
  'newsletter.failed': 'Subscription failed',
  'newsletter.ariaEmail': 'Email address',
  'newsletter.ariaSubscribe': 'Subscribe',

  // Home extras
  'home.hero.location': 'Elmina · Ghana',
  'home.itineraries.heading': 'A few ways to spend your time',

  // Rooms page
  'roomsPage.searchPlaceholder': 'Search rooms, beds, sea view…',
  'roomsPage.resultsOne': '1 room type',
  'roomsPage.resultsMany': '{n} room types',
  'roomsPage.searchEmpty': 'No rooms match your search yet - try another word or filter',
  'roomsPage.occupied': 'Booked',
  'roomsPage.upTo': 'Up to',
  'roomsPage.guestsUnit': 'guests',

  // Room detail
  'roomDetail.amenities': 'Amenities',
  'roomDetail.from': 'From',
  'roomDetail.taxesIncluded': 'Taxes & breakfast included',
  'roomDetail.reserve': 'Reserve',
  'roomDetail.askConcierge': 'Ask the concierge',
  'roomDetail.freeCancellation': 'Free cancellation up to 48 hours before arrival',
  'roomDetail.otherRooms': 'Other rooms you might love',
  'roomDetail.descFallback':
    'A composed retreat soft linen, woven palm, hand-thrown ceramics · A room that breathes with the tide',
  'roomDetail.amenity.balcony': 'Beachfront balcony',
  'roomDetail.amenity.bed': 'King-size bed with linen sheets',
  'roomDetail.amenity.shower': 'Open-air rain shower',
  'roomDetail.amenity.local': 'Locally sourced amenities',
  'roomDetail.amenity.wifi': 'High-speed WiFi',
  'roomDetail.amenity.ac': 'Air conditioning + ceiling fan',
  'roomDetail.amenity.breakfast': 'Daily breakfast included',
  'roomDetail.amenity.welcome': 'Welcome rituals',

  // Wellness page
  'wellnessPage.heroSub': 'Open to day guests and resort guests alike',
  'wellnessPage.enquiry.eyebrow': 'Enquire',
  'wellnessPage.enquiry.title': 'No stay required',
  'wellnessPage.enquiry.body': 'Tell us what you’re drawn to and we’ll arrange it whether you’re staying with us or visiting for the day',
  'wellnessPage.enquiry.point1': 'Day guests welcome walk in for a treatment or session',
  'wellnessPage.enquiry.point2': 'We’ll confirm timing by email or WhatsApp',
  'wellnessPage.enquiry.point3': 'Couples and small groups can be arranged',
  'wellnessForm.interest': 'What you’re interested in',
  'wellnessForm.choose': 'Choose a programme',
  'wellnessForm.notSure': 'Not sure yet - please advise',
  'wellnessForm.guestType': 'Are you staying with us?',
  'wellnessForm.day': 'Day guest (not staying)',
  'wellnessForm.staying': 'Staying at KoSa',
  'wellnessForm.date': 'Preferred date',
  'wellnessForm.guests': 'Number of guests',
  'wellnessForm.message': 'Anything else?',
  'wellnessForm.submit': 'Send enquiry',
  'wellnessForm.whatsapp': 'Send via WhatsApp',
  'wellnessForm.thankTitle': 'Thank you',
  'wellnessForm.thankBody': 'We’ve received your enquiry and will be in touch shortly',
  'wellnessForm.waIntro': 'Hi KoSa! I’d like to enquire about wellness:',
  'wellnessPage.treatmentsHeading': 'Treatments & sessions',
  'wellnessPage.treatmentsIntro': 'Browse by what you need - massage and bodywork at the KoSa Health Spa, or the deeper rituals and retreats of O2 Wellness.',
  "quote.ocean": "The ocean doesn't rush. Neither should you",
  "quote.stop": "This is what it feels like to finally stop",
  'home.welcome.eyebrow': 'Akwaba · Welcome home',
  'home.welcome.heading': 'Some places you visit KoSa, you come home to',
  'home.welcome.body': 'Watch a KoSa welcome unfold: drums on the sand, white cloth in the breeze, a naming ceremony by the ocean. This is what arriving feels like.',
  'home.welcome.cta': 'Play the film',
  'home.welcome.play': 'Play the Welcome Home film',
  "wellnessPage.hero.line": "Here is your permission to pause, Restore your energy, and just be",
  "wellnessPage.offerings.eyebrow": "KoSa Wellness",
  "wellnessPage.yoga.title": "Yoga by the Sea",
  "wellnessPage.yoga.body": "Gentle movement on the sand, breath and ocean keeping time together. Come as you are; every level is welcome.",
  "wellnessPage.journeys.sense": "Nothing is scheduled that you didn't choose. The day bends to you, not the other way around.",
  "wellnessPage.coaching.sense": "You meet with your coach the morning after you arrive. Just to talk.",
  "wellnessPage.spa.sense": "The treatment rooms open to the garden. You'll hear birdsong.",
  "wellnessPage.tea.sense": "We brew with herbs from the property. Some guests ask for the recipe.",
  "wellnessPage.yoga.sense": "Sessions run at 7 am when the light is still soft and the beach is quiet.",
  "wellnessPage.day.eyebrow": "A day here",
  "wellnessPage.day.heading": "What a wellness day at KoSa looks like",
  "wellnessPage.day.intro": "No schedule to keep. Just a gentle rhythm you can follow as much or as little as you like.",
  "wellnessPage.day.s1.time": "At sunrise",
  "wellnessPage.day.s1.text": "Morning tea on the deck as the light comes up. No rush, nothing to be yet.",
  "wellnessPage.day.s2.time": "Early morning",
  "wellnessPage.day.s2.text": "A slow walk along the beach while the sand is still cool and the shore is quiet.",
  "wellnessPage.day.s3.time": "7 am",
  "wellnessPage.day.s3.text": "Yoga by the sea, breath and waves keeping time together.",
  "wellnessPage.day.s4.time": "Late morning",
  "wellnessPage.day.s4.text": "A spa treatment with the garden doors open and birdsong drifting in.",
  "wellnessPage.day.s5.time": "Midday",
  "wellnessPage.day.s5.text": "Lunch on the deck, fresh from the kitchen, eaten slowly in the shade.",
  "wellnessPage.day.s6.time": "Afternoon",
  "wellnessPage.day.s6.text": "A coaching session, or simply a hammock and a book. Whichever you need.",
  "wellnessPage.day.s7.time": "Evening",
  "wellnessPage.day.s7.text": "Dinner around the bonfire as the stars come out over the water.",
  "wellnessPage.closing.eyebrow": "Wellness, your way",
  "wellnessPage.closing.headline": "Tell us what you need. We'll take care of the rest",
  "wellnessPage.closing.body": "No fixed programmes, no pressure. Tell us how you want to feel and we will shape your time here around it.",
  "wellnessPage.closing.cta": "Chat with us on WhatsApp",
  'wellnessPage.beginHeadline': 'Begin your way back',

  // Experiences page
  'experiencesPage.buildDay':
    'Not sure where to start? Tell us how many days you have and what draws you - we’ll put together a plan that’s entirely yours.',

  // Contact page
  'contactPage.eyebrow': 'Get in Touch',
  'contactPage.title': 'Speak with us, simply',
  'contactPage.whereToFind': 'Where to find us',
  'contactPage.whatsappUs': 'WhatsApp us',
  'contactPage.mapTitle': 'KoSa location map',

  // Book page
  'bookPage.eyebrow': 'Reserve Your Return',
  'bookPage.title': 'Book Your Stay',
  'bookPage.subtitle': 'Best rate, free cancellation up to 48 hours, instant confirmation',

  // Booking flow
  'book.step.dates': 'Dates',
  'book.step.room': 'Room',
  'book.step.guest': 'Guest',
  'book.step.confirm': 'Confirm',
  'book.datesHeading': 'When would you like to stay?',
  'book.checkIn': 'Check in',
  'book.checkOut': 'Check out',
  'book.adults': 'Adults',
  'book.children': 'Children',
  'book.continue': 'Continue',
  'book.editDates': 'Edit dates',
  'book.guestHeading': 'Your details',
  'book.firstName': 'First name',
  'book.lastName': 'Last name',
  'book.email': 'Email',
  'book.phone': 'Phone',
  'book.country': 'Country',
  'book.notes': 'Notes (optional)',
  'book.confirmReservation': 'Confirm Reservation',
  'book.guests': 'Guests',
  'book.adultsUnit': 'adults',
  'book.childrenUnit': 'children',
  'book.nights': 'Nights',
  'book.nightsUnit': 'nights',
  'book.total': 'Total',
  'book.taxesLine': 'Taxes and breakfast included · Free cancellation up to 48 hours',
  'book.doneHeading': 'Akwaaba we have your booking',
  'book.confirmationLabel': 'Confirmation:',
  'book.doneBody':
    'A confirmation has been sent to your email · Our concierge will be in touch within a day with arrival details and a welcome ritual',
  'book.returnHome': 'Return Home',
  'book.whatsappUs': 'WhatsApp Us',
  'book.errRequired': 'Required',
  'book.errEmail': 'Valid email required',
  'book.failed': 'Booking failed',

  // Events enquiry form
  'eventsPage.form.optWedding': 'Wedding',
  'eventsPage.form.optRetreat': 'Wellness retreat',
  'eventsPage.form.optCorporate': 'Corporate offsite',
  'eventsPage.form.optOther': 'Other celebration',
  'eventsPage.form.thankYou': 'Thank you',
  'eventsPage.form.error': 'Please enter your name and a valid email',
  'eventsPage.form.sendError': 'Could not send your enquiry',
  'eventsPage.form.sending': 'Sending…',

  // Email capture / exit popup validation
  'emailCapture.invalid': 'Please enter a valid email',
  'emailCapture.error': 'Could not subscribe',

  // Virtual tour viewer
  'tour.viewRooms': 'View Rooms',
  'tour.fullscreen': 'Fullscreen',
  'tour.loading': 'Loading',
  'tour.loadingTour': 'Loading tour…',
  'tour.noWebgl': "Your device doesn't support 360° viewing enjoy a still-image gallery instead",

  // Common
  'common.email': 'Email',
  'common.returnHome': 'Return Home',
  'error.headline': 'A small wave knocked us over',
  'error.body': 'Please try again we’re re-balancing',
  'error.retry': 'Try Again',
  'notFound.headline': 'Lost at sea',
  'notFound.body': 'The page you’re looking for has drifted · Let’s walk you home',
  'notFound.concierge': 'Speak to concierge',
  'experiencesPage.detailFallback': 'Sessions are intimate six guests at most · Times shift gently with the tide and the sun · Speak with our concierge for private bookings, custom rituals, and seasonal offerings',
  'experiencesPage.addToStay': 'Add to Your Stay',
  'common.speakConcierge': 'Speak with Concierge',
  'blogPage.eyebrow': 'Letters from the Shore',
  'blogPage.comingSoon': 'Letters from the shore coming soon',
  'blogPage.subtitle': 'Stories, guides and quiet notes from our corner of the coast',
  'blogPage.featured': 'Featured',
  'blogPage.readStory': 'Read the story',
  'blogPage.readMins': 'min read',
  'blogPage.moreStories': 'More from the journal',
  'blogPage.backToJournal': 'Back to the journal',
  'blogPage.cta.headline': 'Come and feel it for yourself',
  'blogPage.cta.body': 'The shore is waiting whenever you are ready',
  'eventsPage.form.datesPlaceholder': 'e.g. 12–15 Aug 2026',
  'eventsPage.form.guestsPlaceholder': 'e.g. 40',
  'a11y.close': 'Close',
  'a11y.previous': 'Previous',
  'a11y.next': 'Next',
  'a11y.openMenu': 'Open menu',
  'a11y.closeMenu': 'Close menu',
  'a11y.scrollNext': 'Scroll to next section',
  'a11y.resortChat': 'Resort chat',
  'gallery.empty': 'No gallery images yet',
  'chat.errorEmpty': "Akwaaba I'm here, but my concierge brain went quiet for a moment · Try again, or WhatsApp +233 24 437 5432",
  'chat.errorTimeout': 'That took longer than expected please try again, or WhatsApp +233 24 437 5432',
  'chat.errorGeneric': "I'm having trouble reaching the resort knowledge right now · Please WhatsApp us at +233 24 437 5432 and we'll respond shortly",
  'alt.heroShoreline': 'Aerial view of the KoSa shoreline, Elmina, Ghana',
  'alt.feelingHammock': 'A quiet hammock between palms at KoSa',
  'alt.aboutSea': 'KoSa Beach Resort by the sea',
  'diningPage.bar.name': 'Kooki Beach Bar',
  'diningPage.bar.hours': 'Cocktails served until 10 pm',
  'diningPage.restaurant.hours': 'Breakfast, lunch & dinner · 7 am to 9 pm, every day',
  'experiencesPage.signature.eyebrow': 'Signature experiences',
  'experiencesPage.signature.headline': 'A handful of things to do, with people who know',
  'experiencesPage.signature.ampenyi.title': 'Ampenyi village walk',
  'experiencesPage.signature.ampenyi.body': 'A guided walk through Ampenyi meet the fishermen, learn how the catch comes in, and (when he is in) pay your respects to the chief',
  'experiencesPage.signature.capeCoast.title': 'Cape Coast Castle',
  'experiencesPage.signature.capeCoast.body': 'A short drive east · A weight worth carrying bring water, leave time to be quiet afterwards',
  'experiencesPage.signature.elmina.title': 'Elmina Castle',
  'experiencesPage.signature.elmina.body': 'Twenty minutes from KoSa. One of West Africa\'s oldest European-built structures, walked slowly',
  'experiencesPage.signature.kakum.title': 'Kakum National Park',
  'experiencesPage.signature.kakum.body': 'Rainforest, canopy walkways, butterflies you will only meet here · An early start, back in time for dinner',
  'experiencesPage.signature.massage.title': 'Thai massage by the sea',
  'experiencesPage.signature.massage.body': 'Choose where: on the beach with the waves, in the garden under the palms, or in the privacy of your room',
  'experiencesPage.signature.horse.title': 'Horse riding & jewellery making',
  'experiencesPage.signature.horse.body': 'Beach riding at golden hour, hands-on jewellery sessions with local artisans small things that turn a stay into a memory',

  // ─── Website Change Request (June 2026) ────────────────────────────────────
  // Sitewide
  'nav.bookMicro': 'Book direct · Best rate guaranteed',

  // Home - itinerary packages + room teaser pricing
  'home.itineraries.bookNow': 'Book Now',
  'common.perNight': 'per night',

  // Rooms - booking confidence strip (Change Request §Page 02)
  'roomsPage.confidence.rate': 'Best rate when you book direct',
  'roomsPage.confidence.cancel': 'Free cancellation up to 72 hours before arrival',
  'roomsPage.confidence.welcome': 'Welcome drink on arrival',
  'roomsPage.confidence.desk': '24-hour front desk',

  // Wellness - bookable treatments (Change Request §Page 03)
  'wellnessPage.treatment.book': 'Book This Treatment',

  // Dining - reserve a table + breakfast hours (Change Request §Page 04)
  'diningPage.reserveCta': 'Reserve a Table',
  'diningPage.breakfast.hours': 'Breakfast served 7–10 am, every day',

  // Experiences - bookable tiles + planning CTA (Change Request §Page 05)
  'experiencesPage.tile.book': 'Book This Experience',
  'experiencesPage.perPerson': 'per person',
  'experiencesPage.buildDay.cta': 'Start the conversation',

  // Plan Your Stay - itineraries above the FAQ (Change Request §Page 07)
  'planPage.itineraries.heading': 'Your Stay, Your Way',
  'planPage.itineraries.eachClose': 'This is one version of your KoSa stay. Yours will be your own.',
  'planPage.itineraries.bookThis': 'Book This Stay',


  // Experiences - free daily activities schedule
  'experiencesPage.daily.eyebrow': 'Every day, included',
  'experiencesPage.daily.heading': 'Free Daily Activities',
  'experiencesPage.daily.intro':
    'Every day at KoSa comes with a rhythm. All activities are free for resort guests, and there is always something to join, or to happily skip.',
  'experiencesPage.daily.free': 'Free',
  'experiencesPage.daily.footnote':
    'All activities are free for resort guests. Sign up at reception. Schedule may vary.',

  // Wellness - curated packages
  'planPage.packages.eyebrow': 'Curated Stays',
  'planPage.packages.heading': 'Stay Packages',
  'planPage.packages.intro':
    'Everything arranged. You just arrive. Each package includes daily breakfast, a complimentary 10-minute welcome massage on arrival, and full beach access.',
  'planPage.packages.enquireRates': 'Enquire for current rates',
  'planPage.packages.enquire': 'Enquire',

  // Wellness - enhance your stay (add-ons)
  'wellnessPage.enhance.eyebrow': 'Add-ons',
  'wellnessPage.enhance.heading': 'Enhance Your Stay',
  'wellnessPage.enhance.intro':
    'Add something special to any package or room booking. Arrange it at reception, by phone, or when you reserve.',
  'wellnessPage.enhance.cta': 'Enquire About Add-ons',
  'wellnessPage.enhance.enquire': 'Enquire',
} as const;

// ─── FRENCH ──────────────────────────────────────────────────────────────────
// Revised to avoid stiff literal translations. Key changes:
//   • "Simplement, Appartenez." → "Ici, vous êtes chez vous." (belong = feel at home)
//   • "les 5 couches de soi" → "les 5 dimensions de l'être" (layers of self sounds clinical)
//   • "la station" → "le domaine" (station = train station in everyday French)
//   • "Hôtes fidèles" → "Ils reviennent" (more evocative than "loyal guests")
//   • "Nous joindre" → "Nous suivre" (connect on footer = follow us, not contact)
//   • "Restez dans l'instant" → "Gardez le cap sur l'essentiel" (stay in the feeling)
//   • error messages softened to match the brand's warm tone
// ─────────────────────────────────────────────────────────────────────────────
const en = { ...enBase, ...enRedesign };

const frBase: Partial<Record<keyof typeof en, string>> = {
  'nav.rooms': 'Chambres',
  'nav.experiences': 'Expériences',
  'nav.dining': 'Table',
  'nav.wellness': 'Bien-être',
  'nav.gallery': 'Galerie',
  'nav.virtualTour': 'Visite virtuelle',
  'nav.about': 'Le domaine',
  'nav.blog': 'Carnet',
  'nav.contact': 'Contact',
  'nav.book': 'Réserver',
  'nav.bookYourStay': 'Réservez votre séjour',

  'hero.location': 'Elmina · Ghana · Afrique de l\u2019Ouest',
  'hero.headline': 'La vie est plus belle à la plage',
  'hero.tagline': 'Respirer · Rivage · Appartenir',
  'hero.bookCta': 'Réservez votre parenthèse',
  'hero.exploreCta': 'Découvrir le domaine',
  'hero.scrollAria': 'Passer à la section suivante',

  'intro.eyebrow': 'Bienvenue · Akwaaba',
  'intro.headline.l1': 'KoSa n\u2019est pas un hôtel',
  'intro.headline.l2': 'C\u2019est un endroit où l\u2019on revient toujours',
  'intro.body':
    'Sur un ruban de côte atlantique à Elmina, où les palmiers fléchissent sous le vent et l\u2019océan impose son propre rythme, nous avons façonné un lieu pour se poser. Éco-luxe dans l\u2019âme, ancré dans l\u2019artisanat ghanéen, nourri par les gestes de ceux qui en prennent soin',
  'intro.script': 'Simplement, Respirez',
  'intro.philosophyCta': 'Notre philosophie les 5 dimensions de l\u2019être',

  'rooms.eyebrow': 'Séjournez avec nous',
  'rooms.headline': 'Boutique face à l\u2019Atlantique',
  'rooms.statRooms': 'Types de chambres',
  'rooms.statSuites': 'Garden View',
  'rooms.statBeach': 'Plage',
  'rooms.filter.all': 'Tout',
  'rooms.filter.beachView': 'Vue sur mer',
  'rooms.filter.palmSide': 'Côté palmeraie',
  'rooms.filter.suite': 'Garden View',
  'rooms.priceFrom': 'À partir de',
  'rooms.perNight': 'nuit',
  'rooms.view': 'Voir',

  'experiences.eyebrow': 'Vivre pleinement',
  'experiences.headline': 'Quatre façons de s\u2019enraciner',
  'experiences.blurb':
    'Du yoga à l\u2019aube sur la falaise aux cercles de tambours autour du feu, chaque journée à KoSa est tissée de petits retours à soi',
  'experiences.discover': 'Découvrir',

  'wellness.bgWord': 'Simplement, Respirez',
  'wellness.eyebrow': 'Respirer',
  'wellness.headline.l1': 'Spa, yoga, sons',
  'wellness.headline.l2': 'les cinq dimensions de l\u2019être',
  'wellness.blurb':
    'Des soins issus des ressources ouest-africaines karité, palme, sel marin dispensés en cabanes ouvertes où seul le ressac se fait entendre',
  'wellness.bookCta': 'Réserver un soin',

  'testimonials.via': 'via',

  'testimonials.eyebrow': 'Ils reviennent',
  'testimonials.headline': 'Ce qu\u2019ils disent du rivage',

  'booking.eyebrow': 'Préparez votre retour',
  'booking.headline.l1': 'Le rivage vous attend',
  'booking.headline.l2': 'Et vous ?',
  'booking.blurb':
    'Disponibilités en temps réel, meilleur tarif garanti, accueil chaleureux dès l\u2019entrée. Réservez en moins de deux minutes',
  'booking.badgeSecure': 'Paiement sécurisé',
  'booking.badgeBestRate': 'Meilleur tarif garanti',
  'booking.badgeCancel': 'Annulation offerte',
  'booking.formTitle': 'Vérifier les disponibilités',
  'booking.checkIn': 'Arrivée',
  'booking.checkOut': 'Départ',
  'booking.adults': 'Adultes',
  'booking.adult': 'adulte',
  'booking.adultsPlural': 'adultes',
  'booking.children': 'Enfants',
  'booking.child': 'enfant',
  'booking.childrenPlural': 'enfants',
  'booking.submit': 'Vérifier les disponibilités',
  'booking.submitting': 'Vérification…',

  'footer.tagline': 'La vie est plus belle à la plage',
  'footer.about':
    'Un refuge éco-luxueux sur la côte atlantique du Ghana, où le souffle de l\u2019océan épouse la chaleur de l\u2019hospitalité akan',
  'footer.explore': 'Explorer',
  'footer.connect': 'Nous suivre',
  'footer.newsletter': 'Gardez le cap sur l\u2019essentiel',
  'footer.newsletterBlurb': 'Lettres du rivage, au fil des saisons · Rien que l\u2019essentiel',
  'footer.copyright': 'Tous droits réservés',
  'footer.privacy': 'Confidentialité',
  'footer.terms': 'Conditions',
  'footer.admin': 'Admin',

  'chat.cta': 'Échangez avec Abena',
  'chat.title': 'Abena',
  'chat.subtitle': 'Concierge numérique · répond en quelques instants',
  'chat.greeting':
    'Akwaaba je suis Abena, votre concierge KoSa. Posez-moi toutes vos questions sur le domaine, nos chambres ou l\u2019organisation de votre séjour',
  'chat.placeholder': 'Une question ? Je vous écoute…',
  'chat.send': 'Envoyer',
  'chat.close': 'Fermer',
  'chat.suggested.rooms': 'Quelles chambres sont disponibles ?',
  'chat.suggested.directions': 'Comment rejoindre KoSa depuis Accra ?',
  'chat.suggested.spa': 'Parlez-moi du spa',
  'chat.suggested.included': 'Que comprend mon séjour ?',

  'contact.name': 'Nom',
  'contact.email': 'Adresse e-mail',
  'contact.phone': 'Téléphone (facultatif)',
  'contact.subject': 'Objet (facultatif)',
  'contact.message': 'Message',
  'contact.send': 'Envoyer ma demande',
  'contact.sending': 'Envoi en cours…',
  'contact.thankTitle': 'Merci',
  'contact.thankBody': 'Nous vous répondrons dans la journée souvent bien avant',
  'contact.error.name': 'Merci d\u2019indiquer votre nom',
  'contact.error.email': 'Merci d\u2019indiquer une adresse e-mail valide',
  'contact.error.message': 'Quelques mots de plus nous aideraient',
  'contact.error.generic': 'L\u2019envoi a échoué, veuillez réessayer',

  'cultural.eyebrow': 'Adinkra · Symboles des Akan',
  'cultural.headline': 'Enraciné au Ghana',
  'cultural.description': 'Nous portons ces quatre symboles à travers le domaine gravés dans le bois, tissés dans le lin, présents dans chaque accueil',
  'cultural.footer': 'Akwaaba vous êtes ici les bienvenus',

  'gallery.eyebrow': 'Le domaine en images',
  'gallery.headline': 'Galerie',
  'gallery.description': 'Une promenade lente à travers le domaine et le rivage qui le berce',
  'gallery.loadMore': 'Voir plus',

  'tour.eyebrow': 'Visite virtuelle 360°',
  'tour.headline': 'Entrez · Laissez-vous porter',
  'tour.description': 'Parcourez les suites, le spa, le rivage depuis n\u2019importe où dans le monde',
  'tour.cta': 'Commencer la visite',
  'tour.footer': 'Propulsé par Google Drive · 6 scènes',

  'common.learnMore': 'En savoir plus',
  'common.discover': 'Découvrir',
  'common.bookNow': 'Réserver',
  'common.viewAll': 'Tout voir',
  'common.languageEn': 'English',
  'common.languageFr': 'Français',
  'common.languageEs': 'Español',
  'common.languageNl': 'Nederlands',
  'common.languageDe': 'Deutsch',
  'common.toggleLanguage': 'Changer de langue',
  'common.selectLanguage': 'Choisir la langue',

  'experiences.wellness.label': 'Bien-être',
  'experiences.wellness.title': 'Rituels du rivage',
  'experiences.wellness.description': 'Matinées lentes, massages chauffés au sel, respiration sous les palmiers · Un retour au corps',
  'experiences.ocean.label': 'Activités océan',
  'experiences.ocean.title': 'Là où l’Atlantique chante',
  'experiences.ocean.description': 'Paddle au lever du jour, balades dans les villages de pêcheurs, récifs connus des seuls habitants',
  'experiences.dining.label': 'Table',
  'experiences.dining.title': 'Une côte dans l’assiette',
  'experiences.dining.description': 'Mérou au feu de bois, glaçage au vin de palme, herbes cueillies au crépuscule · Des histoires à chaque assiette',
  'experiences.cultural.label': 'Rituels culturels',
  'experiences.cultural.title': 'Enraciné au Ghana',
  'experiences.cultural.description': 'Reflets du château d’Elmina, tissage du kente, cercles de tambours autour du feu',

  'rooms.beachfront-suite.name': 'Suite face à la plage',
  'rooms.beachfront-suite.tagline': 'Se réveiller avec la marée',
  'rooms.palm-garden-villa.name': 'Villa Jardin de palmiers',
  'rooms.palm-garden-villa.tagline': 'Bercée par la canopée',
  'rooms.ocean-view-room.name': 'Chambre vue océan',
  'rooms.ocean-view-room.tagline': 'Lumière, lin et l’horizon lointain',
  'rooms.signature-villa.name': 'Villa Signature',
  'rooms.signature-villa.tagline': 'Quand l’appartenance a sa propre porte',
  'rooms.beach-bungalow.name': 'Bungalow de plage',
  'rooms.beach-bungalow.tagline': 'Le sable au seuil',
  'rooms.garden-room.name': 'Chambre jardin',
  'rooms.garden-room.tagline': 'Calme, vert, sans hâte',

  'testimonials.0.country': 'Accra, Ghana',
  'testimonials.0.quote': 'Je suis venue pour un week-end et je suis repartie avec une part de moi que je n’avais pas encore rencontrée. La lumière ici est différente',
  'testimonials.1.country': 'Londres, Royaume-Uni',
  'testimonials.1.quote': 'Le lieu le plus discrètement luxueux où je sois allé en Afrique de l’Ouest · Tout est intentionnel, rien n’est tape-à-l’œil',
  'testimonials.2.country': 'Paris, France',
  'testimonials.2.quote': 'Un sanctuaire au sens le plus juste · L’équipe vous fait sentir comme un ami qui revient, pas comme un client',
  'testimonials.3.country': 'Lagos, Nigeria',
  'testimonials.3.quote': 'KoSa, c’est ce que pourrait être chaque littoral africain enraciné, beau, digne',

  'treatments.atlantic-salt-scrub.name': 'Gommage au sel atlantique',
  'treatments.palm-oil-deep-tissue.name': 'Massage profond à l’huile de palme',
  'treatments.shea-honey-wrap.name': 'Enveloppement karité & miel',
  'treatments.sound-bath.name': 'Bain sonore au bord de la mer',
  'treatments.kente-crystal.name': 'Soin cristaux Kente',
  'treatments.coastal-yoga.name': 'Yoga côtier (groupe)',

  'adinkra.knonsonkonson.meaning': 'Appartenir',
  'adinkra.knonsonkonson.line': 'Une chaîne de maillons nous nous tenons les uns les autres',
  'adinkra.asetena.meaning': 'Belle vie',
  'adinkra.asetena.line': 'Un trône pour la quiétude, les jours lents, le retour',
  'adinkra.denkyem.meaning': 'Respirer',
  'adinkra.denkyem.line': 'Le crocodile respire l’air bien qu’il vive dans l’eau s’adapter, s’adoucir',
  'adinkra.community.meaning': 'Ensemble',
  'adinkra.community.line': 'Un cercle plus large que soi',

  // ─── Content Brief 2026 ─────────────────────────────────────────────────
  'nav.stay': 'Séjour',
  'nav.dine': 'Table',
  'nav.explore': 'Explorer',
  'nav.experience': 'Vivre',
  'nav.plan': 'Préparez votre séjour',
  'nav.events': 'Événements & Réunions',
  'nav.story': 'Notre histoire',

  'home.hero.headline': 'Reconnexion · Ressourcement · Renouveau',
  'home.hero.subhead': 'La vie est plus belle à la plage',
  'home.hero.ctaPrimary': 'Réservez votre séjour',
  'home.hero.ctaSecondary': 'Découvrir KoSa',

  'home.social.copy':
    'Apprécié par 5 000+ voyageurs. Noté 9,1/10 sur Booking.com · 4,8/5 sur Google · 4,7/5 sur TripAdvisor',

  'home.feeling.headline': 'Voici à quoi ressemble le ralentissement',
  'home.feeling.body':
    "KoSa est une retraite côtière pensée pour la connexion à la nature, aux autres, à soi · Un lieu où chaque lever de soleil et chaque brise marine invitent à la quiétude · Où la cuisine est fraîche et le rythme apaisé. Où l’océan n’est pas qu’un paysage il est tout l’essentiel",

  'home.itineraries.eyebrow': 'Itinéraires types',
  'home.itineraries.weekend': 'Évasion d’un week-end · 2 nuits',
  'home.itineraries.short': 'Courte échappée · 4 nuits',
  'home.itineraries.full': 'Renouveau complet · 7 nuits',
  'home.itineraries.closing':
    "Chaque séjour vous appartient · Dites-nous ce qu’il vous faut et nous nous occupons du reste",
  'home.itineraries.cta': 'Commencer à planifier',
  'home.itineraries.weekend.title': 'Un week-end au bord de la mer',
  'home.itineraries.weekend.body':
    "Arrivée le vendredi à l’heure dorée. Cocktail de bienvenue, dîner lent, longue nuit · Samedi : yoga au lever, infusion, baignade, déjeuner sur le sable, massage en après-midi, dîner au feu de bois sous les étoiles · Dimanche : matinée douce, brunch sur la terrasse, transfert à votre rythme",
  'home.itineraries.short.title': 'Une courte échappée qui vous remet d’aplomb',
  'home.itineraries.short.body':
    "Quatre nuits pour vraiment arriver · Ajoutez une demi-journée à Elmina, une balade guidée dans les villages de pêcheurs, deux soins spa et un dîner privé sur le sable · Au bout de la troisième nuit, même vos épaules ont oublié la tension",
  'home.itineraries.full.title': 'Une semaine pour revenir à vous',
  'home.itineraries.full.body':
    "Sept nuits de souffle et de soleil ghanéen · Séances de coaching, yoga quotidien, excursions à Cape Coast et Kakum, marchés au matin, plage l’après-midi, soirées lentes · Repartez plus léger que vous n’êtes venu",

  'home.roomsTeaser.headline': 'Une chambre qui appartient au littoral',
  'home.roomsTeaser.body':
    'Réveillez-vous au chant des oiseaux et à la lumière de la mer · Nos chambres sont pensées pour le repos simples, belles, profondément confortables · Du retrait côté jardin aux suites face à l’océan, votre espace vous attend',
  'home.roomsTeaser.cta': 'Voir nos chambres →',

  'home.testimonials.example':
    "Je suis arrivée épuisée et repartie en me sentant à nouveau moi-même · KoSa a ce don-là",

  'home.email.headline': 'Soyez les premiers informés',
  'home.email.body':
    "Accès anticipé aux tarifs, nouvelles expériences et instants tranquilles du rivage directement dans votre boîte · Aucun bruit · Désabonnement à tout moment",
  'home.email.placeholder': 'votre@email.com',
  'home.email.cta': 'Je m’abonne',

  'roomsPage.headline': 'Votre place au bord de la mer',
  'roomsPage.intro':
    "Chaque chambre de KoSa a été pensée autour d’une seule question : à quoi ressemble le vrai repos ? Une lumière qui vient de l’océan · Un air qui porte le jardin · Un confort qui ne s’affiche pas il vous enveloppe",
  'roomsPage.cardCta': 'Réserver',
  'roomsPage.trust':
    "Réservez en direct pour le meilleur tarif · Annulation flexible sur toutes les chambres · Cocktail de bienvenue à l’arrivée pour vous dire merci d’être venu · Une question ? Nous sommes sur WhatsApp",

  'wellnessPage.headline': 'Le bien-être, à la manière de KoSa',
  'wellnessPage.hero.title': 'Le bien-être, à la manière de KoSa',
  'wellnessPage.hero.sub': 'La nature restaure trouvez l’équilibre du corps et de l’esprit',
  'wellnessPage.approach.eyebrow': 'Notre approche',
  'wellnessPage.approach.title': 'Le bien-être par la nature',
  'wellnessPage.approach.body1': "Nous avons bâti KoSa sur une conviction simple : le bien-être doit être beau, naturel et accessible. Ici, le bien-être n’est pas un programme - c’est le rythme du lieu. Il est dans la tisane qui vous attend à l’arrivée. Dans l’air marin qui vous accueille à l’aube. Dans le calme dont vous ne soupçonniez pas le besoin.",
  'wellnessPage.approach.body2': "Ici, le bien-être n’est pas quelque chose que l’on fait. C’est quelque chose dont on se souvient.",
  'wellnessPage.features.heading': 'Nos services bien-être',
  'wellnessPage.feat.spa.title': 'Soins du spa',
  'wellnessPage.feat.spa.body': 'Soins aux plantes et massages avec des ingrédients locaux naturels',
  'wellnessPage.feat.coaching.title': 'Coaching bien-être',
  'wellnessPage.feat.coaching.body': 'Un accompagnement personnalisé vers le calme et la clarté',
  'wellnessPage.feat.tea.title': 'Bar à tisanes & jus',
  'wellnessPage.feat.tea.body': 'Une sélection de boissons nourrissantes pour le corps et l’esprit',
  'wellnessPage.feat.yoga.title': 'Yoga au bord de la mer',
  'wellnessPage.feat.yoga.body': 'Des séances douces avec vue sur l’océan et la brise marine',
  'wellnessPage.feat.mindful.title': 'Pleine conscience guidée',
  'wellnessPage.feat.mindful.body': 'Méditation et respiration dans un cadre naturel serein',
  'wellnessPage.feat.nature.title': 'Lien avec la nature',
  'wellnessPage.feat.nature.body': 'Promenades réparatrices et expériences immersives sur la côte',
  'wellnessPage.holistic.eyebrow': 'Une approche holistique',
  'wellnessPage.holistic.title': 'Corps, esprit et âme',
  'wellnessPage.holistic.body1': 'Nos programmes prennent soin de la personne entière corps, esprit et âme · Que vous cherchiez la détente, l’énergie ou la paix intérieure, notre équipe vous guide sur un parcours personnalisé',
  'wellnessPage.holistic.body2': 'Du yoga au lever du soleil à la méditation au couchant, des tisanes nourrissantes aux massages, tout concourt à restaurer votre équilibre',
  'wellnessPage.benefits.heading': 'Les bienfaits du bien-être à KoSa',
  'wellnessPage.benefit.stress.title': 'Soulagement du stress',
  'wellnessPage.benefit.stress.body': 'Relâchez les tensions grâce aux thérapies naturelles et au calme des lieux',
  'wellnessPage.benefit.renewal.title': 'Renouveau physique',
  'wellnessPage.benefit.renewal.body': 'Retrouvez vitalité et énergie par le mouvement, la nutrition et le repos',
  'wellnessPage.benefit.clarity.title': 'Clarté mentale',
  'wellnessPage.benefit.clarity.body': 'Gagnez en perspective et en concentration par la pleine conscience',
  'wellnessPage.benefit.lasting.title': 'Changement durable',
  'wellnessPage.benefit.lasting.body': 'Développez des habitudes de bien-être qui vous suivent au-delà du séjour',
  'wellnessPage.intro':
    "Nous avons bâti KoSa sur une conviction simple : le bien-être doit être beau, naturel et accessible · Ici, le bien-être n’est pas un programme c’est le rythme du lieu · Il est dans la tisane qui vous attend à l’arrivée. Dans l’air marin du petit jour · Dans le silence dont vous ignoriez avoir besoin",
  'wellnessPage.journeys.title': 'Parcours de bien-être',
  'wellnessPage.journeys.body':
    "Des expériences guidées de repos, de réflexion et de renouveau · Seul ou à deux, nous façonnons votre temps ici autour de ce dont votre corps et votre esprit ont réellement besoin",
  'wellnessPage.coaching.title': 'Coaching de bien-être',
  'wellnessPage.coaching.body':
    "Un accompagnement sur-mesure pour l’équilibre et la pleine conscience · Asseyez-vous avec l’un de nos coachs, respirez, et commencez à retrouver le chemin de vous-même",
  'wellnessPage.spa.title': 'Soins du spa',
  'wellnessPage.spa.body':
    "Massages, aromathérapie et soins à base de plantes chacun choisi pour ce qu’il restitue au corps · Des mains qui savent écouter · Des soins enracinés dans cette terre",
  'wellnessPage.tea.title': 'KoSa Tea Bar',
  'wellnessPage.tea.body':
    "Tisanes et jus pressés qui nourrissent en douceur · Pas de hâte · Pas de bruit · Juste la chaleur d’une tasse et le murmure de l’océan tout proche",
  'wellnessPage.cta.book': 'Réserver une expérience bien-être',
  'wellnessPage.cta.ask': 'Dites-nous ce qu’il vous faut',

  'diningPage.headline': 'Manger comme la côte l’a prévu',
  'diningPage.popular': 'Populaire',
  'diningPage.intro':
    "À KoSa, la cuisine fait partie du bien-être · Nous travaillons avec les pêcheurs et les agriculteurs locaux ceux qui connaissent cette terre et ces eaux et nous laissons la fraîcheur parler · Saveurs ghanéennes, préparées avec soin · Une nourriture qui semble faite pour vous",
  'diningPage.restaurant.title': 'Le restaurant',
  'diningPage.restaurant.body':
    "Là où la journée commence et où le soir s’apaise · Notre restaurant sert une cuisine fraîche, de saison, enracinée dans la tradition ghanéenne, avec une attention particulière pour chaque convive options halal, plats végétariens et repas qui font autant de bien qu’ils sont bons",
  'diningPage.restaurant.cta': 'Réserver une table',
  'diningPage.bar.title': 'Le bar',
  'diningPage.bar.body':
    "Cocktails, mocktails et jus frais préparés avec ce que la saison nous offre · Venez au coucher du soleil · Restez aussi longtemps que la nuit le permet",
  'diningPage.breakfast.title': 'Petit-déjeuner',
  'diningPage.breakfast.body':
    "Le premier repas de la journée devrait être un cadeau · Coloré, frais, sans hâte formules ghanéenne, continentale et complète disponibles · Toutes les exigences alimentaires accommodées dites-le-nous",
  'diningPage.private.title': 'Tables privées & dîners d’exception',
  'diningPage.private.body':
    "Vous célébrez quelque chose ? Laissez-nous dresser une table rien que pour vous sur la plage, sous les étoiles, l’océan en toile de fond · Dites-nous l’occasion, nous nous occupons du reste",
  'diningPage.private.cta': 'Organiser un dîner d’exception',
  'diningPage.gallery.eyebrow': 'Tout droit de la cuisine',
  'diningPage.gallery.title': 'Galerie gourmande',
  'diningPage.gallery.body': 'Un aperçu de ce qui arrive à table · pêché, cultivé et cuisiné le long de cette côte',
  'diningPage.gallery.filter.dishes': 'Plats',
  'diningPage.gallery.filter.breakfast': 'Petit-déjeuner',
  'diningPage.gallery.filter.drinks': 'Boissons',
  'diningPage.gallery.filter.moments': 'À table',

  'experiencesPage.headline': 'Le Ghana commence ici',
  'experiencesPage.intro':
    "KoSa se trouve à la lisière de l’un des littoraux les plus beaux et les plus chargés d’histoire d’Afrique de l’Ouest · Nous sommes votre point d’ancrage, votre guide, et le foyer où vous revenez après chaque aventure · Que vous restiez sur le domaine ou partiez plus loin, chaque expérience mérite d’être rapportée chez vous",
  'experiencesPage.property.title': 'Sur le domaine',
  'experiencesPage.property.body':
    "L’océan est juste là. Tout comme la piscine, le jardin, le tapis de yoga et le hamac qui porte votre prénom · Les jours où l’on veut simplement être, KoSa suffit largement",
  'experiencesPage.ghana.title': 'Vers le Ghana',
  'experiencesPage.ghana.body':
    "Quand vous serez prêt à explorer, nous serons prêts à vous y conduire · Cape Coast Castle · Elmina · Kakum · Les villages de pêcheurs · Les marchés. Les histoires qui méritent d’être connues · Nous vous mettons en lien avec des guides qui connaissent ces lieux en profondeur non en touristes, mais en habitants",
  'experiencesPage.cta': 'Composer vos expériences',

  'eventsPage.headline': 'Toujours quelque chose à faire',
  'eventsPage.enquire': 'Réserver',
  'eventsPage.transport': 'Transport inclus',
  'eventsPage.empty': "Rien dans cette catégorie pour l'instant.",

  'eventsPage.intro':
    "Certains instants méritent un décor à leur hauteur · KoSa s’étend entre l’océan et le jardin un écrin naturel pour des célébrations sincères, des retraites qui restaurent vraiment, et des rassemblements où l’on arrive collègues et l’on repart un peu plus proches",
  'eventsPage.weddings.title': 'Mariages & célébrations',
  'eventsPage.weddings.body':
    "Un mariage à KoSa, c’est la cérémonie au bord de la mer dont vous rêviez le murmure des vagues, la chaleur du littoral, vos proches réunis en un lieu magnifique · Nous prenons soin de chaque détail · Vous n’avez qu’à venir célébrer",
  'eventsPage.weddings.cta': 'Commencer à organiser votre mariage',
  'eventsPage.retreats.title': 'Retraites de bien-être',
  'eventsPage.retreats.body':
    "KoSa a été conçu pour la restauration · Les retraites de groupe intensifs yoga, week-ends pleine conscience ou programmes sur-mesure trouvent ici un foyer naturel · Nous apportons l’espace, le calme et le soutien · Vous apportez l’intention",
  'eventsPage.corporate.title': 'Séminaires & retraites d’équipe',
  'eventsPage.corporate.body':
    "Les meilleures idées ne naissent pas en salle de réunion · Emmenez votre équipe à la côte, prenez de la distance, et regardez ce qui se passe quand chacun peut enfin penser · KoSa propose des salles, des hébergements pour groupes et des expériences d’équipe conçues pour reconnecter celles et ceux qui font le travail",
  'eventsPage.corporate.cta': 'Demander un devis pour un groupe',
  'eventsPage.form.name': 'Nom',
  'eventsPage.form.company': 'Société',
  'eventsPage.form.type': 'Type d’événement',
  'eventsPage.form.dates': 'Dates',
  'eventsPage.form.guests': 'Nombre d’invités',
  'eventsPage.form.message': 'Message',
  'eventsPage.form.response': 'Nous répondons sous 24 heures',

  'planPage.headline': 'Tout ce qu’il vous faut pour arriver léger',
  'planPage.intro':
    "Nous voulons que votre expérience KoSa commence avant même votre arrivée. Vous trouverez ci-dessous tout ce qui aide à préparer votre séjour itinéraires types, accès, FAQ et l’information pratique qui change vraiment les choses",
  'planPage.experiences.eyebrow': 'Que faire ici',
  'planPage.experiences.body':
    'De vraies expériences à KoSa, du rivage à la côte choisissez ce qui vous appelle',
  'planPage.experiences.cta': 'Voir toutes les expériences',
  'planPage.itineraries.eyebrow': 'Itinéraires types',
  'planPage.itineraries.body':
    "Trois séjours pré-composés, au jour le jour pas un planning, mais une histoire · Chacun se conclut ainsi : voici une version de votre séjour à KoSa. La vôtre vous appartient façonnons-la ensemble à votre arrivée, ou dites-nous ce qu’il vous faut avant de venir",
  'planPage.itineraries.cta1': 'Réserver ce séjour',
  'planPage.itineraries.cta2': 'Composer mon séjour',
  'planPage.getting.title': 'Comment venir',
  'planPage.getting.body':
    "KoSa Beach Resort est situé sur la côte centrale du Ghana, à environ 25 km d’Elmina et 30 km du château de Cape Coast · Depuis l’aéroport international Kotoka d’Accra, la route prend environ 3 heures et nous pouvons organiser votre transfert pour que le repos commence dès l’atterrissage",
  'planPage.getting.cta': 'Réserver un transfert',
  'planPage.faqs.title': 'Questions fréquentes',
  'planPage.faq.checkin.q': 'Quels sont les horaires d’arrivée et de départ ?',
  'planPage.faq.checkin.a':
    "Arrivée à partir de 14 h, départ jusqu’à 11 h. Nous restons flexibles dans la mesure du possible n’hésitez pas à demander",
  'planPage.faq.cancellation.q': 'Quelle est votre politique d’annulation ?',
  'planPage.faq.cancellation.a':
    "Remboursement de 50 % pour toute annulation reçue au moins 20 jours avant l’arrivée ; aucun remboursement au-delà. Les séjours en haute saison ne sont pas remboursables · Les réservations peuvent être modifiées jusqu’à 48 h avant l’arrivée un acompte de 50 % confirme la réservation",
  'planPage.faq.airport.q': 'Proposez-vous des transferts aéroport ?',
  'planPage.faq.airport.a':
    "Oui · Transferts privés et confortables depuis l’aéroport international Kotoka d’Accra · Réservez à l’avance pour que nous vous attendions à l’arrivée",
  'planPage.faq.halal.q': 'Proposez-vous des repas halal ?',
  'planPage.faq.halal.a':
    "Oui · Options halal disponibles sur l’ensemble des menus · Régimes végétariens, végétaliens et autres pris en compte chaleureusement",
  'planPage.faq.children.q': 'Puis-je venir avec mes enfants ?',
  'planPage.faq.children.a':
    "Bien sûr. KoSa est calme mais accueille les familles · Indiquez-nous l’âge des enfants pour préparer votre séjour au mieux",
  'planPage.faq.payment.q': 'Quels modes de paiement acceptez-vous ?',
  'planPage.faq.payment.a':
    "Toutes les cartes principales, mobile money et virement · Un acompte confirme la réservation, le solde se règle à l’arrivée",
  'planPage.faq.swim.q': 'Peut-on se baigner à la plage ?',
  'planPage.faq.swim.a':
    "L’Atlantique a ses courants nous vous indiquons toujours les heures les plus sûres · La piscine est ouverte toute la journée",
  'planPage.faq.wellness.q': 'Peut-on réserver des soins à l’avance ?',
  'planPage.faq.wellness.a':
    "Oui c’est même conseillé. Spa, coaching et séances de groupe se remplissent vite · Dites-nous ce qui vous tente avant votre venue",

  'aboutPage.headline': 'Deux décennies au bord de la mer. Et pourtant, chaque hôte se sent comme le premier',
  'aboutPage.opening':
    "KoSa Beach Resort n’est pas né d’un plan d’affaires. Il est né d’une conviction - que la côte ghanéenne est l’un des endroits les plus ressourçants au monde, et que tous ceux qui viennent ici devraient pouvoir le ressentir. Depuis plus de vingt ans, nous cultivons cette conviction.",
  'aboutPage.continued':
    "Nous faisons partie d’Akwaaba Stays Hospitality Group - une famille d’adresses à travers le Ghana et l’Afrique de l’Ouest qui partagent un même engagement : une hospitalité enracinée dans le soin, la communauté et les lieux que nous appelons chez nous. C’est à KoSa que cet engagement vit au plus près de l’eau.",
  'aboutPage.values': 'Nos valeurs',
  'aboutPage.values.authenticity.title': 'Authenticité',
  'aboutPage.values.authenticity.body':
    'Une hospitalité honnête, au rythme réel de cette côte · Sans mise en scène · Sans prétention · KoSa tel qu’il est et tel qu’il a toujours été',
  'aboutPage.values.community.title': 'Communauté',
  'aboutPage.values.community.body':
    "Nous travaillons main dans la main avec celles et ceux qui nous entourent pêcheurs, agriculteurs et artisans dont le travail et le savoir font KoSa. Quand vous séjournez ici, leurs vies grandissent aussi",
  'aboutPage.values.wellness.title': 'Bien-être',
  'aboutPage.values.wellness.body':
    "Nourrir le corps et l’esprit par une bonne cuisine, le coaching et le calme · Nous croyons que le bien-être doit être beau, naturel et accessible pas un luxe réservé à quelques-uns",
  'aboutPage.values.sustainability.title': 'Durabilité',
  'aboutPage.values.sustainability.body':
    "Respect du rivage, de la terre et des vies qu’ils nourrissent · Nous sommes les gardiens de ce lieu responsables pour lui et pour les générations à venir",
  'aboutPage.values.legacy.title': 'Héritage',
  'aboutPage.values.legacy.body':
    "Vingt années de liens sincères et de soin continu au bord de la mer · L’océan nous garde humbles · Les invités qui reviennent nous tiennent debout",
  'aboutPage.closing.headline': 'Venez voir par vous-même',
  'aboutPage.closing.body':
    "Nous pourrions vous en dire davantage mais KoSa se vit, mieux qu’il ne se raconte · L’air marin, la cuisine, les gens, le silence · Il y a ici quelque chose qui ne se laisse pas mettre en mots · Mais qui vous attend",
  'aboutPage.closing.ctaBook': 'Réserver mon séjour',
  'aboutPage.closing.ctaGet': 'Nous contacter',

  'exit.headline': 'Recevez nos tarifs avant qu’ils ne soient pris',
  'exit.body':
    "Accès anticipé aux tarifs saisonniers, aux semaines calmes et aux nouvelles expériences · Une fois par mois, pas plus",
  'exit.cta': 'Tenez-moi informé',
  'exit.placeholder': 'votre@email.com',
  'exit.dismiss': 'Non merci',
  'exit.thanks': 'Merci · Surveillez votre boîte de réception',

  'common.bookYourStay': 'Réservez votre séjour',
  'common.exploreKosa': 'Découvrir KoSa',
  'common.whatsapp': 'WhatsApp',
  'common.getInTouch': 'Nous contacter',
  'common.startPlanning': 'Commencer à planifier',
  'common.readMore': 'En lire plus',

  'footer.quickLinks': 'Liens utiles',
  'footer.reviews': 'Aimé par nos invités sur',
  'footer.address': 'Beach Road No.1, Ampenyi, Elmina, Ghana',
  'footer.group': "Une propriété d’Akwaaba Stays Hospitality Group",

  // ─── Full-coverage UI strings (2026 i18n sweep) ────────────────────────
  'newsletter.placeholder': 'vous@exemple.com',
  'newsletter.success': 'Bienvenue sur le rivage',
  'newsletter.error': "Une erreur s’est produite",
  'newsletter.failed': "L’inscription a échoué",
  'newsletter.ariaEmail': 'Adresse e-mail',
  'newsletter.ariaSubscribe': "S’abonner",

  'home.hero.location': 'Elmina · Ghana',
  'home.itineraries.heading': 'Quelques façons de passer votre temps',

  'roomsPage.searchPlaceholder': 'Rechercher : chambres, lits, vue mer…',
  'roomsPage.resultsOne': '1 type de chambre',
  'roomsPage.resultsMany': '{n} types de chambres',
  'roomsPage.searchEmpty': 'Aucune chambre ne correspond essayez un autre mot ou filtre',
  'roomsPage.occupied': 'Réservé',
  'roomsPage.upTo': "Jusqu’à",
  'roomsPage.guestsUnit': 'voyageurs',

  'roomDetail.amenities': 'Équipements',
  'roomDetail.from': 'À partir de',
  'roomDetail.taxesIncluded': 'Taxes et petit-déjeuner inclus',
  'roomDetail.reserve': 'Réserver',
  'roomDetail.askConcierge': 'Demander au concierge',
  'roomDetail.freeCancellation': "Annulation gratuite jusqu’à 48 heures avant l’arrivée",
  'roomDetail.otherRooms': 'D’autres chambres qui pourraient vous plaire',
  'roomDetail.descFallback':
    'Un refuge tout en mesure lin doux, palme tressée, céramiques façonnées à la main · Une chambre qui respire au rythme de la marée',
  'roomDetail.amenity.balcony': 'Balcon face à la plage',
  'roomDetail.amenity.bed': 'Lit king-size, draps en lin',
  'roomDetail.amenity.shower': 'Douche à ciel ouvert',
  'roomDetail.amenity.local': 'Produits d’accueil locaux',
  'roomDetail.amenity.wifi': 'Wi-Fi haut débit',
  'roomDetail.amenity.ac': 'Climatisation + ventilateur de plafond',
  'roomDetail.amenity.breakfast': 'Petit-déjeuner quotidien inclus',
  'roomDetail.amenity.welcome': 'Rituels de bienvenue',

  'wellnessPage.heroSub': 'Ouvert aux visiteurs à la journée comme aux résidents',
  'wellnessPage.enquiry.eyebrow': 'Demander',
  'wellnessPage.enquiry.title': 'Sans séjour obligatoire',
  'wellnessPage.enquiry.body': 'Dites-nous ce qui vous attire et nous l’organiserons que vous séjourniez chez nous ou veniez à la journée',
  'wellnessPage.enquiry.point1': 'Visiteurs à la journée bienvenus venez pour un soin ou une séance',
  'wellnessPage.enquiry.point2': 'Nous confirmons l’horaire par e-mail ou WhatsApp',
  'wellnessPage.enquiry.point3': 'Couples et petits groupes possibles',
  'wellnessForm.interest': 'Ce qui vous intéresse',
  'wellnessForm.choose': 'Choisir un programme',
  'wellnessForm.notSure': 'Pas encore sûr - conseillez-moi',
  'wellnessForm.guestType': 'Séjournez-vous chez nous ?',
  'wellnessForm.day': 'Visiteur à la journée',
  'wellnessForm.staying': 'En séjour au KoSa',
  'wellnessForm.date': 'Date souhaitée',
  'wellnessForm.guests': 'Nombre de personnes',
  'wellnessForm.message': 'Autre chose ?',
  'wellnessForm.submit': 'Envoyer la demande',
  'wellnessForm.whatsapp': 'Envoyer via WhatsApp',
  'wellnessForm.thankTitle': 'Merci',
  'wellnessForm.thankBody': 'Nous avons bien reçu votre demande et reviendrons vers vous très vite',
  'wellnessForm.waIntro': 'Bonjour KoSa ! Je souhaite une demande bien-être :',
  'wellnessPage.treatmentsHeading': 'Soins & séances',
  'wellnessPage.treatmentsIntro': 'Choisissez selon vos envies - massages et soins du corps au KoSa Health Spa, ou les rituels et retraites plus profonds d’O2 Wellness.',
  "quote.ocean": "L'océan ne se presse pas. Vous non plus",
  "quote.stop": "Voici ce que l'on ressent quand on s'arrête enfin",
  'home.welcome.eyebrow': 'Akwaba · Bienvenue à la maison',
  'home.welcome.heading': 'Certains lieux, on les visite KoSa, on y revient comme chez soi',
  'home.welcome.body': 'Regardez un accueil KoSa se dérouler : les tambours sur le sable, le linge blanc dans la brise, une cérémonie de baptême au bord de l’océan. Voilà ce que l’on ressent en arrivant.',
  'home.welcome.cta': 'Lancer le film',
  'home.welcome.play': 'Lancer le film Welcome Home',
  "wellnessPage.hero.line": "Vous n'avez pas besoin d'un programme. Vous avez besoin de la permission de vous arrêter",
  "wellnessPage.offerings.eyebrow": "Bien-être KoSa",
  "wellnessPage.yoga.title": "Yoga au bord de la mer",
  "wellnessPage.yoga.body": "Des mouvements doux sur le sable, le souffle et l'océan au même rythme. Venez comme vous êtes ; tous les niveaux sont les bienvenus.",
  "wellnessPage.journeys.sense": "Rien n'est prévu que vous n'ayez choisi. La journée s'adapte à vous, et non l'inverse.",
  "wellnessPage.coaching.sense": "Vous rencontrez votre coach le lendemain de votre arrivée. Juste pour parler.",
  "wellnessPage.spa.sense": "Les salles de soin s'ouvrent sur le jardin. Vous entendrez les oiseaux.",
  "wellnessPage.tea.sense": "Nous infusons des herbes du domaine. Certains clients demandent la recette.",
  "wellnessPage.yoga.sense": "Les séances ont lieu à 7 h, quand la lumière est encore douce et la plage tranquille.",
  "wellnessPage.day.eyebrow": "Une journée ici",
  "wellnessPage.day.heading": "À quoi ressemble une journée bien-être à KoSa",
  "wellnessPage.day.intro": "Aucun horaire à tenir. Juste un rythme doux que vous suivez autant que vous le souhaitez.",
  "wellnessPage.day.s1.time": "Au lever du soleil",
  "wellnessPage.day.s1.text": "Un thé sur la terrasse pendant que le jour se lève. Aucune hâte, rien à être encore.",
  "wellnessPage.day.s2.time": "Tôt le matin",
  "wellnessPage.day.s2.text": "Une marche lente sur la plage, le sable encore frais et le rivage tranquille.",
  "wellnessPage.day.s3.time": "7 h",
  "wellnessPage.day.s3.text": "Yoga au bord de la mer, le souffle et les vagues au même tempo.",
  "wellnessPage.day.s4.time": "En fin de matinée",
  "wellnessPage.day.s4.text": "Un soin, les portes du jardin ouvertes et le chant des oiseaux qui entre.",
  "wellnessPage.day.s5.time": "À midi",
  "wellnessPage.day.s5.text": "Déjeuner sur la terrasse, frais de la cuisine, savouré lentement à l'ombre.",
  "wellnessPage.day.s6.time": "L'après-midi",
  "wellnessPage.day.s6.text": "Une séance de coaching, ou simplement un hamac et un livre. Comme vous voulez.",
  "wellnessPage.day.s7.time": "Le soir",
  "wellnessPage.day.s7.text": "Dîner autour du feu de camp tandis que les étoiles apparaissent sur l'eau.",
  "wellnessPage.closing.eyebrow": "Le bien-être, à votre façon",
  "wellnessPage.closing.headline": "Dites-nous ce qu'il vous faut. Nous nous occupons du reste",
  "wellnessPage.closing.body": "Pas de programme figé, aucune pression. Dites-nous comment vous voulez vous sentir et nous façonnerons votre séjour autour de cela.",
  "wellnessPage.closing.cta": "Discuter sur WhatsApp",

  // Experiences - activités quotidiennes gratuites
  'experiencesPage.daily.eyebrow': 'Chaque jour, inclus',
  'experiencesPage.daily.heading': 'Activités quotidiennes gratuites',
  'experiencesPage.daily.intro':
    "Chaque journée à KoSa a son rythme. Toutes les activités sont gratuites pour nos hôtes : participez à celles qui vous tentent, ou prenez simplement le temps de vous reposer.",
  'experiencesPage.daily.free': 'Gratuit',
  'experiencesPage.daily.footnote':
    "Toutes les activités sont gratuites pour les hôtes. Inscrivez-vous à la réception. Le programme peut varier.",

  // Wellness - forfaits
  'planPage.packages.eyebrow': 'Séjours composés',
  'planPage.packages.heading': 'Forfaits séjour',
  'planPage.packages.intro':
    "Tout est organisé. Vous n'avez qu'à arriver. Chaque forfait comprend le petit-déjeuner quotidien, un massage de bienvenue de 10 minutes offert à l'arrivée et un accès complet à la plage.",
  'planPage.packages.enquireRates': 'Demandez nos tarifs actuels',
  'planPage.packages.enquire': 'Demander',

  // Wellness - suppléments
  'wellnessPage.enhance.eyebrow': 'Suppléments',
  'wellnessPage.enhance.heading': 'Sublimez votre séjour',
  'wellnessPage.enhance.intro':
    "Ajoutez une touche spéciale à tout forfait ou réservation de chambre. Organisez-le à la réception, par téléphone ou au moment de réserver.",
  'wellnessPage.enhance.cta': 'Renseignez-vous sur les suppléments',
  'wellnessPage.enhance.enquire': 'Demander',
  'wellnessPage.beginHeadline': 'Commencez votre retour à vous',

  'experiencesPage.buildDay': 'Demandez-nous de composer votre journée idéale',

  'contactPage.eyebrow': 'Nous contacter',
  'contactPage.title': 'Parlons, tout simplement',
  'contactPage.whereToFind': 'Où nous trouver',
  'contactPage.whatsappUs': 'Écrivez-nous sur WhatsApp',
  'contactPage.mapTitle': 'Carte de localisation de KoSa',

  'bookPage.eyebrow': 'Préparez votre retour',
  'bookPage.title': 'Réservez votre séjour',
  'bookPage.subtitle': "Meilleur tarif, annulation gratuite jusqu’à 48 heures, confirmation immédiate",

  'book.step.dates': 'Dates',
  'book.step.room': 'Chambre',
  'book.step.guest': 'Coordonnées',
  'book.step.confirm': 'Confirmation',
  'book.datesHeading': 'Quand souhaitez-vous séjourner ?',
  'book.checkIn': 'Arrivée',
  'book.checkOut': 'Départ',
  'book.adults': 'Adultes',
  'book.children': 'Enfants',
  'book.continue': 'Continuer',
  'book.editDates': 'Modifier les dates',
  'book.guestHeading': 'Vos coordonnées',
  'book.firstName': 'Prénom',
  'book.lastName': 'Nom',
  'book.email': 'E-mail',
  'book.phone': 'Téléphone',
  'book.country': 'Pays',
  'book.notes': 'Remarques (facultatif)',
  'book.confirmReservation': 'Confirmer la réservation',
  'book.guests': 'Voyageurs',
  'book.adultsUnit': 'adultes',
  'book.childrenUnit': 'enfants',
  'book.nights': 'Nuits',
  'book.nightsUnit': 'nuits',
  'book.total': 'Total',
  'book.taxesLine': "Taxes et petit-déjeuner inclus · Annulation gratuite jusqu’à 48 heures",
  'book.doneHeading': 'Akwaaba votre réservation est enregistrée',
  'book.confirmationLabel': 'Confirmation :',
  'book.doneBody':
    "Une confirmation a été envoyée à votre adresse e-mail · Notre concierge vous contactera sous un jour avec les détails d’arrivée et un rituel de bienvenue",
  'book.returnHome': "Retour à l’accueil",
  'book.whatsappUs': 'Écrivez-nous sur WhatsApp',
  'book.errRequired': 'Requis',
  'book.errEmail': 'E-mail valide requis',
  'book.failed': 'La réservation a échoué',

  'eventsPage.form.optWedding': 'Mariage',
  'eventsPage.form.optRetreat': 'Retraite bien-être',
  'eventsPage.form.optCorporate': 'Séminaire d’entreprise',
  'eventsPage.form.optOther': 'Autre célébration',
  'eventsPage.form.thankYou': 'Merci',
  'eventsPage.form.error': 'Merci d’indiquer votre nom et une adresse e-mail valide',
  'eventsPage.form.sendError': "Impossible d’envoyer votre demande",
  'eventsPage.form.sending': 'Envoi en cours…',

  'emailCapture.invalid': 'Merci d’indiquer une adresse e-mail valide',
  'emailCapture.error': "L’inscription a échoué",

  'tour.viewRooms': 'Voir les chambres',
  'tour.fullscreen': 'Plein écran',
  'tour.loading': 'Chargement',
  'tour.loadingTour': 'Chargement de la visite…',
  'tour.noWebgl': "Votre appareil ne prend pas en charge la vue à 360° profitez plutôt d’une galerie d’images",

  'common.email': 'E-mail',
  'common.returnHome': "Retour à l’accueil",
  'error.headline': 'Une petite vague nous a fait chavirer',
  'error.body': 'Merci de réessayer nous retrouvons l’équilibre',
  'error.retry': 'Réessayer',
  'notFound.headline': 'Perdu en mer',
  'notFound.body': 'La page que vous cherchez a dérivé. Laissez-nous vous ramener',
  'notFound.concierge': 'Parler au concierge',
  'experiencesPage.detailFallback': 'Les sessions sont intimes six personnes au maximum · Les horaires évoluent doucement au gré de la marée et du soleil · Parlez à notre concierge pour des réservations privées, des rituels sur mesure et des offres de saison',
  'experiencesPage.addToStay': 'Ajouter à votre séjour',
  'common.speakConcierge': 'Parler au concierge',
  'blogPage.eyebrow': 'Lettres du rivage',
  'blogPage.comingSoon': 'Lettres du rivage bientôt disponibles',
  'blogPage.subtitle': 'Histoires, guides et notes paisibles de notre coin de côte',
  'blogPage.featured': 'À la une',
  'blogPage.readStory': 'Lire l’histoire',
  'blogPage.readMins': 'min de lecture',
  'blogPage.moreStories': 'Plus dans le journal',
  'blogPage.backToJournal': 'Retour au journal',
  'blogPage.cta.headline': 'Venez le ressentir vous-même',
  'blogPage.cta.body': 'Le rivage vous attend quand vous serez prêt',
  'eventsPage.form.datesPlaceholder': 'ex. 12–15 août 2026',
  'eventsPage.form.guestsPlaceholder': 'ex. 40',
  'a11y.close': 'Fermer',
  'a11y.previous': 'Précédent',
  'a11y.next': 'Suivant',
  'a11y.openMenu': 'Ouvrir le menu',
  'a11y.closeMenu': 'Fermer le menu',
  'a11y.scrollNext': 'Aller à la section suivante',
  'a11y.resortChat': 'Chat du domaine',
  'gallery.empty': 'Pas encore d’images dans la galerie',
  'chat.errorEmpty': "Akwaaba je suis là, mais mon esprit de concierge s’est tu un instant · Réessayez, ou écrivez-nous sur WhatsApp au +233 24 437 5432",
  'chat.errorTimeout': 'Cela a pris plus de temps que prévu réessayez, ou écrivez-nous sur WhatsApp au +233 24 437 5432',
  'chat.errorGeneric': "J’ai du mal à accéder aux informations du domaine pour le moment. Écrivez-nous sur WhatsApp au +233 24 437 5432, nous répondrons rapidement",
  'alt.heroShoreline': 'Vue aérienne du littoral de KoSa, Elmina, Ghana',
  'alt.feelingHammock': 'Un hamac paisible entre les palmiers de KoSa',
  'alt.aboutSea': 'KoSa Beach Resort au bord de la mer',
  'aboutPage.enrichedSetting': "Cela se reflète dans les pêcheurs avec qui nous travaillons, les agriculteurs qui approvisionnent notre cuisine, les artisans dont les mains ont façonné ce que vous voyez autour de vous.",
  'aboutPage.enrichedEco': "Nous n’avons jamais cherché à créer un complexe de luxe. Nous voulions un lieu où l’on puisse ressentir la côte telle qu’elle est vraiment - sans hâte, généreuse, vivante.",
  'diningPage.bar.name': 'Kooki Beach Bar',
  'diningPage.bar.hours': 'Cocktails servis jusqu’à 22 h',
  'diningPage.restaurant.hours': 'Petit-déjeuner, déjeuner & dîner · 7 h à 21 h, tous les jours',
  'experiencesPage.signature.eyebrow': 'Expériences signature',
  'experiencesPage.signature.headline': 'Quelques choses à vivre, avec ceux qui savent',
  'experiencesPage.signature.ampenyi.title': 'Balade dans le village d’Ampenyi',
  'experiencesPage.signature.ampenyi.body': 'Une promenade guidée à Ampenyi rencontrez les pêcheurs, découvrez le retour de pêche, et (s’il est là) saluez le chef',
  'experiencesPage.signature.capeCoast.title': 'Château de Cape Coast',
  'experiencesPage.signature.capeCoast.body': 'Une courte route vers l’est · Un poids qu’il faut porter emportez de l’eau, prévoyez du temps pour vous taire ensuite',
  'experiencesPage.signature.elmina.title': 'Château d’Elmina',
  'experiencesPage.signature.elmina.body': 'À vingt minutes de KoSa. L’une des plus anciennes constructions européennes d’Afrique de l’Ouest, à parcourir lentement',
  'experiencesPage.signature.kakum.title': 'Parc national de Kakum',
  'experiencesPage.signature.kakum.body': 'Forêt tropicale, passerelles dans la canopée, papillons que vous ne croiserez nulle part ailleurs · Départ tôt, retour pour le dîner',
  'experiencesPage.signature.massage.title': 'Massage thaï au bord de la mer',
  'experiencesPage.signature.massage.body': 'Choisissez : sur la plage avec les vagues, dans le jardin sous les palmiers, ou dans l’intimité de votre chambre',
  'experiencesPage.signature.horse.title': 'Équitation & bijouterie',
  'experiencesPage.signature.horse.body': 'Balade à cheval à l’heure dorée, ateliers de bijoux avec des artisans locaux de petites choses qui font d’un séjour un souvenir',
};

// ─── SPANISH ─────────────────────────────────────────────────────────────────
// Natural hospitality Spanish warm "tú" register, evocative rather than literal.
const esBase: Partial<Record<keyof typeof en, string>> = {
  'nav.rooms': 'Habitaciones',
  'nav.experiences': 'Experiencias',
  'nav.dining': 'Gastronomía',
  'nav.wellness': 'Bienestar',
  'nav.gallery': 'Galería',
  'nav.virtualTour': 'Tour virtual',
  'nav.about': 'El resort',
  'nav.blog': 'Bitácora',
  'nav.contact': 'Contacto',
  'nav.book': 'Reservar',
  'nav.bookYourStay': 'Reserva tu estancia',

  'hero.location': 'Elmina · Ghana · África Occidental',
  'hero.headline': 'La vida es mejor en la playa',
  'hero.tagline': 'Respirar · Mar · Sentirse en casa',
  'hero.bookCta': 'Reserva tu escapada',
  'hero.exploreCta': 'Descubre el resort',
  'hero.scrollAria': 'Ir a la siguiente sección',

  'intro.eyebrow': 'Bienvenidos · Akwaaba',
  'intro.headline.l1': 'KoSa no es un hotel',
  'intro.headline.l2': 'Es el lugar al que siempre vuelves',
  'intro.body':
    'En un tramo de costa atlántica en Elmina, donde las palmeras se mecen con la brisa y el océano dicta su propio ritmo, creamos un refugio para detenerse · Eco-lujo de raíz, anclado en la artesanía ghanesa y sostenido por los rituales de quienes lo cuidan cada día',
  'intro.script': 'Solo respira',
  'intro.philosophyCta': 'Nuestra filosofía las 5 dimensiones del ser',

  'rooms.eyebrow': 'Quédate con nosotros',
  'rooms.headline': 'Boutique frente al Atlántico',
  'rooms.statRooms': 'Tipos de habitación',
  'rooms.statSuites': 'Garden View',
  'rooms.statBeach': 'Playa',
  'rooms.filter.all': 'Todas',
  'rooms.filter.beachView': 'Vista al mar',
  'rooms.filter.palmSide': 'Junto a las palmeras',
  'rooms.filter.suite': 'Garden View',
  'rooms.priceFrom': 'Desde',
  'rooms.perNight': 'noche',
  'rooms.view': 'Ver',

  'experiences.eyebrow': 'Vive plenamente',
  'experiences.headline': 'Cuatro formas de reconectarte',
  'experiences.blurb':
    'Desde yoga al amanecer sobre el acantilado hasta círculos de tambor junto al fuego cada día en KoSa es una invitación a volver a ti',
  'experiences.discover': 'Descubrir',

  'wellness.bgWord': 'Solo respira',
  'wellness.eyebrow': 'Respirar',
  'wellness.headline.l1': 'Spa, yoga, sonido',
  'wellness.headline.l2': 'las cinco dimensiones del ser',
  'wellness.blurb':
    'Tratamientos nacidos de la tierra oeste-africana karité, palma, sal marina en cabañas abiertas donde solo suena la marea',
  'wellness.bookCta': 'Reservar un tratamiento',

  'testimonials.via': 'via',

  'testimonials.eyebrow': 'Quienes regresan',
  'testimonials.headline': 'Voces desde la orilla',

  'booking.eyebrow': 'Prepara tu regreso',
  'booking.headline.l1': 'La orilla te espera',
  'booking.headline.l2': '¿Y tú?',
  'booking.blurb':
    'Disponibilidad en tiempo real, mejor tarifa garantizada y una bienvenida cálida desde la entrada · Reserva en menos de dos minutos',
  'booking.badgeSecure': 'Pago seguro',
  'booking.badgeBestRate': 'Mejor tarifa garantizada',
  'booking.badgeCancel': 'Cancelación sin coste',
  'booking.formTitle': 'Ver disponibilidad',
  'booking.checkIn': 'Llegada',
  'booking.checkOut': 'Salida',
  'booking.adults': 'Adultos',
  'booking.adult': 'adulto',
  'booking.adultsPlural': 'adultos',
  'booking.children': 'Niños',
  'booking.child': 'niño',
  'booking.childrenPlural': 'niños',
  'booking.submit': 'Ver disponibilidad',
  'booking.submitting': 'Comprobando…',

  'footer.tagline': 'La vida es mejor en la playa',
  'footer.about':
    'Un refugio eco-lujoso en la costa atlántica de Ghana, donde el ritmo del mar se funde con la calidez de la hospitalidad akan',
  'footer.explore': 'Explorar',
  'footer.connect': 'Síguenos',
  'footer.newsletter': 'Conecta con lo esencial',
  'footer.newsletterBlurb': 'Noticias del litoral, al ritmo de las estaciones · Nada más',
  'footer.copyright': 'Todos los derechos reservados',
  'footer.privacy': 'Privacidad',
  'footer.terms': 'Condiciones',
  'footer.admin': 'Admin',

  'chat.cta': 'Habla con Abena',
  'chat.title': 'Abena',
  'chat.subtitle': 'Conserje digital · responde al momento',
  'chat.greeting':
    'Akwaaba soy Abena, tu conserje en KoSa. Pregúntame sobre el resort, las habitaciones o cómo organizar tu estancia',
  'chat.placeholder': 'Pregunta lo que quieras…',
  'chat.send': 'Enviar',
  'chat.close': 'Cerrar',
  'chat.suggested.rooms': '¿Qué habitaciones hay disponibles?',
  'chat.suggested.directions': '¿Cómo llego desde Accra?',
  'chat.suggested.spa': 'Cuéntame del spa',
  'chat.suggested.included': '¿Qué incluye mi estancia?',

  'contact.name': 'Nombre',
  'contact.email': 'Correo electrónico',
  'contact.phone': 'Teléfono (opcional)',
  'contact.subject': 'Asunto (opcional)',
  'contact.message': 'Mensaje',
  'contact.send': 'Enviar mi consulta',
  'contact.sending': 'Enviando…',
  'contact.thankTitle': 'Gracias',
  'contact.thankBody': 'Te responderemos en un día normalmente mucho antes',
  'contact.error.name': 'Indica tu nombre',
  'contact.error.email': 'Indica un correo válido',
  'contact.error.message': 'Cuéntanos un poco más',
  'contact.error.generic': 'No se pudo enviar, inténtalo de nuevo',

  'cultural.eyebrow': 'Adinkra · Símbolos del pueblo Akan',
  'cultural.headline': 'Con raíces en Ghana',
  'cultural.description': 'Estos cuatro símbolos nos acompañan en todo el resort grabados en madera, tejidos en lino, presentes en cada bienvenida',
  'cultural.footer': 'Akwaaba aquí eres bienvenido',

  'gallery.eyebrow': 'A través de la lente',
  'gallery.headline': 'Galería',
  'gallery.description': 'Un paseo lento por el resort y la costa que lo abraza',
  'gallery.loadMore': 'Ver más',

  'tour.eyebrow': 'Tour virtual 360°',
  'tour.headline': 'Entra · Déjate llevar',
  'tour.description': 'Recorre las suites, el spa, la costa desde cualquier rincón del mundo',
  'tour.cta': 'Comenzar el tour',
  'tour.footer': 'Con Google Drive · 6 escenas',

  'common.learnMore': 'Saber más',
  'common.discover': 'Descubrir',
  'common.bookNow': 'Reservar',
  'common.viewAll': 'Ver todo',
  'common.languageEn': 'English',
  'common.languageFr': 'Français',
  'common.languageEs': 'Español',
  'common.languageNl': 'Nederlands',
  'common.languageDe': 'Deutsch',
  'common.toggleLanguage': 'Cambiar idioma',
  'common.selectLanguage': 'Elegir idioma',

  'experiences.wellness.label': 'Bienestar',
  'experiences.wellness.title': 'Rituales de la orilla',
  'experiences.wellness.description': 'Mañanas lentas, masajes templados con sal, respiración bajo las palmeras · Un regreso al cuerpo',
  'experiences.ocean.label': 'Vida en el mar',
  'experiences.ocean.title': 'Donde el Atlántico canta',
  'experiences.ocean.description': 'Paddle al amanecer, paseos por pueblos pesqueros, arrecifes para esnórquel que solo conocen los locales',
  'experiences.dining.label': 'Gastronomía',
  'experiences.dining.title': 'Una costa en el plato',
  'experiences.dining.description': 'Mero al fuego abierto, glaseado con vino de palma, hierbas del huerto al atardecer · Historias en cada plato',
  'experiences.cultural.label': 'Rituales culturales',
  'experiences.cultural.title': 'Con raíces en Ghana',
  'experiences.cultural.description': 'Reflejos del castillo de Elmina, tejido kente, círculos de tambores junto al fuego',

  'rooms.beachfront-suite.name': 'Suite frente al mar',
  'rooms.beachfront-suite.tagline': 'Despertar con la marea',
  'rooms.palm-garden-villa.name': 'Villa Jardín de Palmeras',
  'rooms.palm-garden-villa.tagline': 'Acogida por el dosel',
  'rooms.ocean-view-room.name': 'Habitación con vista al mar',
  'rooms.ocean-view-room.tagline': 'Luz, lino, el horizonte sin fin',
  'rooms.signature-villa.name': 'Villa Signature',
  'rooms.signature-villa.tagline': 'Cuando sentirse en casa pide su propia puerta',
  'rooms.beach-bungalow.name': 'Bungaló de playa',
  'rooms.beach-bungalow.tagline': 'Arena en la puerta',
  'rooms.garden-room.name': 'Habitación jardín',
  'rooms.garden-room.tagline': 'Tranquila, verde y sin prisa',

  'testimonials.0.country': 'Accra, Ghana',
  'testimonials.0.quote': 'Vine un fin de semana y me fui habiendo encontrado una parte de mí que aún no conocía. La luz aquí es distinta',
  'testimonials.1.country': 'Londres, Reino Unido',
  'testimonials.1.quote': 'El lugar más silenciosamente lujoso en el que me he alojado en África Occidental · Todo es intencionado, nada estridente',
  'testimonials.2.country': 'París, Francia',
  'testimonials.2.quote': 'Un santuario en el sentido más puro · El personal te hace sentir como un amigo que vuelve, no como un huésped',
  'testimonials.3.country': 'Lagos, Nigeria',
  'testimonials.3.quote': 'KoSa es lo que podría ser cada costa africana con raíces, hermosa, digna',

  'treatments.atlantic-salt-scrub.name': 'Exfoliante de sal atlántica',
  'treatments.palm-oil-deep-tissue.name': 'Masaje profundo con aceite de palma',
  'treatments.shea-honey-wrap.name': 'Envoltura de karité y miel',
  'treatments.sound-bath.name': 'Baño de sonido junto al mar',
  'treatments.kente-crystal.name': 'Sanación con cristales Kente',
  'treatments.coastal-yoga.name': 'Yoga costero (grupo)',

  'adinkra.knonsonkonson.meaning': 'Pertenecer',
  'adinkra.knonsonkonson.line': 'Una cadena de eslabones nos sostenemos los unos a los otros',
  'adinkra.asetena.meaning': 'Buena vida',
  'adinkra.asetena.line': 'Un trono para la calma, los días lentos, el regreso',
  'adinkra.denkyem.meaning': 'Respirar',
  'adinkra.denkyem.line': 'El cocodrilo respira aire aunque vive en el agua adaptarse, ablandarse',
  'adinkra.community.meaning': 'Unión',
  'adinkra.community.line': 'Un círculo más amplio que uno mismo',

  // ─── Content Brief 2026 ─────────────────────────────────────────────────
  'nav.stay': 'Alojamiento',
  'nav.dine': 'Gastronomía',
  'nav.explore': 'Descubrir',
  'nav.experience': 'Vivir',
  'nav.plan': 'Planifica tu visita',
  'nav.events': 'Eventos y encuentros',
  'nav.story': 'Nuestra historia',

  'home.hero.headline': 'Reconecta · Recarga · Renueva',
  'home.hero.subhead': 'La vida es mejor en la playa',
  'home.hero.ctaPrimary': 'Reserva tu estancia',
  'home.hero.ctaSecondary': 'Descubre KoSa',

  'home.social.copy':
    'Apreciado por 5.000+ viajeros. 9,1/10 en Booking.com · 4,8/5 en Google · 4,7/5 en TripAdvisor',

  'home.feeling.headline': 'Así se ve bajar el ritmo',
  'home.feeling.body':
    'KoSa es un retiro costero pensado para la conexión con la naturaleza, con los demás y contigo · Un lugar donde cada amanecer y cada brisa marina invitan a detenerse · Donde la cocina es fresca y el ritmo es suave · Donde el océano no es solo un paisaje es todo lo importante',

  'home.itineraries.eyebrow': 'Itinerarios sugeridos',
  'home.itineraries.weekend': 'Escapada de fin de semana · 2 noches',
  'home.itineraries.short': 'Pausa corta · 4 noches',
  'home.itineraries.full': 'Reseteo completo · 7 noches',
  'home.itineraries.closing':
    'Cada estancia es tuya · Cuéntanos qué necesitas y nos ocupamos del resto',
  'home.itineraries.cta': 'Empezar a planificar',
  'home.itineraries.weekend.title': 'Un fin de semana junto al mar',
  'home.itineraries.weekend.body':
    'Llegada el viernes a la hora dorada · Bienvenida con bebida, cena pausada, un sueño largo · Sábado: yoga al amanecer, infusión, baño, almuerzo en la arena, masaje por la tarde, cena al fuego bajo las estrellas · Domingo: mañana suave, brunch en la terraza y traslado a tu ritmo',
  'home.itineraries.short.title': 'Una pausa corta que te reordena',
  'home.itineraries.short.body':
    'Cuatro noches para llegar de verdad · Añade media jornada en Elmina, un paseo guiado por los pueblos pesqueros, dos tratamientos de spa y una cena privada en la arena · A la tercera noche, hasta los hombros olvidan la tensión',
  'home.itineraries.full.title': 'Una semana para volver a ti',
  'home.itineraries.full.body':
    'Siete noches de aliento y sol ghanés. Sesiones de coaching, yoga diario, excursiones a Cape Coast y Kakum, mañanas de mercado, tardes de playa y noches sin prisa · Vuelve más ligero de como llegaste',

  'home.roomsTeaser.headline': 'Una habitación que pertenece a la costa',
  'home.roomsTeaser.body':
    'Despierta con los pájaros y la luz del mar · Nuestras habitaciones están pensadas para descansar sencillas, hermosas y profundamente cómodas · De los retiros en el jardín a las suites frente al océano, tu sitio te espera',
  'home.roomsTeaser.cta': 'Ver las habitaciones →',

  'home.testimonials.example':
    'Llegué agotada y me fui sintiéndome yo misma otra vez · KoSa tiene esa forma de hacer las cosas',

  'home.email.headline': 'Sé el primero en saberlo',
  'home.email.body':
    'Acceso anticipado a tarifas, nuevas experiencias y momentos tranquilos desde la costa directo a tu correo · Sin ruido · Te puedes dar de baja cuando quieras',
  'home.email.placeholder': 'tu@email.com',
  'home.email.cta': 'Suscribirme',

  'roomsPage.headline': 'Tu sitio junto al mar',
  'roomsPage.intro':
    'Cada habitación en KoSa nació de una sola pregunta: ¿cómo se siente descansar de verdad? Luz que viene del océano · Aire que trae el jardín. Una comodidad que no se anuncia simplemente te rodea',
  'roomsPage.cardCta': 'Reservar',
  'roomsPage.trust':
    'Reserva directo para la mejor tarifa · Cancelación flexible en todas las habitaciones · Una bebida de bienvenida nuestra forma de decirte gracias por venir. ¿Dudas? Estamos en WhatsApp',

  'wellnessPage.headline': 'Bienestar, al estilo KoSa',
  'wellnessPage.hero.title': 'Bienestar, al estilo KoSa',
  'wellnessPage.hero.sub': 'La naturaleza restaura encuentra el equilibrio de cuerpo y mente',
  'wellnessPage.approach.eyebrow': 'Nuestro enfoque',
  'wellnessPage.approach.title': 'Bienestar a través de la naturaleza',
  'wellnessPage.approach.body1': 'Construimos KoSa sobre una creencia sencilla: el bienestar debe ser bello, natural y estar al alcance. Aquí, el bienestar no es un programa - es el ritmo del lugar. Está en la infusión de hierbas que te espera al llegar. En el aire del mar que te recibe al amanecer. En la calma que no sabías que necesitabas.',
  'wellnessPage.approach.body2': 'Aquí el bienestar no es algo que haces. Es algo que recuerdas.',
  'wellnessPage.features.heading': 'Servicios de bienestar',
  'wellnessPage.feat.spa.title': 'Servicios de spa',
  'wellnessPage.feat.spa.body': 'Tratamientos de hierbas y masajes con ingredientes locales naturales',
  'wellnessPage.feat.coaching.title': 'Coaching de bienestar',
  'wellnessPage.feat.coaching.body': 'Orientación personalizada hacia la calma y la claridad',
  'wellnessPage.feat.tea.title': 'Bar de tés y zumos',
  'wellnessPage.feat.tea.body': 'Una selección de bebidas nutritivas para cuerpo y mente',
  'wellnessPage.feat.yoga.title': 'Yoga junto al mar',
  'wellnessPage.feat.yoga.body': 'Sesiones suaves con vistas al océano y brisa marina',
  'wellnessPage.feat.mindful.title': 'Mindfulness guiado',
  'wellnessPage.feat.mindful.body': 'Meditación y respiración en entornos naturales serenos',
  'wellnessPage.feat.nature.title': 'Conexión con la naturaleza',
  'wellnessPage.feat.nature.body': 'Paseos reparadores y experiencias inmersivas en la costa',
  'wellnessPage.holistic.eyebrow': 'Un enfoque holístico',
  'wellnessPage.holistic.title': 'Cuerpo, mente y espíritu',
  'wellnessPage.holistic.body1': 'Nuestros programas cuidan a la persona entera cuerpo, mente y espíritu · Busques relajación, energía o paz interior, nuestro equipo te guía en un viaje personalizado',
  'wellnessPage.holistic.body2': 'Del yoga al amanecer a la meditación al atardecer, de los tés a los masajes, todo se une para restaurar tu equilibrio',
  'wellnessPage.benefits.heading': 'Los beneficios del bienestar en KoSa',
  'wellnessPage.benefit.stress.title': 'Alívio del estrés',
  'wellnessPage.benefit.stress.body': 'Libera tensión con terapias naturales y un entorno tranquilo',
  'wellnessPage.benefit.renewal.title': 'Renovación física',
  'wellnessPage.benefit.renewal.body': 'Recupera vitalidad con movimiento, nutrición y descanso',
  'wellnessPage.benefit.clarity.title': 'Claridad mental',
  'wellnessPage.benefit.clarity.body': 'Gana perspectiva y enfoque con la atención plena',
  'wellnessPage.benefit.lasting.title': 'Cambio duradero',
  'wellnessPage.benefit.lasting.body': 'Desarrolla hábitos de bienestar que perduran tras tu estancia',
  'wellnessPage.intro':
    'Construimos KoSa desde una convicción simple: el bienestar debe ser hermoso, natural y al alcance · Aquí no es un programa es el ritmo del lugar · Está en la infusión que te recibe al llegar · En el aire del mar al amanecer · En el silencio que no sabías que necesitabas',
  'wellnessPage.journeys.title': 'Viajes de bienestar',
  'wellnessPage.journeys.body':
    'Experiencias guiadas de descanso, reflexión y renovación. Vengas solo o acompañado, modelamos tu tiempo aquí en torno a lo que tu cuerpo y mente realmente necesitan',
  'wellnessPage.coaching.title': 'Coaching de bienestar',
  'wellnessPage.coaching.body':
    'Acompañamiento personalizado para el equilibrio y la atención plena · Siéntate con uno de nuestros coaches, respira y empieza a encontrar el camino de vuelta a ti',
  'wellnessPage.spa.title': 'Servicios de spa',
  'wellnessPage.spa.body':
    'Masajes, aromaterapia y tratamientos herbales cada uno elegido por lo que devuelve al cuerpo · Manos que saben escuchar · Tratamientos arraigados en esta tierra',
  'wellnessPage.tea.title': 'KoSa Tea Bar',
  'wellnessPage.tea.body':
    'Infusiones y zumos frescos que nutren en silencio · Sin prisas · Sin ruido · Solo la calidez de una taza y el rumor del océano cerca',
  'wellnessPage.cta.book': 'Reservar una experiencia de bienestar',
  'wellnessPage.cta.ask': 'Cuéntanos qué necesitas',

  'diningPage.headline': 'Comer como la costa lo pensó',
  'diningPage.popular': 'Popular',
  'diningPage.intro':
    'En KoSa, la cocina forma parte del bienestar · Trabajamos con pescadores y agricultores locales gente que conoce esta tierra y estas aguas y dejamos que la frescura hable · Sabores ghaneses, preparados con cariño. Una comida que parece hecha para ti',
  'diningPage.restaurant.title': 'El restaurante',
  'diningPage.restaurant.body':
    'Donde el día empieza y la noche se calma · Nuestro restaurante sirve comida fresca y de temporada, anclada en la tradición ghanesa, con atención para cada persona en la mesa incluyendo opciones halal, platos vegetarianos y comidas que sientan tan bien como saben',
  'diningPage.restaurant.cta': 'Reservar mesa',
  'diningPage.bar.title': 'El bar',
  'diningPage.bar.body':
    'Cócteles, mocktails y zumos hechos con lo que da la temporada · Llega al atardecer · Quédate lo que la noche permita',
  'diningPage.breakfast.title': 'Desayuno',
  'diningPage.breakfast.body':
    'La primera comida del día debería sentirse como un regalo · Colorida, fresca y sin prisas opción ghanesa, continental y completa · Atendemos cualquier necesidad alimentaria solo dilo',
  'diningPage.private.title': 'Cenas privadas y especiales',
  'diningPage.private.body':
    '¿Celebras algo? Te ponemos una mesa solo para ti en la playa, bajo las estrellas, con el océano de fondo · Cuéntanos la ocasión y nos ocupamos del resto',
  'diningPage.private.cta': 'Planificar una cena especial',
  'diningPage.gallery.eyebrow': 'Recién salido de la cocina',
  'diningPage.gallery.title': 'Galería gastronómica',
  'diningPage.gallery.body': 'Una mirada de cerca a lo que llega a la mesa · pescado, cultivado y cocinado en esta costa',
  'diningPage.gallery.filter.dishes': 'Platos',
  'diningPage.gallery.filter.breakfast': 'Desayuno',
  'diningPage.gallery.filter.drinks': 'Bebidas',
  'diningPage.gallery.filter.moments': 'En la mesa',

  'experiencesPage.headline': 'Ghana empieza aquí',
  'experiencesPage.intro':
    'KoSa se sitúa al borde de uno de los litorales más bellos e históricamente ricos de África Occidental · Somos tu base, tu guía y tu casa al volver de cada aventura · Te quedes en la propiedad o te aventures más allá, hacemos que cada experiencia merezca traerla contigo',
  'experiencesPage.property.title': 'En la propiedad',
  'experiencesPage.property.body':
    'El océano está ahí mismo · Lo mismo la piscina, el jardín, la esterilla de yoga y la hamaca con tu nombre · Los días en los que solo quieres ser, KoSa basta y sobra',
  'experiencesPage.ghana.title': 'Hacia Ghana',
  'experiencesPage.ghana.body':
    'Cuando estés listo para explorar, nosotros también. Cape Coast Castle · Elmina · Kakum · Los pueblos pesqueros · Los mercados · Las historias que merecen conocerse · Te conectamos con guías que conocen estos lugares profundamente no como turistas, sino como gente que vive aquí',
  'experiencesPage.cta': 'Planificar tus experiencias',

  'eventsPage.headline': 'Siempre hay algo que hacer',
  'eventsPage.enquire': 'Reservar',
  'eventsPage.transport': 'Transporte incluido',
  'eventsPage.empty': 'Aún no hay nada en esta categoría.',

  'eventsPage.intro':
    'Algunos momentos merecen un escenario a su altura · KoSa se extiende entre el océano y el jardín un telón natural para celebraciones que se sienten reales, retiros que de verdad restauran y encuentros donde uno llega como colega y se marcha como algo más cercano',
  'eventsPage.weddings.title': 'Bodas y celebraciones',
  'eventsPage.weddings.body':
    'Una boda en KoSa es esa ceremonia en la playa que siempre imaginaste el sonido de las olas, la calidez de la costa y las personas que más amas reunidas en un solo lugar precioso · Cuidamos cada detalle · Tú solo aparece y celebra',
  'eventsPage.weddings.cta': 'Empezar a planificar mi boda',
  'eventsPage.retreats.title': 'Retiros de bienestar',
  'eventsPage.retreats.body':
    'KoSa nació para restaurar · Los retiros en grupo intensivos de yoga, fines de semana de mindfulness o programas a medida encuentran aquí su hogar natural · Ponemos el espacio, la calma y el apoyo · Tú pones la intención',
  'eventsPage.corporate.title': 'Retiros corporativos y reuniones offsite',
  'eventsPage.corporate.body':
    'Las mejores ideas no nacen en salas de reuniones · Trae a tu equipo a la costa, sal de lo cotidiano y observa lo que pasa cuando por fin se puede pensar · KoSa ofrece espacios de reunión, alojamiento para grupos y experiencias de equipo pensadas para reconectar a las personas detrás del trabajo',
  'eventsPage.corporate.cta': 'Consultar reservas de grupo',
  'eventsPage.form.name': 'Nombre',
  'eventsPage.form.company': 'Empresa',
  'eventsPage.form.type': 'Tipo de evento',
  'eventsPage.form.dates': 'Fechas',
  'eventsPage.form.guests': 'Número de invitados',
  'eventsPage.form.message': 'Mensaje',
  'eventsPage.form.response': 'Respondemos en menos de 24 horas',

  'planPage.headline': 'Todo lo que necesitas para llegar listo',
  'planPage.intro':
    'Queremos que tu experiencia KoSa empiece antes de llegar · Aquí abajo encontrarás todo para preparar tu estancia itinerarios sugeridos, cómo llegar, preguntas frecuentes y la información práctica que de verdad marca la diferencia',
  'planPage.experiences.eyebrow': 'Qué hacer aquí',
  'planPage.experiences.body':
    'Experiencias reales en KoSa, de la orilla a la costa elige lo que te llame',
  'planPage.experiences.cta': 'Ver todas las experiencias',
  'planPage.itineraries.eyebrow': 'Itinerarios sugeridos',
  'planPage.itineraries.body':
    'Tres estancias pre-armadas en formato día a día no agendas, sino historias · Cada una termina con: esta es una versión de tu KoSa. La tuya será la tuya la moldeamos al llegar o nos cuentas qué necesitas antes de venir',
  'planPage.itineraries.cta1': 'Reservar esta estancia',
  'planPage.itineraries.cta2': 'Personalizar mi plan',
  'planPage.getting.title': 'Cómo llegar',
  'planPage.getting.body':
    'KoSa Beach Resort está en la Región Central de Ghana, a unos 25 km de Elmina y 30 km del castillo de Cape Coast · Desde el aeropuerto internacional Kotoka de Accra, el viaje es de unas 3 horas y podemos organizar tu traslado para que el descanso empiece al aterrizar',
  'planPage.getting.cta': 'Reservar traslado al aeropuerto',
  'planPage.faqs.title': 'Preguntas frecuentes',
  'planPage.faq.checkin.q': '¿Qué horario tiene el check-in y check-out?',
  'planPage.faq.checkin.a':
    'Check-in desde las 14:00 y check-out hasta las 11:00. Somos flexibles cuando podemos solo pregúntanos',
  'planPage.faq.cancellation.q': '¿Cuál es la política de cancelación?',
  'planPage.faq.cancellation.a':
    'Reembolso del 50 % en cancelaciones recibidas con al menos 20 días de antelación; después no hay reembolso · Las reservas en temporada alta no son reembolsables · Las reservas pueden modificarse hasta 48 horas antes de la llegada un depósito del 50 % confirma la reserva',
  'planPage.faq.airport.q': '¿Ofrecen traslados al aeropuerto?',
  'planPage.faq.airport.a':
    'Sí. Traslados privados y cómodos desde el aeropuerto internacional Kotoka de Accra · Reserva con tiempo para esperarte a la llegada',
  'planPage.faq.halal.q': '¿Tienen comida halal?',
  'planPage.faq.halal.a':
    'Sí. Hay opciones halal en toda la carta · Vegetarianos, veganos y otras necesidades atendidos con cariño',
  'planPage.faq.children.q': '¿Puedo venir con niños?',
  'planPage.faq.children.a':
    'Por supuesto · KoSa es tranquilo pero family-friendly · Cuéntanos las edades y preparamos lo necesario',
  'planPage.faq.payment.q': '¿Qué métodos de pago aceptan?',
  'planPage.faq.payment.a':
    'Las principales tarjetas, mobile money y transferencia · Un depósito confirma la reserva; el resto a la llegada',
  'planPage.faq.swim.q': '¿Se puede nadar en la playa?',
  'planPage.faq.swim.a':
    'El Atlántico tiene corrientes te avisamos siempre de las horas más seguras · La piscina está abierta todo el día',
  'planPage.faq.wellness.q': '¿Puedo reservar tratamientos por adelantado?',
  'planPage.faq.wellness.a':
    'Sí mejor hacerlo · Spa, coaching y sesiones de grupo se llenan rápido · Dinos qué te apetece antes de venir',

  'aboutPage.headline': 'Dos décadas junto al mar. Y aún así, cada huésped se siente como el primero',
  'aboutPage.opening':
    'KoSa Beach Resort no nació de un plan de negocio. Nació de una convicción - que la costa ghanesa es uno de los lugares más restauradores del mundo, y que todos los que vienen aquí deberían poder sentirlo. Durante más de veinte años, hemos mantenido esa convicción.',
  'aboutPage.continued':
    'Somos parte del Akwaaba Stays Hospitality Group - una familia de establecimientos en Ghana y África Occidental que comparten un compromiso con la hospitalidad enraizada en el cuidado, la comunidad y los lugares que llamamos hogar. KoSa es donde ese compromiso vive más cerca del agua.',
  'aboutPage.values': 'Nuestros valores',
  'aboutPage.values.authenticity.title': 'Autenticidad',
  'aboutPage.values.authenticity.body':
    'Hospitalidad honesta que refleja el ritmo real de esta costa · Sin actuaciones · Sin pretensiones · KoSa tal como es y como siempre ha sido',
  'aboutPage.values.community.title': 'Comunidad',
  'aboutPage.values.community.body':
    'Trabajamos codo con codo con quienes nos rodean pescadores, agricultores y artesanos cuyo trabajo y saber hacen lo que KoSa es · Cuando te quedas aquí, sus vidas también crecen',
  'aboutPage.values.wellness.title': 'Bienestar',
  'aboutPage.values.wellness.body':
    'Nutrir cuerpo y mente con buena comida, coaching y calma · Creemos que el bienestar debería ser hermoso, natural y al alcance no un lujo para unos pocos',
  'aboutPage.values.sustainability.title': 'Sostenibilidad',
  'aboutPage.values.sustainability.body':
    'Respeto por la costa, por la tierra y por las vidas que sostiene · Somos guardianes de este lugar responsables ante él y ante quienes vendrán después',
  'aboutPage.values.legacy.title': 'Legado',
  'aboutPage.values.legacy.body':
    'Dos décadas de conexión genuina y cuidado continuo junto al mar · El océano nos mantiene humildes · Los huéspedes que vuelven nos mantienen en pie',
  'aboutPage.closing.headline': 'Ven y compruébalo por ti mismo',
  'aboutPage.closing.body':
    'Podríamos contarte más pero KoSa se vive mejor de lo que se cuenta · El aire marino, la cocina, las personas, el silencio · Hay algo aquí que no cabe en palabras · Pero te espera',
  'aboutPage.closing.ctaBook': 'Reservar mi estancia',
  'aboutPage.closing.ctaGet': 'Contáctanos',

  'exit.headline': 'Consigue nuestras tarifas antes de que se llenen',
  'exit.body':
    'Acceso anticipado a tarifas de temporada, semanas tranquilas y nuevas experiencias · Una vez al mes, nada más',
  'exit.cta': 'Envíame novedades',
  'exit.placeholder': 'tu@email.com',
  'exit.dismiss': 'No, gracias',
  'exit.thanks': 'Gracias · Estate atento a tu bandeja de entrada',

  'common.bookYourStay': 'Reserva tu estancia',
  'common.exploreKosa': 'Descubre KoSa',
  'common.whatsapp': 'WhatsApp',
  'common.getInTouch': 'Contáctanos',
  'common.startPlanning': 'Empezar a planificar',
  'common.readMore': 'Leer más',

  'footer.quickLinks': 'Enlaces rápidos',
  'footer.reviews': 'Querido por nuestros huéspedes en',
  'footer.address': 'Beach Road No.1, Ampenyi, Elmina, Ghana',
  'footer.group': 'Una propiedad del Akwaaba Stays Hospitality Group',

  // ─── Full-coverage UI strings (2026 i18n sweep) ────────────────────────
  'newsletter.placeholder': 'tu@ejemplo.com',
  'newsletter.success': 'Bienvenido a la orilla',
  'newsletter.error': 'Algo salió mal',
  'newsletter.failed': 'No se pudo completar la suscripción',
  'newsletter.ariaEmail': 'Correo electrónico',
  'newsletter.ariaSubscribe': 'Suscribirme',

  'home.hero.location': 'Elmina · Ghana',
  'home.itineraries.heading': 'Algunas formas de pasar tu tiempo',

  'roomsPage.searchPlaceholder': 'Buscar habitaciones, camas, vista al mar…',
  'roomsPage.resultsOne': '1 tipo de habitación',
  'roomsPage.resultsMany': '{n} tipos de habitación',
  'roomsPage.searchEmpty': 'Ninguna habitación coincide prueba otra palabra o filtro',
  'roomsPage.occupied': 'Reservado',
  'roomsPage.upTo': 'Hasta',
  'roomsPage.guestsUnit': 'huéspedes',

  'roomDetail.amenities': 'Servicios',
  'roomDetail.from': 'Desde',
  'roomDetail.taxesIncluded': 'Impuestos y desayuno incluidos',
  'roomDetail.reserve': 'Reservar',
  'roomDetail.askConcierge': 'Pregunta al conserje',
  'roomDetail.freeCancellation': 'Cancelación gratuita hasta 48 horas antes de la llegada',
  'roomDetail.otherRooms': 'Otras habitaciones que podrían gustarte',
  'roomDetail.descFallback':
    'Un refugio sereno lino suave, palma tejida, cerámica hecha a mano · Una habitación que respira con la marea',
  'roomDetail.amenity.balcony': 'Balcón frente al mar',
  'roomDetail.amenity.bed': 'Cama king-size con sábanas de lino',
  'roomDetail.amenity.shower': 'Ducha de lluvia al aire libre',
  'roomDetail.amenity.local': 'Amenidades de origen local',
  'roomDetail.amenity.wifi': 'WiFi de alta velocidad',
  'roomDetail.amenity.ac': 'Aire acondicionado + ventilador de techo',
  'roomDetail.amenity.breakfast': 'Desayuno diario incluido',
  'roomDetail.amenity.welcome': 'Rituales de bienvenida',

  'wellnessPage.heroSub': 'Abierto a visitantes de día y a huéspedes del resort',
  'wellnessPage.enquiry.eyebrow': 'Consultar',
  'wellnessPage.enquiry.title': 'Sin necesidad de alojarse',
  'wellnessPage.enquiry.body': 'Dinos qué te atrae y lo organizamos ya sea que te alojes o vengas por el día',
  'wellnessPage.enquiry.point1': 'Visitantes de día bienvenidos ven por un tratamiento o sesión',
  'wellnessPage.enquiry.point2': 'Confirmamos el horario por correo o WhatsApp',
  'wellnessPage.enquiry.point3': 'Parejas y grupos pequeños posibles',
  'wellnessForm.interest': 'Lo que te interesa',
  'wellnessForm.choose': 'Elige un programa',
  'wellnessForm.notSure': 'Aún no estoy seguro - asesórame',
  'wellnessForm.guestType': '¿Te alojas con nosotros?',
  'wellnessForm.day': 'Visitante de día',
  'wellnessForm.staying': 'Alojado en KoSa',
  'wellnessForm.date': 'Fecha preferida',
  'wellnessForm.guests': 'Número de personas',
  'wellnessForm.message': '¿Algo más?',
  'wellnessForm.submit': 'Enviar consulta',
  'wellnessForm.whatsapp': 'Enviar por WhatsApp',
  'wellnessForm.thankTitle': 'Gracias',
  'wellnessForm.thankBody': 'Hemos recibido tu consulta y te contactaremos pronto',
  'wellnessForm.waIntro': '¡Hola KoSa! Quisiera consultar sobre bienestar:',
  'wellnessPage.treatmentsHeading': 'Tratamientos y sesiones',
  'wellnessPage.treatmentsIntro': 'Explora según lo que necesitas - masajes y trabajo corporal en el KoSa Health Spa, o los rituales y retiros más profundos de O2 Wellness.',
  "quote.ocean": "El océano no se apura. Tú tampoco deberías",
  "quote.stop": "Así se siente parar por fin",
  'home.welcome.eyebrow': 'Akwaba · Bienvenido a casa',
  'home.welcome.heading': 'Hay lugares que se visitan A KoSa se vuelve a casa',
  'home.welcome.body': 'Mira cómo se despliega una bienvenida en KoSa: los tambores en la arena, la tela blanca en la brisa, una ceremonia de nombramiento junto al océano. Así se siente llegar.',
  'home.welcome.cta': 'Reproducir el vídeo',
  'home.welcome.play': 'Reproducir el vídeo Welcome Home',
  "wellnessPage.hero.line": "No necesitas un programa. Necesitas permiso para parar",
  "wellnessPage.offerings.eyebrow": "Bienestar KoSa",
  "wellnessPage.yoga.title": "Yoga junto al mar",
  "wellnessPage.yoga.body": "Movimiento suave sobre la arena, la respiración y el océano al mismo compás. Ven como estás; todos los niveles son bienvenidos.",
  "wellnessPage.journeys.sense": "No se programa nada que no hayas elegido. El día se adapta a ti, no al revés.",
  "wellnessPage.coaching.sense": "Te reúnes con tu coach la mañana siguiente a tu llegada. Solo para conversar.",
  "wellnessPage.spa.sense": "Las salas de tratamiento se abren al jardín. Oirás el canto de los pájaros.",
  "wellnessPage.tea.sense": "Preparamos infusiones con hierbas de la propiedad. Algunos huéspedes piden la receta.",
  "wellnessPage.yoga.sense": "Las sesiones son a las 7 de la mañana, cuando la luz aún es suave y la playa está tranquila.",
  "wellnessPage.day.eyebrow": "Un día aquí",
  "wellnessPage.day.heading": "Cómo es un día de bienestar en KoSa",
  "wellnessPage.day.intro": "Sin horarios que cumplir. Solo un ritmo suave que sigues tanto como quieras.",
  "wellnessPage.day.s1.time": "Al amanecer",
  "wellnessPage.day.s1.text": "Té en la terraza mientras sale la luz. Sin prisa, sin nada que ser todavía.",
  "wellnessPage.day.s2.time": "Temprano",
  "wellnessPage.day.s2.text": "Un paseo lento por la playa, con la arena aún fresca y la orilla en calma.",
  "wellnessPage.day.s3.time": "7 a. m.",
  "wellnessPage.day.s3.text": "Yoga junto al mar, la respiración y las olas al mismo ritmo.",
  "wellnessPage.day.s4.time": "A media mañana",
  "wellnessPage.day.s4.text": "Un tratamiento de spa con las puertas del jardín abiertas y el canto de los pájaros entrando.",
  "wellnessPage.day.s5.time": "Al mediodía",
  "wellnessPage.day.s5.text": "Almuerzo en la terraza, recién hecho, disfrutado despacio a la sombra.",
  "wellnessPage.day.s6.time": "Por la tarde",
  "wellnessPage.day.s6.text": "Una sesión de coaching, o simplemente una hamaca y un libro. Lo que necesites.",
  "wellnessPage.day.s7.time": "Al anochecer",
  "wellnessPage.day.s7.text": "Cena junto a la hoguera mientras las estrellas aparecen sobre el agua.",
  "wellnessPage.closing.eyebrow": "Bienestar a tu manera",
  "wellnessPage.closing.headline": "Dinos qué necesitas. Nosotros nos encargamos del resto",
  "wellnessPage.closing.body": "Sin programas fijos, sin presión. Dinos cómo quieres sentirte y daremos forma a tu estancia en torno a ello.",
  "wellnessPage.closing.cta": "Escríbenos por WhatsApp",

  // Experiences - actividades diarias gratuitas
  'experiencesPage.daily.eyebrow': 'Cada día, incluido',
  'experiencesPage.daily.heading': 'Actividades diarias gratuitas',
  'experiencesPage.daily.intro':
    'Cada día en KoSa tiene su ritmo. Todas las actividades son gratuitas para nuestros huéspedes: únete a las que quieras o simplemente tómate el tiempo de descansar.',
  'experiencesPage.daily.free': 'Gratis',
  'experiencesPage.daily.footnote':
    'Todas las actividades son gratuitas para los huéspedes. Apúntate en recepción. El programa puede variar.',

  // Wellness - paquetes
  'planPage.packages.eyebrow': 'Estancias diseñadas',
  'planPage.packages.heading': 'Paquetes de estancia',
  'planPage.packages.intro':
    'Todo organizado. Solo tienes que llegar. Cada paquete incluye desayuno diario, un masaje de bienvenida de 10 minutos a la llegada y acceso completo a la playa.',
  'planPage.packages.enquireRates': 'Consulta nuestras tarifas actuales',
  'planPage.packages.enquire': 'Consultar',

  // Wellness - extras
  'wellnessPage.enhance.eyebrow': 'Extras',
  'wellnessPage.enhance.heading': 'Realza tu estancia',
  'wellnessPage.enhance.intro':
    'Añade algo especial a cualquier paquete o reserva de habitación. Organízalo en recepción, por teléfono o al hacer tu reserva.',
  'wellnessPage.enhance.cta': 'Pregunta por los extras',
  'wellnessPage.enhance.enquire': 'Consultar',
  'wellnessPage.beginHeadline': 'Empieza tu regreso a ti',

  'experiencesPage.buildDay': 'Pídenos que diseñemos tu día perfecto',

  'contactPage.eyebrow': 'Contacto',
  'contactPage.title': 'Hablemos, sin más',
  'contactPage.whereToFind': 'Dónde encontrarnos',
  'contactPage.whatsappUs': 'Escríbenos por WhatsApp',
  'contactPage.mapTitle': 'Mapa de ubicación de KoSa',

  'bookPage.eyebrow': 'Prepara tu regreso',
  'bookPage.title': 'Reserva tu estancia',
  'bookPage.subtitle': 'Mejor tarifa, cancelación gratuita hasta 48 horas, confirmación inmediata',

  'book.step.dates': 'Fechas',
  'book.step.room': 'Habitación',
  'book.step.guest': 'Datos',
  'book.step.confirm': 'Confirmar',
  'book.datesHeading': '¿Cuándo te gustaría alojarte?',
  'book.checkIn': 'Llegada',
  'book.checkOut': 'Salida',
  'book.adults': 'Adultos',
  'book.children': 'Niños',
  'book.continue': 'Continuar',
  'book.editDates': 'Editar fechas',
  'book.guestHeading': 'Tus datos',
  'book.firstName': 'Nombre',
  'book.lastName': 'Apellidos',
  'book.email': 'Correo electrónico',
  'book.phone': 'Teléfono',
  'book.country': 'País',
  'book.notes': 'Notas (opcional)',
  'book.confirmReservation': 'Confirmar reserva',
  'book.guests': 'Huéspedes',
  'book.adultsUnit': 'adultos',
  'book.childrenUnit': 'niños',
  'book.nights': 'Noches',
  'book.nightsUnit': 'noches',
  'book.total': 'Total',
  'book.taxesLine': 'Impuestos y desayuno incluidos · Cancelación gratuita hasta 48 horas',
  'book.doneHeading': 'Akwaaba tenemos tu reserva',
  'book.confirmationLabel': 'Confirmación:',
  'book.doneBody':
    'Hemos enviado una confirmación a tu correo · Nuestro conserje te escribirá en un día con los detalles de llegada y un ritual de bienvenida',
  'book.returnHome': 'Volver al inicio',
  'book.whatsappUs': 'Escríbenos por WhatsApp',
  'book.errRequired': 'Obligatorio',
  'book.errEmail': 'Correo válido requerido',
  'book.failed': 'No se pudo completar la reserva',

  'eventsPage.form.optWedding': 'Boda',
  'eventsPage.form.optRetreat': 'Retiro de bienestar',
  'eventsPage.form.optCorporate': 'Encuentro corporativo',
  'eventsPage.form.optOther': 'Otra celebración',
  'eventsPage.form.thankYou': 'Gracias',
  'eventsPage.form.error': 'Indica tu nombre y un correo válido',
  'eventsPage.form.sendError': 'No se pudo enviar tu consulta',
  'eventsPage.form.sending': 'Enviando…',

  'emailCapture.invalid': 'Indica un correo válido',
  'emailCapture.error': 'No se pudo completar la suscripción',

  'tour.viewRooms': 'Ver habitaciones',
  'tour.fullscreen': 'Pantalla completa',
  'tour.loading': 'Cargando',
  'tour.loadingTour': 'Cargando el tour…',
  'tour.noWebgl': 'Tu dispositivo no admite la vista en 360° disfruta de una galería de imágenes',

  'common.email': 'Correo electrónico',
  'common.returnHome': 'Volver al inicio',
  'error.headline': 'Una pequeña ola nos volcó',
  'error.body': 'Inténtalo de nuevo estamos recuperando el equilibrio',
  'error.retry': 'Reintentar',
  'notFound.headline': 'Perdidos en el mar',
  'notFound.body': 'La página que buscas se ha alejado · Deja que te llevemos a casa',
  'notFound.concierge': 'Hablar con el conserje',
  'experiencesPage.detailFallback': 'Las sesiones son íntimas seis personas como máximo · Los horarios cambian suavemente con la marea y el sol · Habla con nuestro conserje para reservas privadas, rituales a medida y propuestas de temporada',
  'experiencesPage.addToStay': 'Añadir a tu estancia',
  'common.speakConcierge': 'Hablar con el conserje',
  'blogPage.eyebrow': 'Cartas desde la orilla',
  'blogPage.comingSoon': 'Cartas desde la orilla muy pronto',
  'blogPage.subtitle': 'Historias, guías y notas tranquilas de nuestro rincón de la costa',
  'blogPage.featured': 'Destacado',
  'blogPage.readStory': 'Leer la historia',
  'blogPage.readMins': 'min de lectura',
  'blogPage.moreStories': 'Más del diario',
  'blogPage.backToJournal': 'Volver al diario',
  'blogPage.cta.headline': 'Ven a sentirlo por ti mismo',
  'blogPage.cta.body': 'La orilla te espera cuando estés listo',
  'eventsPage.form.datesPlaceholder': 'p. ej. 12–15 ago 2026',
  'eventsPage.form.guestsPlaceholder': 'p. ej. 40',
  'a11y.close': 'Cerrar',
  'a11y.previous': 'Anterior',
  'a11y.next': 'Siguiente',
  'a11y.openMenu': 'Abrir menú',
  'a11y.closeMenu': 'Cerrar menú',
  'a11y.scrollNext': 'Ir a la siguiente sección',
  'a11y.resortChat': 'Chat del resort',
  'gallery.empty': 'Aún no hay imágenes en la galería',
  'chat.errorEmpty': "Akwaaba estoy aquí, pero mi mente de conserje se quedó en silencio un momento · Inténtalo de nuevo o escríbenos por WhatsApp al +233 24 437 5432",
  'chat.errorTimeout': 'Tardó más de lo esperado inténtalo de nuevo o escríbenos por WhatsApp al +233 24 437 5432',
  'chat.errorGeneric': "Ahora mismo no consigo acceder a la información del resort · Escríbenos por WhatsApp al +233 24 437 5432 y te responderemos enseguida",
  'alt.heroShoreline': 'Vista aérea de la costa de KoSa, Elmina, Ghana',
  'alt.feelingHammock': 'Una hamaca tranquila entre las palmeras de KoSa',
  'alt.aboutSea': 'KoSa Beach Resort junto al mar',
  'aboutPage.enrichedSetting': 'Se refleja en los pescadores con quienes trabajamos, los agricultores que abastecen nuestra cocina, los artesanos cuyas manos dieron forma a lo que ves a tu alrededor.',
  'aboutPage.enrichedEco': 'Nunca quisimos construir un resort de lujo. Quisimos crear un lugar donde se pudiera sentir la costa tal como es de verdad - sin prisa, generosa, viva.',
  'diningPage.bar.name': 'Kooki Beach Bar',
  'diningPage.bar.hours': 'Cócteles hasta las 22:00 h',
  'diningPage.restaurant.hours': 'Desayuno, almuerzo y cena · de 7:00 a 21:00, todos los días',
  'experiencesPage.signature.eyebrow': 'Experiencias destacadas',
  'experiencesPage.signature.headline': 'Unas pocas cosas que hacer, con quien las conoce',
  'experiencesPage.signature.ampenyi.title': 'Paseo por el pueblo de Ampenyi',
  'experiencesPage.signature.ampenyi.body': 'Un paseo guiado por Ampenyi conoce a los pescadores, observa la llegada de la pesca y (si está) saluda al jefe del pueblo',
  'experiencesPage.signature.capeCoast.title': 'Castillo de Cape Coast',
  'experiencesPage.signature.capeCoast.body': 'Un trayecto corto hacia el este · Un peso que merece la pena cargar lleva agua, deja tiempo para el silencio después',
  'experiencesPage.signature.elmina.title': 'Castillo de Elmina',
  'experiencesPage.signature.elmina.body': 'A veinte minutos de KoSa. Una de las construcciones europeas más antiguas de África Occidental, para recorrerla despacio',
  'experiencesPage.signature.kakum.title': 'Parque Nacional Kakum',
  'experiencesPage.signature.kakum.body': 'Selva, pasarelas en el dosel, mariposas que solo encontrarás aquí. Salida temprano, vuelta para cenar',
  'experiencesPage.signature.massage.title': 'Masaje tailandés junto al mar',
  'experiencesPage.signature.massage.body': 'Elige dónde: en la playa con las olas, en el jardín bajo las palmeras o en la intimidad de tu habitación',
  'experiencesPage.signature.horse.title': 'Equitación y joyería artesanal',
  'experiencesPage.signature.horse.body': 'Paseos a caballo a la hora dorada, talleres de joyería con artesanos locales pequeños gestos que convierten una estancia en un recuerdo',
};

// ─── DUTCH ────────────────────────────────────────────────────────────────────
// Natural luxury-hospitality Dutch formal "u" register, warm tone, no awkward compounds.
const nlBase: Partial<Record<keyof typeof en, string>> = {
  'nav.rooms': 'Kamers',
  'nav.experiences': 'Belevenissen',
  'nav.dining': 'Culinair',
  'nav.wellness': 'Wellness',
  'nav.gallery': 'Galerij',
  'nav.virtualTour': 'Virtuele tour',
  'nav.about': 'Het resort',
  'nav.blog': 'Verhalen',
  'nav.contact': 'Contact',
  'nav.book': 'Boek nu',
  'nav.bookYourStay': 'Reserveer uw verblijf',

  'hero.location': 'Elmina · Ghana · West-Afrika',
  'hero.headline': 'Het leven is beter aan het strand',
  'hero.tagline': 'Ademen · Kust · Thuiskomen',
  'hero.bookCta': 'Reserveer uw verblijf',
  'hero.exploreCta': 'Ontdek het resort',
  'hero.scrollAria': 'Naar het volgende onderdeel',

  'intro.eyebrow': 'Welkom · Akwaaba',
  'intro.headline.l1': 'KoSa is geen hotel',
  'intro.headline.l2': 'Het is de plek waar je steeds terugkomt',
  'intro.body':
    'Aan een rustig stuk Atlantische kust in Elmina, waar palmbomen meebuigen met de wind en de oceaan zijn eigen tempo bepaalt, bouwden wij een plek om tot rust te komen · Eco-luxe in alles, geworteld in Ghanees vakmanschap, gedragen door de rituelen van wie er dagelijks voor zorgt',
  'intro.script': 'Gewoon ademen',
  'intro.philosophyCta': 'Onze filosofie de 5 dimensies van het zijn',

  'rooms.eyebrow': 'Logeer bij ons',
  'rooms.headline': 'Boutique aan de Atlantische kust',
  'rooms.statRooms': 'Kamertypes',
  'rooms.statSuites': 'Garden View',
  'rooms.statBeach': 'Strand',
  'rooms.filter.all': 'Alles',
  'rooms.filter.beachView': 'Zeezicht',
  'rooms.filter.palmSide': 'Palmenzijde',
  'rooms.filter.suite': 'Garden View',
  'rooms.priceFrom': 'Vanaf',
  'rooms.perNight': 'nacht',
  'rooms.view': 'Bekijken',

  'experiences.eyebrow': 'Beleef het ten volle',
  'experiences.headline': 'Vier manieren om wortel te schieten',
  'experiences.blurb':
    'Van yoga bij zonsopgang op de rotsen tot trommelkringen rond het vuur elke dag bij KoSa brengt je een stukje dichter bij jezelf',
  'experiences.discover': 'Ontdek',

  'wellness.bgWord': 'Gewoon ademen',
  'wellness.eyebrow': 'Ademen',
  'wellness.headline.l1': 'Spa, yoga, klank',
  'wellness.headline.l2': 'de vijf dimensies van het zijn',
  'wellness.blurb':
    'Behandelingen op basis van West-Afrikaanse ingrediënten shea, palm, zeezout in open paviljoens waar alleen de branding klinkt',
  'wellness.bookCta': 'Behandeling reserveren',

  'testimonials.via': 'via',

  'testimonials.eyebrow': 'Ze komen terug',
  'testimonials.headline': 'Stemmen vanaf de kust',

  'booking.eyebrow': 'Plan uw terugkeer',
  'booking.headline.l1': 'De kust wacht op u',
  'booking.headline.l2': 'Komt u?',
  'booking.blurb':
    'Realtime beschikbaarheid, beste tarief gegarandeerd, en een warm welkom bij aankomst · Boek in minder dan twee minuten',
  'booking.badgeSecure': 'Veilig betalen',
  'booking.badgeBestRate': 'Beste prijs gegarandeerd',
  'booking.badgeCancel': 'Gratis annuleren',
  'booking.formTitle': 'Beschikbaarheid bekijken',
  'booking.checkIn': 'Aankomst',
  'booking.checkOut': 'Vertrek',
  'booking.adults': 'Volwassenen',
  'booking.adult': 'volwassene',
  'booking.adultsPlural': 'volwassenen',
  'booking.children': 'Kinderen',
  'booking.child': 'kind',
  'booking.childrenPlural': 'kinderen',
  'booking.submit': 'Beschikbaarheid bekijken',
  'booking.submitting': 'Even kijken…',

  'footer.tagline': 'Het leven is beter aan het strand',
  'footer.about':
    'Een eco-luxe strandresort aan de Atlantische kust van Ghana, waar het ritme van de zee samensmelt met de warmte van Akan-gastvrijheid',
  'footer.explore': 'Ontdek',
  'footer.connect': 'Volg ons',
  'footer.newsletter': 'Blijf verbonden',
  'footer.newsletterBlurb': 'Seizoenspost vanaf het strand · Niets meer, niets minder',
  'footer.copyright': 'Alle rechten voorbehouden',
  'footer.privacy': 'Privacy',
  'footer.terms': 'Voorwaarden',
  'footer.admin': 'Admin',

  'chat.cta': 'Praat met Abena',
  'chat.title': 'Abena',
  'chat.subtitle': 'Digitale conciërge · antwoordt vrijwel direct',
  'chat.greeting':
    'Akwaaba ik ben Abena, uw conciërge bij KoSa. Vraag me gerust alles over het resort, onze kamers of het plannen van uw verblijf',
  'chat.placeholder': 'Stel uw vraag…',
  'chat.send': 'Versturen',
  'chat.close': 'Sluiten',
  'chat.suggested.rooms': 'Welke kamers zijn beschikbaar?',
  'chat.suggested.directions': 'Hoe reis ik van Accra naar KoSa?',
  'chat.suggested.spa': 'Vertel me over de spa',
  'chat.suggested.included': 'Wat is inbegrepen?',

  'contact.name': 'Naam',
  'contact.email': 'E-mailadres',
  'contact.phone': 'Telefoon (optioneel)',
  'contact.subject': 'Onderwerp (optioneel)',
  'contact.message': 'Bericht',
  'contact.send': 'Verstuur mijn vraag',
  'contact.sending': 'Bezig met versturen…',
  'contact.thankTitle': 'Dank u wel',
  'contact.thankBody': 'We reageren binnen een dag meestal sneller',
  'contact.error.name': 'Vul uw naam in',
  'contact.error.email': 'Vul een geldig e-mailadres in',
  'contact.error.message': 'Vertel ons iets meer',
  'contact.error.generic': 'Verzenden mislukt, probeer het opnieuw',

  'cultural.eyebrow': 'Adinkra · Symbolen van het Akan-volk',
  'cultural.headline': 'Geworteld in Ghana',
  'cultural.description': 'Deze vier symbolen dragen we door het hele resort gegraveerd in hout, geweven in linnen, voelbaar in elk welkom',
  'cultural.footer': 'Akwaaba u bent hier welkom',

  'gallery.eyebrow': 'In beeld',
  'gallery.headline': 'Galerij',
  'gallery.description': 'Een rustige blik op het resort en de kustlijn die het omarmt',
  'gallery.loadMore': 'Meer tonen',

  'tour.eyebrow': '360° virtuele tour',
  'tour.headline': 'Stap binnen · Ontdek op uw gemak',
  'tour.description': 'Wandel door de suites, de spa, de kust vanuit elke plek ter wereld',
  'tour.cta': 'Tour starten',
  'tour.footer': 'Via Google Drive · 6 scènes',

  'common.learnMore': 'Meer weten',
  'common.discover': 'Ontdek',
  'common.bookNow': 'Boek nu',
  'common.viewAll': 'Alles bekijken',
  'common.languageEn': 'English',
  'common.languageFr': 'Français',
  'common.languageEs': 'Español',
  'common.languageNl': 'Nederlands',
  'common.languageDe': 'Deutsch',
  'common.toggleLanguage': 'Taal wisselen',
  'common.selectLanguage': 'Kies uw taal',

  'experiences.wellness.label': 'Wellness',
  'experiences.wellness.title': 'Rituelen van de kust',
  'experiences.wellness.description': 'Trage ochtenden, met zout verwarmde massages, ademen tussen de palmen · Een terugkeer naar het lichaam',
  'experiences.ocean.label': 'Op zee',
  'experiences.ocean.title': 'Waar de Atlantische Oceaan zingt',
  'experiences.ocean.description': 'Suppen bij zonsopgang, wandelen door vissersdorpen, snorkelen op riffen die alleen de lokale bevolking kent',
  'experiences.dining.label': 'Culinair',
  'experiences.dining.title': 'De kust op het bord',
  'experiences.dining.description': 'Tandbaars op open vuur, glazuur van palmwijn, kruiden uit de tuin geplukt bij schemering · Een verhaal op elk bord',
  'experiences.cultural.label': 'Culturele rituelen',
  'experiences.cultural.title': 'Geworteld in Ghana',
  'experiences.cultural.description': 'Spiegelingen van het kasteel van Elmina, kente-weefsels, trommelkringen rond het vuur',

  'rooms.beachfront-suite.name': 'Strandsuite',
  'rooms.beachfront-suite.tagline': 'Wakker worden met het getij',
  'rooms.palm-garden-villa.name': 'Palmtuin Villa',
  'rooms.palm-garden-villa.tagline': 'Geborgen onder de bladeren',
  'rooms.ocean-view-room.name': 'Kamer met zeezicht',
  'rooms.ocean-view-room.tagline': 'Licht, linnen, een eindeloze horizon',
  'rooms.signature-villa.name': 'Signature Villa',
  'rooms.signature-villa.tagline': 'Voor wie thuiskomen een eigen poort verdient',
  'rooms.beach-bungalow.name': 'Strandbungalow',
  'rooms.beach-bungalow.tagline': 'Zand voor de drempel',
  'rooms.garden-room.name': 'Tuinkamer',
  'rooms.garden-room.tagline': 'Rustig, groen, zonder haast',

  'testimonials.0.country': 'Accra, Ghana',
  'testimonials.0.quote': 'Ik kwam voor een weekend en vertrok met een stuk van mezelf dat ik nog niet kende · Het licht is hier anders',
  'testimonials.1.country': 'Londen, Verenigd Koninkrijk',
  'testimonials.1.quote': 'Het meest ingetogen luxueuze adres waar ik in West-Afrika heb verbleven · Alles is doordacht, niets is opdringerig',
  'testimonials.2.country': 'Parijs, Frankrijk',
  'testimonials.2.quote': 'Een toevluchtsoord in de zuiverste zin · Het team laat je voelen als een vriend die terugkomt, niet als een gast',
  'testimonials.3.country': 'Lagos, Nigeria',
  'testimonials.3.quote': 'KoSa toont wat elke Afrikaanse kustlijn kan zijn geworteld, mooi, waardig',

  'treatments.atlantic-salt-scrub.name': 'Atlantische zoutscrub',
  'treatments.palm-oil-deep-tissue.name': 'Diepe weefselmassage met palmolie',
  'treatments.shea-honey-wrap.name': 'Shea & honingpakking',
  'treatments.sound-bath.name': 'Klankbad aan zee',
  'treatments.kente-crystal.name': 'Kente-kristalbehandeling',
  'treatments.coastal-yoga.name': 'Kustyoga (groep)',

  'adinkra.knonsonkonson.meaning': 'Verbondenheid',
  'adinkra.knonsonkonson.line': 'Een ketting van schakels wij dragen elkaar',
  'adinkra.asetena.meaning': 'Goed leven',
  'adinkra.asetena.line': 'Een troon voor rust, voor trage dagen, voor terugkeer',
  'adinkra.denkyem.meaning': 'Ademen',
  'adinkra.denkyem.line': 'De krokodil ademt lucht hoewel hij in water leeft aanpassen, verzachten',
  'adinkra.community.meaning': 'Samen zijn',
  'adinkra.community.line': 'Een cirkel groter dan jezelf',

  // ─── Content Brief 2026 ─────────────────────────────────────────────────
  'nav.stay': 'Verblijf',
  'nav.dine': 'Eten & drinken',
  'nav.explore': 'Ontdekken',
  'nav.experience': 'Beleven',
  'nav.plan': 'Plan je bezoek',
  'nav.events': 'Evenementen & ontmoetingen',
  'nav.story': 'Ons verhaal',

  'home.hero.headline': 'Verbind · Herlaad · Vernieuw',
  'home.hero.subhead': 'Het leven is beter aan het strand',
  'home.hero.ctaPrimary': 'Boek je verblijf',
  'home.hero.ctaSecondary': 'Ontdek KoSa',

  'home.social.copy':
    'Geliefd bij 5.000+ gasten. 9,1/10 op Booking.com · 4,8/5 op Google · 4,7/5 op TripAdvisor',

  'home.feeling.headline': 'Zo voelt het om vaart te minderen',
  'home.feeling.body':
    'KoSa is een kustretraite ontworpen voor verbinding met de natuur, met anderen en met jezelf · Een plek waar elke zonsopkomst en zeebries je uitnodigt stil te staan · Waar het eten vers is en het tempo zacht · Waar de oceaan niet alleen uitzicht is maar de hele bedoeling',

  'home.itineraries.eyebrow': 'Voorbeeld-itineraries',
  'home.itineraries.weekend': 'Weekend Escape · 2 nachten',
  'home.itineraries.short': 'Korte adempauze · 4 nachten',
  'home.itineraries.full': 'Volledige reset · 7 nachten',
  'home.itineraries.closing':
    'Elk verblijf is van jou om vorm te geven · Vertel ons wat je nodig hebt en wij regelen de rest',
  'home.itineraries.cta': 'Begin met plannen',
  'home.itineraries.weekend.title': 'Een weekend aan zee',
  'home.itineraries.weekend.body':
    'Aankomst vrijdag in het gouden uur · Welkomstdrankje, traag diner, een lange slaap · Zaterdag: yoga bij zonsopkomst, kruidenthee, zwemmen, lunch op het strand, een middagmassage en een diner bij het vuur onder de sterren · Zondag: zachte ochtend, brunch op het terras en transfer wanneer jij er klaar voor bent',
  'home.itineraries.short.title': 'Een korte break die je reset',
  'home.itineraries.short.body':
    'Vier nachten om echt aan te komen · Voeg een halve dag in Elmina toe, een begeleide wandeling door visdorpen, twee spa-behandelingen en een privédiner op het zand · Tegen de derde nacht zijn zelfs je schouders vergeten hoe spanning voelt',
  'home.itineraries.full.title': 'Een week om terug te komen bij jezelf',
  'home.itineraries.full.body':
    'Zeven nachten van adem en Ghanese zon · Coaching-sessies, dagelijkse yoga, excursies naar Cape Coast en Kakum, marktochtenden, strandmiddagen en trage avonden · Vertrek lichter dan je kwam',

  'home.roomsTeaser.headline': 'Een kamer die thuishoort aan de kust',
  'home.roomsTeaser.body':
    'Word wakker bij vogelzang en zeelicht · Onze kamers zijn doordacht ontworpen voor rust eenvoudig, mooi en diep comfortabel · Van tuinretraites tot suites met oceaanzicht jouw ruimte wacht',
  'home.roomsTeaser.cta': 'Bekijk de kamers →',

  'home.testimonials.example':
    'Ik kwam uitgeput aan en vertrok weer als mezelf · KoSa heeft die kracht',

  'home.email.headline': 'Wees als eerste op de hoogte',
  'home.email.body':
    'Vroege toegang tot tarieven, nieuwe ervaringen en stille momenten van de kust rechtstreeks in je inbox · Geen ruis · Op elk moment uitschrijven',
  'home.email.placeholder': 'jouw@email.com',
  'home.email.cta': 'Aanmelden',

  'roomsPage.headline': 'Jouw plek aan zee',
  'roomsPage.intro':
    'Elke kamer bij KoSa is ontworpen met één vraag in gedachten: hoe voelt echte rust? Licht dat van de oceaan komt · Lucht die de tuin meedraagt · Comfort dat zich niet aankondigt het omringt je gewoon',
  'roomsPage.cardCta': 'Nu boeken',
  'roomsPage.trust':
    'Boek direct voor de beste prijs · Flexibele annulering op alle kamers · Een welkomstdrankje bij aankomst onze manier om te zeggen dat we blij zijn dat je er bent · Vragen? We zijn bereikbaar via WhatsApp',

  'wellnessPage.headline': 'Welzijn, op zijn KoSa',
  'wellnessPage.hero.title': 'Welzijn, op zijn KoSa',
  'wellnessPage.hero.sub': 'De natuur herstelt vind balans in lichaam en geest',
  'wellnessPage.approach.eyebrow': 'Onze aanpak',
  'wellnessPage.approach.title': 'Welzijn door de natuur',
  'wellnessPage.approach.body1': 'We bouwden KoSa op een eenvoudige overtuiging: welzijn hoort mooi, natuurlijk en binnen handbereik te zijn. Hier is welzijn geen programma - het is het ritme van de plek. Het zit in de kruidenthee die bij aankomst op je wacht. In de zeelucht die je bij dageraad begroet. In de rust waarvan je niet wist dat je die nodig had.',
  'wellnessPage.approach.body2': 'Welzijn is hier niet iets wat je doet. Het is iets wat je je herinnert.',
  'wellnessPage.features.heading': 'Wellnessvoorzieningen',
  'wellnessPage.feat.spa.title': 'Spabehandelingen',
  'wellnessPage.feat.spa.body': 'Kruidenbehandelingen en massages met natuurlijke lokale ingrediënten',
  'wellnessPage.feat.coaching.title': 'Wellnesscoaching',
  'wellnessPage.feat.coaching.body': 'Persoonlijke begeleiding naar rust en helderheid',
  'wellnessPage.feat.tea.title': 'Kruidenthee- & sapbar',
  'wellnessPage.feat.tea.body': 'Een selectie voedzame dranken voor lichaam en geest',
  'wellnessPage.feat.yoga.title': 'Yoga aan zee',
  'wellnessPage.feat.yoga.body': 'Zachte sessies met zeezicht en een zeebries',
  'wellnessPage.feat.mindful.title': 'Begeleide mindfulness',
  'wellnessPage.feat.mindful.body': 'Meditatie en ademhaling in serene natuurlijke omgeving',
  'wellnessPage.feat.nature.title': 'Verbinding met de natuur',
  'wellnessPage.feat.nature.body': 'Herstellende wandelingen en meeslepende ervaringen aan de kust',
  'wellnessPage.holistic.eyebrow': 'Een holistische aanpak',
  'wellnessPage.holistic.title': 'Lichaam, geest en ziel',
  'wellnessPage.holistic.body1': 'Onze programma’s richten zich op de hele mens lichaam, geest en ziel · Of je nu ontspanning, energie of innerlijke rust zoekt, ons team begeleidt je persoonlijk',
  'wellnessPage.holistic.body2': 'Van yoga bij zonsopgang tot meditatie bij zonsondergang, van thee tot massages alles werkt samen om je balans te herstellen',
  'wellnessPage.benefits.heading': 'De voordelen van welzijn bij KoSa',
  'wellnessPage.benefit.stress.title': 'Stressverlichting',
  'wellnessPage.benefit.stress.body': 'Laat spanning los met natuurlijke therapieën en een rustige omgeving',
  'wellnessPage.benefit.renewal.title': 'Fysieke vernieuwing',
  'wellnessPage.benefit.renewal.body': 'Herstel vitaliteit met beweging, voeding en rust',
  'wellnessPage.benefit.clarity.title': 'Mentale helderheid',
  'wellnessPage.benefit.clarity.body': 'Krijg overzicht en focus door mindfulness',
  'wellnessPage.benefit.lasting.title': 'Blijvende verandering',
  'wellnessPage.benefit.lasting.body': 'Ontwikkel welzijnsgewoonten die verder reiken dan je verblijf',
  'wellnessPage.intro':
    'We hebben KoSa gebouwd vanuit een eenvoudige overtuiging: welzijn hoort mooi, natuurlijk en bereikbaar te zijn · Hier is welzijn geen programma het is het ritme van de plek · Het zit in de kruidenthee die je ontvangt bij aankomst · In de zeelucht die je begroet bij zonsopkomst · In de stilte waarvan je niet wist dat je haar nodig had',
  'wellnessPage.journeys.title': 'Welzijnsreizen',
  'wellnessPage.journeys.body':
    'Begeleide ervaringen in rust, reflectie en hernieuwing · Of je nu alleen komt of met iemand die je liefhebt, we vormen je tijd hier rondom wat lichaam en geest werkelijk nodig hebben',
  'wellnessPage.coaching.title': 'Welzijnscoaching',
  'wellnessPage.coaching.body':
    'Persoonlijke begeleiding voor balans en aandacht · Zit met een van onze coaches, adem en vind langzaam de weg terug naar jezelf',
  'wellnessPage.spa.title': 'Spa-diensten',
  'wellnessPage.spa.body':
    'Massages, aromatherapie en kruidenbehandelingen elk gekozen om wat ze het lichaam teruggeven · Handen die weten te luisteren · Behandelingen geworteld in dit land',
  'wellnessPage.tea.title': 'KoSa Tea Bar',
  'wellnessPage.tea.body':
    'Kruidenthees en verse sappen die in stilte voeden · Geen haast · Geen ruis · Alleen warmte in een kop en de zee die nooit ver weg klinkt',
  'wellnessPage.cta.book': 'Boek een welzijnservaring',
  'wellnessPage.cta.ask': 'Vertel ons wat je nodig hebt',

  'diningPage.headline': 'Eten zoals de kust het bedoelde',
  'diningPage.popular': 'Populair',
  'diningPage.intro':
    'Bij KoSa is de keuken onderdeel van het welzijn · We werken met lokale vissers en boeren mensen die dit land en deze wateren kennen en laten de versheid spreken · Ghanese smaken, met zorg bereid · Voeding die smaakt alsof ze voor jou gemaakt is',
  'diningPage.restaurant.title': 'Het restaurant',
  'diningPage.restaurant.body':
    'Waar de dag begint en de avond tot rust komt · Ons restaurant serveert verse, seizoensgebonden gerechten verworteld in de Ghanese traditie, met aandacht voor iedereen aan tafel inclusief halal-opties, vegetarische gerechten en maaltijden die net zo goed voelen als ze smaken',
  'diningPage.restaurant.cta': 'Reserveer een tafel',
  'diningPage.bar.title': 'De bar',
  'diningPage.bar.body':
    'Cocktails, mocktails en verse sappen, gemaakt met wat het seizoen geeft · Kom bij zonsondergang · Blijf zo lang de avond toestaat',
  'diningPage.breakfast.title': 'Ontbijt',
  'diningPage.breakfast.body':
    'De eerste maaltijd van de dag hoort als een geschenk te voelen · Kleurrijk, vers en zonder haast Ghanese, continentale en volledige opties beschikbaar · Dieetwensen welkom laat het ons weten',
  'diningPage.private.title': 'Privé- & speciale diners',
  'diningPage.private.body':
    'Iets te vieren? Wij dekken een tafel speciaal voor jou op het strand, onder de sterren, met de oceaan als decor · Vertel ons de gelegenheid en wij regelen de rest',
  'diningPage.private.cta': 'Plan een speciaal diner',
  'diningPage.gallery.eyebrow': 'Vers uit de keuken',
  'diningPage.gallery.title': 'Foodgalerij',
  'diningPage.gallery.body': 'Een blik op wat er op tafel komt · gevangen, geteeld en gekookt langs deze kust',
  'diningPage.gallery.filter.dishes': 'Gerechten',
  'diningPage.gallery.filter.breakfast': 'Ontbijt',
  'diningPage.gallery.filter.drinks': 'Drankjes',
  'diningPage.gallery.filter.moments': 'Aan tafel',

  'experiencesPage.headline': 'Ghana begint hier',
  'experiencesPage.intro':
    'KoSa ligt aan de rand van een van de mooiste en historisch rijkste kuststreken van West-Afrika · Wij zijn je basis, je gids en je thuis na elk avontuur · Of je nu op het terrein blijft of erop uit trekt elke ervaring is er een om mee naar huis te nemen',
  'experiencesPage.property.title': 'Op het terrein',
  'experiencesPage.property.body':
    'De oceaan ligt vlakbij · Net als het zwembad, de tuin, de yogamat en de hangmat met jouw naam erop · Op dagen dat je alleen maar wilt zijn, is KoSa meer dan genoeg',
  'experiencesPage.ghana.title': 'Het land in',
  'experiencesPage.ghana.body':
    'Wanneer je klaar bent om te ontdekken, zijn wij klaar om je mee te nemen · Cape Coast Castle · Elmina · Kakum · De visdorpen · De markten · De geschiedenissen die het verdienen gekend te worden · We verbinden je met gidsen die deze plekken diep kennen niet als toeristen, maar als mensen die hier horen',
  'experiencesPage.cta': 'Plan je ervaringen',

  'eventsPage.headline': 'Er is altijd iets te doen',
  'eventsPage.enquire': 'Boeken',
  'eventsPage.transport': 'Vervoer inbegrepen',
  'eventsPage.empty': 'Nog niets in deze categorie.',

  'eventsPage.intro':
    'Sommige momenten verdienen een decor dat ze recht doet · KoSa ligt tussen oceaan en tuin een natuurlijk decor voor vieringen die echt voelen, retraites die werkelijk herstellen en bijeenkomsten waar je als collega aankomt en als iets dichter vertrekt',
  'eventsPage.weddings.title': 'Bruiloften & vieringen',
  'eventsPage.weddings.body':
    'Een bruiloft op KoSa is de strandceremonie die je altijd voor je zag het geluid van de golven, de warmte van de kust, je dierbaarsten samen op één prachtige plek · Wij regelen elk detail met zorg · Jij komt en viert',
  'eventsPage.weddings.cta': 'Begin met plannen',
  'eventsPage.retreats.title': 'Welzijnsretreats',
  'eventsPage.retreats.body':
    'KoSa is gebouwd voor herstel · Groepsretraites yoga-intensives, mindfulness-weekenden of maatwerk healing-programma’s vinden hier een natuurlijk thuis · Wij brengen de ruimte, de stilte en de ondersteuning · Jij brengt de intentie',
  'eventsPage.corporate.title': 'Bedrijfsretreats & offsite meetings',
  'eventsPage.corporate.body':
    'De beste ideeën ontstaan niet in vergaderzalen · Breng je team naar de kust, stap weg uit het gewone en kijk wat er gebeurt als mensen weer kunnen denken · KoSa biedt vergaderruimte, groepsaccommodatie en teamervaringen om de mensen achter het werk weer te verbinden',
  'eventsPage.corporate.cta': 'Vraag groepsboeking aan',
  'eventsPage.form.name': 'Naam',
  'eventsPage.form.company': 'Bedrijf',
  'eventsPage.form.type': 'Type evenement',
  'eventsPage.form.dates': 'Data',
  'eventsPage.form.guests': 'Aantal gasten',
  'eventsPage.form.message': 'Bericht',
  'eventsPage.form.response': 'We reageren binnen 24 uur',

  'planPage.headline': 'Alles wat je nodig hebt om voorbereid aan te komen',
  'planPage.intro':
    'We willen dat je KoSa-ervaring al begint voordat je hier bent · Hieronder vind je alles om je verblijf voor te bereiden voorbeeld-itineraries, route, FAQ en de praktische info die echt verschil maakt',
  'planPage.experiences.eyebrow': 'Wat je hier kunt doen',
  'planPage.experiences.body':
    'Echte ervaringen bij KoSa, van het strand tot de kust kies wat je aanspreekt',
  'planPage.experiences.cta': 'Bekijk alle ervaringen',
  'planPage.itineraries.eyebrow': 'Voorbeeld-itineraries',
  'planPage.itineraries.body':
    'Drie vooraf samengestelde verblijven, dag voor dag geen schema, maar een verhaal · Elk eindigt met: dit is één versie van je KoSa-verblijf · De jouwe wordt de jouwe vorm hem bij aankomst, of vertel ons wat je nodig hebt voordat je komt',
  'planPage.itineraries.cta1': 'Boek dit verblijf',
  'planPage.itineraries.cta2': 'Stel mijn plan samen',
  'planPage.getting.title': 'Hoe je hier komt',
  'planPage.getting.body':
    'KoSa Beach Resort ligt aan de Centrale kust van Ghana, ongeveer 25 km van Elmina en 30 km van Cape Coast Castle · Vanaf Accra’s Kotoka International Airport is het ongeveer 3 uur rijden en we regelen graag je transfer zodat de rust begint zodra je landt',
  'planPage.getting.cta': 'Boek een luchthaventransfer',
  'planPage.faqs.title': 'Veelgestelde vragen',
  'planPage.faq.checkin.q': 'Hoe laat is in- en uitchecken?',
  'planPage.faq.checkin.a':
    'Inchecken vanaf 14:00 uur, uitchecken tot 11:00 uur · Waar mogelijk zijn we flexibel vraag het ons gewoon',
  'planPage.faq.cancellation.q': 'Wat is jullie annuleringsbeleid?',
  'planPage.faq.cancellation.a':
    '50 % terugbetaling bij annulering minstens 20 dagen voor aankomst; daarna geen terugbetaling · Boekingen in het hoogseizoen zijn niet-restitueerbaar · Reserveringen kunnen tot 48 uur voor aankomst worden aangepast een aanbetaling van 50 % bevestigt de boeking',
  'planPage.faq.airport.q': 'Bieden jullie luchthaventransfers aan?',
  'planPage.faq.airport.a':
    'Ja. Comfortabele, privé-transfers vanaf Kotoka International Airport in Accra · Boek op tijd zodat we je bij aankomst kunnen ontvangen',
  'planPage.faq.halal.q': 'Zijn er halal-maaltijden beschikbaar?',
  'planPage.faq.halal.a':
    'Ja. Halal-opties beschikbaar in de hele kaart · Vegetarisch, veganistisch en andere dieetwensen worden met plezier opgevangen',
  'planPage.faq.children.q': 'Kunnen kinderen mee?',
  'planPage.faq.children.a':
    'Natuurlijk · KoSa is rustig maar gezinsvriendelijk · Vertel ons de leeftijden en we maken het verblijf zo gemakkelijk mogelijk',
  'planPage.faq.payment.q': 'Welke betaalmethoden accepteren jullie?',
  'planPage.faq.payment.a':
    'Alle grote kaarten, mobile money en bankoverschrijving · Een aanbetaling bevestigt de boeking, het saldo rekenen we af bij aankomst',
  'planPage.faq.swim.q': 'Kun je in zee zwemmen?',
  'planPage.faq.swim.a':
    'De Atlantische Oceaan heeft stromingen we laten je altijd weten wat de veiligste uren zijn · Het zwembad is de hele dag open',
  'planPage.faq.wellness.q': 'Kan ik welzijnsbehandelingen vooraf boeken?',
  'planPage.faq.wellness.a':
    'Ja graag zelfs · Spa, coaching en groepslessen zijn snel vol · Laat ons weten wat je wilt voordat je komt',

  'aboutPage.headline': 'Twee decennia aan zee. En toch voelt elke gast zich als de eerste',
  'aboutPage.opening':
    'KoSa Beach Resort is niet gebouwd vanuit een businessplan. Het is gebouwd vanuit een overtuiging - dat de Ghanese kust een van de meest herstellende plekken op aarde is, en dat iedereen die hier komt dat moet kunnen voelen. Al meer dan twintig jaar houden we die overtuiging vast.',
  'aboutPage.continued':
    'We zijn onderdeel van de Akwaaba Stays Hospitality Group - een familie van verblijven in Ghana en West-Afrika die een gezamenlijke toewijding delen aan gastvrijheid geworteld in zorg, gemeenschap en de plekken die we thuis noemen. KoSa is waar die toewijding het dichtst bij het water leeft.',
  'aboutPage.values': 'Onze waarden',
  'aboutPage.values.authenticity.title': 'Authenticiteit',
  'aboutPage.values.authenticity.body':
    'Eerlijke gastvrijheid die het werkelijke ritme van deze kust weerspiegelt · Geen show · Geen pretentie · KoSa zoals het is en altijd is geweest',
  'aboutPage.values.community.title': 'Gemeenschap',
  'aboutPage.values.community.body':
    'We werken samen met de mensen om ons heen vissers, boeren en ambachtslieden wier werk en kennis KoSa maken tot wat het is · Wanneer je hier verblijft, groeien hun levens mee',
  'aboutPage.values.wellness.title': 'Welzijn',
  'aboutPage.values.wellness.body':
    'Het voeden van lichaam en geest via gezond eten, coaching en stilte · We geloven dat welzijn mooi, natuurlijk en bereikbaar hoort te zijn geen luxe voor een enkeling',
  'aboutPage.values.sustainability.title': 'Duurzaamheid',
  'aboutPage.values.sustainability.body':
    'Respect voor de kust, het land en het leven dat ze dragen · We zijn rentmeesters van deze plek verantwoordelijk voor haar en voor de generaties die na ons komen',
  'aboutPage.values.legacy.title': 'Erfenis',
  'aboutPage.values.legacy.body':
    'Twee decennia van oprechte verbinding en zorg aan zee · De oceaan houdt ons nederig · De gasten die terugkomen houden ons gaande',
  'aboutPage.closing.headline': 'Kom en ervaar het zelf',
  'aboutPage.closing.body':
    'We zouden je meer kunnen vertellen maar KoSa beleef je het beste in persoon · De zeelucht, het eten, de mensen, de stilte · Er is hier iets dat niet in woorden past · Maar het wacht op je',
  'aboutPage.closing.ctaBook': 'Boek je verblijf',
  'aboutPage.closing.ctaGet': 'Neem contact op',

  'exit.headline': 'Ontvang KoSa-tarieven voordat ze vollopen',
  'exit.body':
    'Vroege toegang tot seizoenstarieven, rustige weken en nieuwe ervaringen · Eén keer per maand, niet meer',
  'exit.cta': 'Houd me op de hoogte',
  'exit.placeholder': 'jouw@email.com',
  'exit.dismiss': 'Nee, bedankt',
  'exit.thanks': 'Bedankt · Kijk je inbox in de gaten',

  'common.bookYourStay': 'Boek je verblijf',
  'common.exploreKosa': 'Ontdek KoSa',
  'common.whatsapp': 'WhatsApp',
  'common.getInTouch': 'Neem contact op',
  'common.startPlanning': 'Begin met plannen',
  'common.readMore': 'Lees meer',

  'footer.quickLinks': 'Snelkoppelingen',
  'footer.reviews': 'Geliefd bij onze gasten op',
  'footer.address': 'Beach Road No.1, Ampenyi, Elmina, Ghana',
  'footer.group': 'Een eigendom van Akwaaba Stays Hospitality Group',

  // ─── Full-coverage UI strings (2026 i18n sweep) ────────────────────────
  'newsletter.placeholder': 'jij@voorbeeld.com',
  'newsletter.success': 'Welkom aan de kust',
  'newsletter.error': 'Er ging iets mis',
  'newsletter.failed': 'Aanmelden mislukt',
  'newsletter.ariaEmail': 'E-mailadres',
  'newsletter.ariaSubscribe': 'Aanmelden',

  'home.hero.location': 'Elmina · Ghana',
  'home.itineraries.heading': 'Een paar manieren om je tijd door te brengen',

  'roomsPage.searchPlaceholder': 'Zoek kamers, bedden, zeezicht…',
  'roomsPage.resultsOne': '1 kamertype',
  'roomsPage.resultsMany': '{n} kamertypes',
  'roomsPage.searchEmpty': 'Geen kamers gevonden probeer een ander woord of filter',
  'roomsPage.occupied': 'Volgeboekt',
  'roomsPage.upTo': 'Tot',
  'roomsPage.guestsUnit': 'gasten',

  'roomDetail.amenities': 'Voorzieningen',
  'roomDetail.from': 'Vanaf',
  'roomDetail.taxesIncluded': 'Belastingen en ontbijt inbegrepen',
  'roomDetail.reserve': 'Reserveren',
  'roomDetail.askConcierge': 'Vraag het de conciërge',
  'roomDetail.freeCancellation': 'Gratis annuleren tot 48 uur voor aankomst',
  'roomDetail.otherRooms': 'Andere kamers die je misschien mooi vindt',
  'roomDetail.descFallback':
    'Een ingetogen toevlucht zacht linnen, gevlochten palm, handgedraaide keramiek · Een kamer die ademt op het ritme van het getij',
  'roomDetail.amenity.balcony': 'Balkon aan het strand',
  'roomDetail.amenity.bed': 'Kingsize bed met linnen lakens',
  'roomDetail.amenity.shower': 'Openluchtregendouche',
  'roomDetail.amenity.local': 'Lokaal verkregen voorzieningen',
  'roomDetail.amenity.wifi': 'Snelle wifi',
  'roomDetail.amenity.ac': 'Airconditioning + plafondventilator',
  'roomDetail.amenity.breakfast': 'Dagelijks ontbijt inbegrepen',
  'roomDetail.amenity.welcome': 'Welkomstrituelen',

  'wellnessPage.heroSub': 'Open voor daggasten en resortgasten',
  'wellnessPage.enquiry.eyebrow': 'Informeer',
  'wellnessPage.enquiry.title': 'Geen verblijf nodig',
  'wellnessPage.enquiry.body': 'Vertel ons wat je aanspreekt en wij regelen het of je nu bij ons verblijft of voor de dag komt',
  'wellnessPage.enquiry.point1': 'Daggasten welkom kom voor een behandeling of sessie',
  'wellnessPage.enquiry.point2': 'We bevestigen de tijd per e-mail of WhatsApp',
  'wellnessPage.enquiry.point3': 'Koppels en kleine groepen mogelijk',
  'wellnessForm.interest': 'Waar je in geïnteresseerd bent',
  'wellnessForm.choose': 'Kies een programma',
  'wellnessForm.notSure': 'Nog niet zeker - adviseer me',
  'wellnessForm.guestType': 'Verblijf je bij ons?',
  'wellnessForm.day': 'Daggast (verblijft niet)',
  'wellnessForm.staying': 'Verblijft bij KoSa',
  'wellnessForm.date': 'Voorkeursdatum',
  'wellnessForm.guests': 'Aantal gasten',
  'wellnessForm.message': 'Nog iets?',
  'wellnessForm.submit': 'Verzend aanvraag',
  'wellnessForm.whatsapp': 'Verstuur via WhatsApp',
  'wellnessForm.thankTitle': 'Dank je',
  'wellnessForm.thankBody': 'We hebben je aanvraag ontvangen en nemen snel contact op',
  'wellnessForm.waIntro': 'Hoi KoSa! Ik heb een wellnessvraag:',
  'wellnessPage.treatmentsHeading': 'Behandelingen & sessies',
  'wellnessPage.treatmentsIntro': 'Blader op wat je nodig hebt - massage en bodywork in de KoSa Health Spa, of de diepere rituelen en retraites van O2 Wellness.',
  "quote.ocean": "De oceaan haast zich niet. Jij zou dat ook niet moeten doen",
  "quote.stop": "Dit is hoe het voelt om eindelijk te stoppen",
  'home.welcome.eyebrow': 'Akwaba · Welkom thuis',
  'home.welcome.heading': 'Sommige plekken bezoek je Bij KoSa kom je thuis',
  'home.welcome.body': 'Zie een KoSa-welkom zich ontvouwen: trommels op het zand, wit linnen in de bries, een naamceremonie aan de oceaan. Zo voelt aankomen.',
  'home.welcome.cta': 'Speel de film af',
  'home.welcome.play': 'Speel de Welcome Home-film af',
  "wellnessPage.hero.line": "Je hebt geen programma nodig. Je hebt toestemming nodig om te stoppen",
  "wellnessPage.offerings.eyebrow": "KoSa Welzijn",
  "wellnessPage.yoga.title": "Yoga aan zee",
  "wellnessPage.yoga.body": "Zachte beweging op het zand, adem en oceaan in hetzelfde ritme. Kom zoals je bent; elk niveau is welkom.",
  "wellnessPage.journeys.sense": "Er wordt niets ingepland wat je niet zelf koos. De dag past zich aan jou aan, niet andersom.",
  "wellnessPage.coaching.sense": "Je ontmoet je coach de ochtend na je aankomst. Gewoon om te praten.",
  "wellnessPage.spa.sense": "De behandelkamers openen naar de tuin. Je hoort vogels zingen.",
  "wellnessPage.tea.sense": "We zetten thee met kruiden van het terrein. Sommige gasten vragen om het recept.",
  "wellnessPage.yoga.sense": "De sessies zijn om 7 uur, als het licht nog zacht is en het strand stil.",
  "wellnessPage.day.eyebrow": "Een dag hier",
  "wellnessPage.day.heading": "Hoe een wellnessdag bij KoSa eruitziet",
  "wellnessPage.day.intro": "Geen schema om te volgen. Gewoon een zacht ritme dat je volgt zoveel je wilt.",
  "wellnessPage.day.s1.time": "Bij zonsopgang",
  "wellnessPage.day.s1.text": "Ochtendthee op het terras terwijl het licht opkomt. Geen haast, nog niets te zijn.",
  "wellnessPage.day.s2.time": "Vroeg in de ochtend",
  "wellnessPage.day.s2.text": "Een rustige wandeling langs het strand, het zand nog koel en de kust stil.",
  "wellnessPage.day.s3.time": "7 uur",
  "wellnessPage.day.s3.text": "Yoga aan zee, adem en golven in hetzelfde tempo.",
  "wellnessPage.day.s4.time": "Later op de ochtend",
  "wellnessPage.day.s4.text": "Een spabehandeling met de tuindeuren open en vogelzang die binnendrijft.",
  "wellnessPage.day.s5.time": "Middag",
  "wellnessPage.day.s5.text": "Lunch op het terras, vers uit de keuken, rustig gegeten in de schaduw.",
  "wellnessPage.day.s6.time": "In de middag",
  "wellnessPage.day.s6.text": "Een coachingsessie, of gewoon een hangmat en een boek. Wat je maar nodig hebt.",
  "wellnessPage.day.s7.time": "In de avond",
  "wellnessPage.day.s7.text": "Diner rond het kampvuur terwijl de sterren boven het water verschijnen.",
  "wellnessPage.closing.eyebrow": "Welzijn, op jouw manier",
  "wellnessPage.closing.headline": "Vertel ons wat je nodig hebt. Wij regelen de rest",
  "wellnessPage.closing.body": "Geen vast programma, geen druk. Vertel ons hoe je je wilt voelen en wij vormen je verblijf daaromheen.",
  "wellnessPage.closing.cta": "Chat met ons op WhatsApp",

  // Experiences - gratis dagelijkse activiteiten
  'experiencesPage.daily.eyebrow': 'Elke dag, inbegrepen',
  'experiencesPage.daily.heading': 'Gratis dagelijkse activiteiten',
  'experiencesPage.daily.intro':
    'Elke dag bij KoSa heeft zijn eigen ritme. Alle activiteiten zijn gratis voor onze gasten: doe mee met wat je aanspreekt of geniet gewoon van de rust.',
  'experiencesPage.daily.free': 'Gratis',
  'experiencesPage.daily.footnote':
    'Alle activiteiten zijn gratis voor gasten. Schrijf je in bij de receptie. Het programma kan variëren.',

  // Wellness - pakketten
  'planPage.packages.eyebrow': 'Samengestelde verblijven',
  'planPage.packages.heading': 'Verblijfspakketten',
  'planPage.packages.intro':
    'Alles geregeld. Jij hoeft alleen maar aan te komen. Elk pakket bevat dagelijks ontbijt, een gratis welkomstmassage van 10 minuten bij aankomst en volledige toegang tot het strand.',
  'planPage.packages.enquireRates': 'Vraag naar onze actuele tarieven',
  'planPage.packages.enquire': 'Aanvragen',

  // Wellness - extra's
  'wellnessPage.enhance.eyebrow': "Extra's",
  'wellnessPage.enhance.heading': 'Verrijk je verblijf',
  'wellnessPage.enhance.intro':
    'Voeg iets bijzonders toe aan elk pakket of elke kamerreservering. Regel het bij de receptie, telefonisch of bij het boeken.',
  'wellnessPage.enhance.cta': "Vraag naar de extra's",
  'wellnessPage.enhance.enquire': 'Aanvragen',
  'wellnessPage.beginHeadline': 'Begin je weg terug',

  'experiencesPage.buildDay': 'Vraag ons je perfecte dag samen te stellen',

  'contactPage.eyebrow': 'Neem contact op',
  'contactPage.title': 'Laten we praten, eenvoudigweg',
  'contactPage.whereToFind': 'Waar je ons vindt',
  'contactPage.whatsappUs': 'Stuur ons een WhatsApp',
  'contactPage.mapTitle': 'Locatiekaart van KoSa',

  'bookPage.eyebrow': 'Plan je terugkeer',
  'bookPage.title': 'Boek je verblijf',
  'bookPage.subtitle': 'Beste prijs, gratis annuleren tot 48 uur, directe bevestiging',

  'book.step.dates': 'Data',
  'book.step.room': 'Kamer',
  'book.step.guest': 'Gegevens',
  'book.step.confirm': 'Bevestigen',
  'book.datesHeading': 'Wanneer wil je verblijven?',
  'book.checkIn': 'Aankomst',
  'book.checkOut': 'Vertrek',
  'book.adults': 'Volwassenen',
  'book.children': 'Kinderen',
  'book.continue': 'Doorgaan',
  'book.editDates': 'Data wijzigen',
  'book.guestHeading': 'Je gegevens',
  'book.firstName': 'Voornaam',
  'book.lastName': 'Achternaam',
  'book.email': 'E-mail',
  'book.phone': 'Telefoon',
  'book.country': 'Land',
  'book.notes': 'Opmerkingen (optioneel)',
  'book.confirmReservation': 'Reservering bevestigen',
  'book.guests': 'Gasten',
  'book.adultsUnit': 'volwassenen',
  'book.childrenUnit': 'kinderen',
  'book.nights': 'Nachten',
  'book.nightsUnit': 'nachten',
  'book.total': 'Totaal',
  'book.taxesLine': 'Belastingen en ontbijt inbegrepen · Gratis annuleren tot 48 uur',
  'book.doneHeading': 'Akwaaba we hebben je boeking',
  'book.confirmationLabel': 'Bevestiging:',
  'book.doneBody':
    'Er is een bevestiging naar je e-mail gestuurd · Onze conciërge neemt binnen een dag contact op met aankomstdetails en een welkomstritueel',
  'book.returnHome': 'Terug naar home',
  'book.whatsappUs': 'Stuur ons een WhatsApp',
  'book.errRequired': 'Verplicht',
  'book.errEmail': 'Geldig e-mailadres vereist',
  'book.failed': 'Boeking mislukt',

  'eventsPage.form.optWedding': 'Bruiloft',
  'eventsPage.form.optRetreat': 'Welzijnsretraite',
  'eventsPage.form.optCorporate': 'Bedrijfsoffsite',
  'eventsPage.form.optOther': 'Andere viering',
  'eventsPage.form.thankYou': 'Bedankt',
  'eventsPage.form.error': 'Vul je naam en een geldig e-mailadres in',
  'eventsPage.form.sendError': 'Je aanvraag kon niet worden verzonden',
  'eventsPage.form.sending': 'Verzenden…',

  'emailCapture.invalid': 'Vul een geldig e-mailadres in',
  'emailCapture.error': 'Aanmelden mislukt',

  'tour.viewRooms': 'Bekijk kamers',
  'tour.fullscreen': 'Volledig scherm',
  'tour.loading': 'Laden',
  'tour.loadingTour': 'Tour laden…',
  'tour.noWebgl': 'Je apparaat ondersteunt geen 360°-weergave geniet in plaats daarvan van een fotogalerij',

  'common.email': 'E-mail',
  'common.returnHome': 'Terug naar home',
  'error.headline': 'Een golfje wierp ons omver',
  'error.body': 'Probeer het opnieuw we hervinden ons evenwicht',
  'error.retry': 'Opnieuw proberen',
  'notFound.headline': 'Verdwaald op zee',
  'notFound.body': 'De pagina die je zoekt is afgedreven · Laten we je thuisbrengen',
  'notFound.concierge': 'Praat met de conciërge',
  'experiencesPage.detailFallback': 'De sessies zijn intiem maximaal zes gasten · Tijden verschuiven zachtjes met het getij en de zon · Praat met onze conciërge voor privéboekingen, rituelen op maat en seizoensaanbod',
  'experiencesPage.addToStay': 'Toevoegen aan je verblijf',
  'common.speakConcierge': 'Praat met de conciërge',
  'blogPage.eyebrow': 'Brieven van de kust',
  'blogPage.comingSoon': 'Brieven van de kust binnenkort',
  'blogPage.subtitle': 'Verhalen, gidsen en rustige notities uit ons stukje kust',
  'blogPage.featured': 'Uitgelicht',
  'blogPage.readStory': 'Lees het verhaal',
  'blogPage.readMins': 'min lezen',
  'blogPage.moreStories': 'Meer uit het journaal',
  'blogPage.backToJournal': 'Terug naar het journaal',
  'blogPage.cta.headline': 'Kom het zelf ervaren',
  'blogPage.cta.body': 'De kust wacht wanneer jij er klaar voor bent',
  'eventsPage.form.datesPlaceholder': 'bijv. 12–15 aug 2026',
  'eventsPage.form.guestsPlaceholder': 'bijv. 40',
  'a11y.close': 'Sluiten',
  'a11y.previous': 'Vorige',
  'a11y.next': 'Volgende',
  'a11y.openMenu': 'Menu openen',
  'a11y.closeMenu': 'Menu sluiten',
  'a11y.scrollNext': 'Ga naar de volgende sectie',
  'a11y.resortChat': 'Resortchat',
  'gallery.empty': 'Nog geen afbeeldingen in de galerij',
  'chat.errorEmpty': "Akwaaba ik ben er, maar mijn conciërgebrein viel even stil · Probeer het opnieuw of stuur ons een WhatsApp op +233 24 437 5432",
  'chat.errorTimeout': 'Dat duurde langer dan verwacht probeer het opnieuw of stuur ons een WhatsApp op +233 24 437 5432',
  'chat.errorGeneric': "Het lukt me nu niet om de resortinformatie te bereiken · Stuur ons een WhatsApp op +233 24 437 5432, dan reageren we snel",
  'alt.heroShoreline': 'Luchtfoto van de kustlijn van KoSa, Elmina, Ghana',
  'alt.feelingHammock': 'Een rustige hangmat tussen de palmen bij KoSa',
  'alt.aboutSea': 'KoSa Beach Resort aan zee',
  'aboutPage.enrichedSetting': 'Het is te zien in de vissers met wie we samenwerken, de boeren die onze keuken bevoorraden, de ambachtslieden die met hun handen vormgaven aan wat je om je heen ziet.',
  'aboutPage.enrichedEco': 'We wilden nooit een luxeresort bouwen. We wilden een plek maken waar je de kust kunt voelen zoals die echt is - ongehaast, gul, levend.',
  'diningPage.bar.name': 'Kooki Beach Bar',
  'diningPage.bar.hours': 'Cocktails geserveerd tot 22.00 uur',
  'diningPage.restaurant.hours': 'Ontbijt, lunch & diner · 7.00 tot 21.00, elke dag',
  'experiencesPage.signature.eyebrow': 'Signature-ervaringen',
  'experiencesPage.signature.headline': 'Een handvol dingen om te doen, met mensen die ze kennen',
  'experiencesPage.signature.ampenyi.title': 'Wandeling door Ampenyi',
  'experiencesPage.signature.ampenyi.body': 'Een begeleide wandeling door Ampenyi ontmoet de vissers, zie hoe de vangst aankomt en (als hij er is) breng een groet aan het dorpshoofd',
  'experiencesPage.signature.capeCoast.title': 'Cape Coast Castle',
  'experiencesPage.signature.capeCoast.body': 'Een korte rit oostwaarts · Een gewicht dat het waard is om te dragen neem water mee, gun jezelf stilte daarna',
  'experiencesPage.signature.elmina.title': 'Elmina Castle',
  'experiencesPage.signature.elmina.body': 'Twintig minuten van KoSa. Een van de oudste door Europeanen gebouwde bouwwerken in West-Afrika, op je gemak te bewandelen',
  'experiencesPage.signature.kakum.title': 'Kakum National Park',
  'experiencesPage.signature.kakum.body': 'Regenwoud, hangbruggen door de boomkruinen, vlinders die je alleen hier tegenkomt · Vroeg vertrekken, op tijd terug voor het diner',
  'experiencesPage.signature.massage.title': 'Thaise massage aan zee',
  'experiencesPage.signature.massage.body': 'Kies waar: op het strand bij de golven, in de tuin onder de palmen of in de rust van je eigen kamer',
  'experiencesPage.signature.horse.title': 'Paardrijden & sieraden maken',
  'experiencesPage.signature.horse.body': 'Strandrijden in het gouden uur, hands-on sieradensessies met lokale ambachtslieden kleine dingen die een verblijf tot een herinnering maken',
};

// ─── GERMAN ───────────────────────────────────────────────────────────────────
// Natural luxury-hospitality German formal "Sie" register, evocative and warm.
const deBase: Partial<Record<keyof typeof en, string>> = {
  'nav.rooms': 'Zimmer',
  'nav.experiences': 'Erlebnisse',
  'nav.dining': 'Kulinarik',
  'nav.wellness': 'Wellness',
  'nav.gallery': 'Galerie',
  'nav.virtualTour': 'Virtuelle Tour',
  'nav.about': 'Das Resort',
  'nav.blog': 'Journal',
  'nav.contact': 'Kontakt',
  'nav.book': 'Jetzt buchen',
  'nav.bookYourStay': 'Aufenthalt reservieren',

  'hero.location': 'Elmina · Ghana · Westafrika',
  'hero.headline': 'Das Leben ist schöner am Strand',
  'hero.tagline': 'Atmen · Küste · Zuhause sein',
  'hero.bookCta': 'Auszeit reservieren',
  'hero.exploreCta': 'Resort entdecken',
  'hero.scrollAria': 'Zum nächsten Abschnitt',

  'intro.eyebrow': 'Willkommen · Akwaaba',
  'intro.headline.l1': 'KoSa ist kein Hotel',
  'intro.headline.l2': 'Es ist der Ort, an den man immer zurückkehrt',
  'intro.body':
    'An einem ruhigen Abschnitt der Atlantikküste in Elmina, wo Palmen sich im Wind wiegen und der Ozean sein eigenes Tempo vorgibt, haben wir einen Ort zum Innehalten geschaffen · Eco-Luxus im Kern, verwurzelt in ghanaischem Handwerk, getragen von den Ritualen derer, die täglich dafür sorgen',
  'intro.script': 'Einfach atmen',
  'intro.philosophyCta': 'Unsere Philosophie die 5 Dimensionen des Seins',

  'rooms.eyebrow': 'Übernachten bei uns',
  'rooms.headline': 'Boutique an der Atlantikküste',
  'rooms.statRooms': 'Zimmertypen',
  'rooms.statSuites': 'Garden View',
  'rooms.statBeach': 'Strand',
  'rooms.filter.all': 'Alle',
  'rooms.filter.beachView': 'Meerblick',
  'rooms.filter.palmSide': 'Palmenseite',
  'rooms.filter.suite': 'Garden View',
  'rooms.priceFrom': 'Ab',
  'rooms.perNight': 'Nacht',
  'rooms.view': 'Ansehen',

  'experiences.eyebrow': 'Voll und ganz erleben',
  'experiences.headline': 'Vier Wege, bei sich anzukommen',
  'experiences.blurb':
    'Von Yoga bei Sonnenaufgang auf den Klippen bis zu Trommelkreisen am Lagerfeuer jeder Tag bei KoSa führt ein Stück näher zu sich selbst',
  'experiences.discover': 'Entdecken',

  'wellness.bgWord': 'Einfach atmen',
  'wellness.eyebrow': 'Atmen',
  'wellness.headline.l1': 'Spa, Yoga, Klang',
  'wellness.headline.l2': 'die fünf Dimensionen des Seins',
  'wellness.blurb':
    'Behandlungen aus westafrikanischen Zutaten Shea, Palmöl, Meersalz in offenen Pavillons, in denen nur die Brandung zu hören ist',
  'wellness.bookCta': 'Behandlung buchen',

  'testimonials.via': 'via',

  'testimonials.eyebrow': 'Sie kommen wieder',
  'testimonials.headline': 'Stimmen von der Küste',

  'booking.eyebrow': 'Planen Sie Ihre Rückkehr',
  'booking.headline.l1': 'Die Küste wartet',
  'booking.headline.l2': 'Kommen Sie?',
  'booking.blurb':
    'Echtzeit-Verfügbarkeit, Bestpreisgarantie und ein herzliches Willkommen bei Ihrer Ankunft · In weniger als zwei Minuten gebucht',
  'booking.badgeSecure': 'Sicher bezahlen',
  'booking.badgeBestRate': 'Bestpreisgarantie',
  'booking.badgeCancel': 'Kostenlos stornieren',
  'booking.formTitle': 'Verfügbarkeit prüfen',
  'booking.checkIn': 'Anreise',
  'booking.checkOut': 'Abreise',
  'booking.adults': 'Erwachsene',
  'booking.adult': 'Erwachsener',
  'booking.adultsPlural': 'Erwachsene',
  'booking.children': 'Kinder',
  'booking.child': 'Kind',
  'booking.childrenPlural': 'Kinder',
  'booking.submit': 'Verfügbarkeit prüfen',
  'booking.submitting': 'Einen Moment…',

  'footer.tagline': 'Das Leben ist schöner am Strand',
  'footer.about':
    'Ein Eco-Luxus-Resort an Ghanas Atlantikküste, wo der Rhythmus des Meeres auf die Herzlichkeit der Akan-Gastfreundschaft trifft',
  'footer.explore': 'Entdecken',
  'footer.connect': 'Folgen Sie uns',
  'footer.newsletter': 'Verbunden bleiben',
  'footer.newsletterBlurb': 'Saisonale Post von der Küste · Nicht mehr, nicht weniger',
  'footer.copyright': 'Alle Rechte vorbehalten',
  'footer.privacy': 'Datenschutz',
  'footer.terms': 'AGB',
  'footer.admin': 'Admin',

  'chat.cta': 'Schreiben Sie Abena',
  'chat.title': 'Abena',
  'chat.subtitle': 'Digitale Concierge · antwortet sofort',
  'chat.greeting':
    'Akwaaba ich bin Abena, Ihre Concierge bei KoSa. Fragen Sie mich alles über das Resort, unsere Zimmer oder die Planung Ihres Aufenthalts',
  'chat.placeholder': 'Ihre Frage…',
  'chat.send': 'Senden',
  'chat.close': 'Schließen',
  'chat.suggested.rooms': 'Welche Zimmer sind verfügbar?',
  'chat.suggested.directions': 'Wie komme ich von Accra nach KoSa?',
  'chat.suggested.spa': 'Erzählen Sie mir vom Spa',
  'chat.suggested.included': 'Was ist im Aufenthalt inbegriffen?',

  'contact.name': 'Name',
  'contact.email': 'E-Mail-Adresse',
  'contact.phone': 'Telefon (optional)',
  'contact.subject': 'Betreff (optional)',
  'contact.message': 'Nachricht',
  'contact.send': 'Anfrage absenden',
  'contact.sending': 'Wird gesendet…',
  'contact.thankTitle': 'Vielen Dank',
  'contact.thankBody': 'Wir melden uns innerhalb eines Tages meist deutlich schneller',
  'contact.error.name': 'Bitte geben Sie Ihren Namen an',
  'contact.error.email': 'Bitte geben Sie eine gültige E-Mail-Adresse an',
  'contact.error.message': 'Erzählen Sie uns noch etwas mehr',
  'contact.error.generic': 'Senden fehlgeschlagen bitte erneut versuchen',

  'cultural.eyebrow': 'Adinkra · Symbole des Akan-Volks',
  'cultural.headline': 'Verwurzelt in Ghana',
  'cultural.description': 'Diese vier Symbole begleiten uns durch das gesamte Resort in Holz graviert, in Leinen gewebt, in jedem Willkommen spürbar',
  'cultural.footer': 'Akwaaba Sie sind hier herzlich willkommen',

  'gallery.eyebrow': 'Im Blickfeld',
  'gallery.headline': 'Galerie',
  'gallery.description': 'Ein ruhiger Streifzug durch das Resort und die Küste, die es umgibt',
  'gallery.loadMore': 'Mehr anzeigen',

  'tour.eyebrow': '360° virtuelle Tour',
  'tour.headline': 'Treten Sie ein · Erkunden Sie frei',
  'tour.description': 'Wandeln Sie durch die Suiten, das Spa, die Küste von überall auf der Welt',
  'tour.cta': 'Tour starten',
  'tour.footer': 'Via Google Drive · 6 Szenen',

  'common.learnMore': 'Mehr erfahren',
  'common.discover': 'Entdecken',
  'common.bookNow': 'Jetzt buchen',
  'common.viewAll': 'Alle ansehen',
  'common.languageEn': 'English',
  'common.languageFr': 'Français',
  'common.languageEs': 'Español',
  'common.languageNl': 'Nederlands',
  'common.languageDe': 'Deutsch',
  'common.toggleLanguage': 'Sprache wechseln',
  'common.selectLanguage': 'Sprache wählen',

  'experiences.wellness.label': 'Wellness',
  'experiences.wellness.title': 'Rituale der Küste',
  'experiences.wellness.description': 'Langsame Morgen, salzwarme Massagen, Atmen zwischen Palmen · Eine Rückkehr zum Körper',
  'experiences.ocean.label': 'Auf dem Meer',
  'experiences.ocean.title': 'Wo der Atlantik singt',
  'experiences.ocean.description': 'Paddleboarding bei Sonnenaufgang, Spaziergänge durch Fischerdörfer, Schnorcheln an Riffen, die nur Einheimische kennen',
  'experiences.dining.label': 'Kulinarik',
  'experiences.dining.title': 'Die Küste auf dem Teller',
  'experiences.dining.description': 'Zackenbarsch vom offenen Feuer, Palmwein-Glasur, Gartenkräuter in der Dämmerung geerntet · Geschichten auf jedem Teller',
  'experiences.cultural.label': 'Kulturelle Rituale',
  'experiences.cultural.title': 'Verwurzelt in Ghana',
  'experiences.cultural.description': 'Spiegelungen der Burg von Elmina, Kente-Weberei, Trommelkreise am Lagerfeuer',

  'rooms.beachfront-suite.name': 'Strandsuite',
  'rooms.beachfront-suite.tagline': 'Mit den Wellen erwachen',
  'rooms.palm-garden-villa.name': 'Palmengarten-Villa',
  'rooms.palm-garden-villa.tagline': 'Geborgen unter den Blättern',
  'rooms.ocean-view-room.name': 'Zimmer mit Meerblick',
  'rooms.ocean-view-room.tagline': 'Licht, Leinen, weiter Horizont',
  'rooms.signature-villa.name': 'Signature-Villa',
  'rooms.signature-villa.tagline': 'Wenn Ankommen ein eigenes Tor verdient',
  'rooms.beach-bungalow.name': 'Strandbungalow',
  'rooms.beach-bungalow.tagline': 'Sand vor der Schwelle',
  'rooms.garden-room.name': 'Gartenzimmer',
  'rooms.garden-room.tagline': 'Ruhig, grün, ohne Eile',

  'testimonials.0.country': 'Accra, Ghana',
  'testimonials.0.quote': 'Ich kam für ein Wochenende und ging mit einem Teil von mir, den ich noch nicht kannte · Das Licht hier ist anders',
  'testimonials.1.country': 'London, Vereinigtes Königreich',
  'testimonials.1.quote': 'Der stillste luxuriöse Ort, den ich in Westafrika erlebt habe · Alles ist mit Bedacht gestaltet, nichts ist laut',
  'testimonials.2.country': 'Paris, Frankreich',
  'testimonials.2.quote': 'Ein Refugium im wahrsten Sinne · Das Team begegnet einem wie einem Freund, der zurückkehrt nicht wie einem Gast',
  'testimonials.3.country': 'Lagos, Nigeria',
  'testimonials.3.quote': 'KoSa zeigt, was jede afrikanische Küstenlinie sein könnte verwurzelt, schön, würdevoll',

  'treatments.atlantic-salt-scrub.name': 'Atlantik-Salzpeeling',
  'treatments.palm-oil-deep-tissue.name': 'Tiefengewebsmassage mit Palmöl',
  'treatments.shea-honey-wrap.name': 'Sheabutter- & Honigpackung',
  'treatments.sound-bath.name': 'Klangbad am Meer',
  'treatments.kente-crystal.name': 'Kente-Kristallheilung',
  'treatments.coastal-yoga.name': 'Küsten-Yoga (Gruppe)',

  'adinkra.knonsonkonson.meaning': 'Verbundenheit',
  'adinkra.knonsonkonson.line': 'Eine Kette von Gliedern wir tragen einander',
  'adinkra.asetena.meaning': 'Gutes Leben',
  'adinkra.asetena.line': 'Ein Thron für Ruhe, langsame Tage, die Rückkehr',
  'adinkra.denkyem.meaning': 'Atmen',
  'adinkra.denkyem.line': 'Das Krokodil atmet Luft, obwohl es im Wasser lebt anpassen, weich werden',
  'adinkra.community.meaning': 'Zusammensein',
  'adinkra.community.line': 'Ein Kreis weiter als das Selbst',

  // ─── Content Brief 2026 ─────────────────────────────────────────────────
  'nav.stay': 'Aufenthalt',
  'nav.dine': 'Kulinarik',
  'nav.explore': 'Entdecken',
  'nav.experience': 'Erleben',
  'nav.plan': 'Reise planen',
  'nav.events': 'Events & Treffen',
  'nav.story': 'Unsere Geschichte',

  'home.hero.headline': 'Verbinden · Auftanken · Erneuern',
  'home.hero.subhead': 'Das Leben ist schöner am Strand',
  'home.hero.ctaPrimary': 'Aufenthalt buchen',
  'home.hero.ctaSecondary': 'KoSa entdecken',

  'home.social.copy':
    'Geliebt von 5.000+ Gästen. 9,1/10 auf Booking.com · 4,8/5 auf Google · 4,7/5 auf TripAdvisor',

  'home.feeling.headline': 'So sieht Entschleunigung aus',
  'home.feeling.body':
    'KoSa ist ein Küstenrefugium für Verbindung mit der Natur, mit anderen und mit dir selbst · Ein Ort, an dem jeder Sonnenaufgang und jede Meeresbrise zur Stille einlädt · Wo die Küche frisch ist und das Tempo sanft · Wo der Ozean nicht nur Aussicht ist er ist der eigentliche Sinn',

  'home.itineraries.eyebrow': 'Beispiel-Reisepläne',
  'home.itineraries.weekend': 'Wochenend-Auszeit · 2 Nächte',
  'home.itineraries.short': 'Kurze Auszeit · 4 Nächte',
  'home.itineraries.full': 'Vollständiges Reset · 7 Nächte',
  'home.itineraries.closing':
    'Jeder Aufenthalt gehört dir · Sag uns, was du brauchst den Rest übernehmen wir',
  'home.itineraries.cta': 'Mit der Planung beginnen',
  'home.itineraries.weekend.title': 'Ein Wochenende am Meer',
  'home.itineraries.weekend.body':
    'Anreise Freitag zur goldenen Stunde · Begrüßungsdrink, langsames Dinner, ein langer Schlaf · Samstag: Yoga zum Sonnenaufgang, Kräutertee, Schwimmen, Mittagessen am Strand, Nachmittagsmassage und ein Feuer-Dinner unter den Sternen · Sonntag: ein sanfter Morgen, Brunch auf der Terrasse und Transfer, wenn du bereit bist',
  'home.itineraries.short.title': 'Eine kurze Auszeit, die dich neu ordnet',
  'home.itineraries.short.body':
    'Vier Nächte, um wirklich anzukommen · Füge einen halben Tag in Elmina hinzu, eine geführte Wanderung durch Fischerdörfer, zwei Spa-Behandlungen und ein privates Dinner im Sand · Spätestens in der dritten Nacht haben sogar die Schultern Spannung vergessen',
  'home.itineraries.full.title': 'Eine Woche, um zu dir zurückzukehren',
  'home.itineraries.full.body':
    'Sieben Nächte Atem und ghanaische Sonne · Coaching-Einheiten, tägliches Yoga, Ausflüge nach Cape Coast und Kakum, Marktmorgen, Strandnachmittage und langsame Abende · Geh leichter, als du gekommen bist',

  'home.roomsTeaser.headline': 'Ein Zimmer, das zur Küste gehört',
  'home.roomsTeaser.body':
    'Wach auf zu Vogelstimmen und Meerlicht · Unsere Zimmer sind mit Bedacht für Ruhe gestaltet schlicht, schön und tief bequem · Vom Gartenrückzug bis zur Suite mit Meerblick dein Platz wartet',
  'home.roomsTeaser.cta': 'Zimmer ansehen →',

  'home.testimonials.example':
    'Ich kam erschöpft an und ging als ich selbst wieder · KoSa hat diese Art an sich',

  'home.email.headline': 'Sei als Erste*r informiert',
  'home.email.body':
    'Früher Zugang zu Preisen, neuen Erlebnissen und stillen Momenten von der Küste direkt in dein Postfach · Kein Lärm · Jederzeit abbestellbar',
  'home.email.placeholder': 'deine@email.com',
  'home.email.cta': 'Abonnieren',

  'roomsPage.headline': 'Dein Platz am Meer',
  'roomsPage.intro':
    'Jedes Zimmer bei KoSa wurde mit einer Frage im Kopf entworfen: Wie fühlt sich echte Ruhe an? Licht, das vom Ozean kommt · Luft, die den Garten trägt · Komfort, der sich nicht ankündigt er umgibt dich einfach',
  'roomsPage.cardCta': 'Jetzt buchen',
  'roomsPage.trust':
    'Buche direkt für den besten Preis · Flexible Stornierung auf allen Zimmern · Ein Begrüßungsdrink bei Ankunft unser Dank dafür, dass du gekommen bist · Fragen? Wir sind per WhatsApp erreichbar',

  'wellnessPage.headline': 'Wohlbefinden auf KoSa-Art',
  'wellnessPage.hero.title': 'Wohlbefinden auf KoSa-Art',
  'wellnessPage.hero.sub': 'Die Natur erneuert finde Balance in Körper und Geist',
  'wellnessPage.approach.eyebrow': 'Unser Ansatz',
  'wellnessPage.approach.title': 'Wohlbefinden durch Natur',
  'wellnessPage.approach.body1': 'Wir haben KoSa auf einer einfachen Überzeugung aufgebaut: Wohlbefinden sollte schön, natürlich und erreichbar sein. Hier ist Wohlbefinden kein Programm - es ist der Rhythmus des Ortes. Es liegt im Kräutertee, der bei der Ankunft auf dich wartet. In der Meeresluft, die dich im Morgengrauen begrüßt. In der Stille, von der du nicht wusstest, dass du sie brauchst.',
  'wellnessPage.approach.body2': 'Wohlbefinden ist hier nichts, was du tust. Es ist etwas, woran du dich erinnerst.',
  'wellnessPage.features.heading': 'Wellness-Angebote',
  'wellnessPage.feat.spa.title': 'Spa-Behandlungen',
  'wellnessPage.feat.spa.body': 'Kräuterbehandlungen und Massagen mit natürlichen lokalen Zutaten',
  'wellnessPage.feat.coaching.title': 'Wellness-Coaching',
  'wellnessPage.feat.coaching.body': 'Persönliche Begleitung zu Ruhe und Klarheit',
  'wellnessPage.feat.tea.title': 'Kräutertee- & Saftbar',
  'wellnessPage.feat.tea.body': 'Eine Auswahl nährender Getränke für Körper und Geist',
  'wellnessPage.feat.yoga.title': 'Yoga am Meer',
  'wellnessPage.feat.yoga.body': 'Sanfte Einheiten mit Meerblick und Meeresbrise',
  'wellnessPage.feat.mindful.title': 'Geführte Achtsamkeit',
  'wellnessPage.feat.mindful.body': 'Meditation und Atemübungen in ruhiger Natur',
  'wellnessPage.feat.nature.title': 'Verbindung zur Natur',
  'wellnessPage.feat.nature.body': 'Erholsame Spaziergänge und immersive Erlebnisse an der Küste',
  'wellnessPage.holistic.eyebrow': 'Ein ganzheitlicher Ansatz',
  'wellnessPage.holistic.title': 'Körper, Geist und Seele',
  'wellnessPage.holistic.body1': 'Unsere Programme richten sich an den ganzen Menschen Körper, Geist und Seele · Ob Entspannung, Energie oder innerer Frieden unser Team begleitet dich persönlich',
  'wellnessPage.holistic.body2': 'Vom Sonnenaufgangs-Yoga bis zur Abendmeditation, vom Tee bis zur Massage alles wirkt zusammen, um deine Balance wiederherzustellen',
  'wellnessPage.benefits.heading': 'Die Vorteile von Wellness im KoSa',
  'wellnessPage.benefit.stress.title': 'Stressabbau',
  'wellnessPage.benefit.stress.body': 'Löse Anspannung mit natürlichen Therapien und ruhiger Umgebung',
  'wellnessPage.benefit.renewal.title': 'Körperliche Erneuerung',
  'wellnessPage.benefit.renewal.body': 'Gewinne Vitalität durch Bewegung, Ernährung und Ruhe',
  'wellnessPage.benefit.clarity.title': 'Geistige Klarheit',
  'wellnessPage.benefit.clarity.body': 'Gewinne Perspektive und Fokus durch Achtsamkeit',
  'wellnessPage.benefit.lasting.title': 'Bleibende Veränderung',
  'wellnessPage.benefit.lasting.body': 'Entwickle Wellness-Gewohnheiten, die über deinen Aufenthalt hinaus bleiben',
  'wellnessPage.intro':
    'Wir haben KoSa auf einer einfachen Überzeugung gebaut: Wohlbefinden sollte schön, natürlich und erreichbar sein · Hier ist Wellness kein Programm es ist der Rhythmus des Ortes · Er liegt im Kräutertee, der dich bei der Ankunft erwartet · In der Meeresluft im Morgengrauen · In der Stille, von der du nicht wusstest, dass du sie brauchst',
  'wellnessPage.journeys.title': 'Wellness-Reisen',
  'wellnessPage.journeys.body':
    'Begleitete Erfahrungen in Ruhe, Reflexion und Erneuerung · Ob allein oder zu zweit wir gestalten deine Zeit hier um das, was Körper und Geist wirklich brauchen',
  'wellnessPage.coaching.title': 'Wellness-Coaching',
  'wellnessPage.coaching.body':
    'Persönliche Begleitung für Balance und Achtsamkeit · Setz dich mit einem unserer Coaches zusammen, atme und finde langsam den Weg zu dir zurück',
  'wellnessPage.spa.title': 'Spa-Behandlungen',
  'wellnessPage.spa.body':
    'Massagen, Aromatherapie und Kräuterbehandlungen jede ausgewählt für das, was sie dem Körper zurückgibt · Hände, die zuhören können · Behandlungen verwurzelt in diesem Land',
  'wellnessPage.tea.title': 'KoSa Tea Bar',
  'wellnessPage.tea.body':
    'Kräutertees und frische Säfte, die in Ruhe nähren · Keine Eile · Kein Lärm · Nur Wärme in einer Tasse und das Meer ganz nah',
  'wellnessPage.cta.book': 'Wellness-Erlebnis buchen',
  'wellnessPage.cta.ask': 'Sag uns, was du brauchst',

  'diningPage.headline': 'Essen, wie die Küste es vorgesehen hat',
  'diningPage.popular': 'Beliebt',
  'diningPage.intro':
    'In KoSa ist die Küche Teil des Wohlbefindens · Wir arbeiten mit lokalen Fischern und Bauern Menschen, die dieses Land und diese Gewässer kennen und lassen die Frische sprechen · Ghanaische Aromen, mit Liebe zubereitet · Eine Mahlzeit, die schmeckt, als sei sie für dich gemacht',
  'diningPage.restaurant.title': 'Das Restaurant',
  'diningPage.restaurant.body':
    'Wo der Tag beginnt und der Abend zur Ruhe kommt · Unser Restaurant serviert frische, saisonale Küche in ghanaischer Tradition mit Sorgfalt für jeden Gast am Tisch, inklusive halal, vegetarisch und Speisen, die so gut tun wie sie schmecken',
  'diningPage.restaurant.cta': 'Tisch reservieren',
  'diningPage.bar.title': 'Die Bar',
  'diningPage.bar.body':
    'Cocktails, Mocktails und frische Säfte mit dem, was die Saison hergibt · Komm zum Sonnenuntergang · Bleib so lange, wie es die Nacht erlaubt',
  'diningPage.breakfast.title': 'Frühstück',
  'diningPage.breakfast.body':
    'Die erste Mahlzeit des Tages sollte sich wie ein Geschenk anfühlen · Bunt, frisch und ohne Eile ghanaisch, kontinental oder voll wählbar · Ernährungswünsche herzlich willkommen sag uns Bescheid',
  'diningPage.private.title': 'Privat- & Special-Dinners',
  'diningPage.private.body':
    'Etwas zu feiern? Wir decken einen Tisch nur für dich am Strand, unter den Sternen, mit dem Ozean als Kulisse · Sag uns den Anlass, wir kümmern uns um den Rest',
  'diningPage.private.cta': 'Spezial-Dinner planen',
  'diningPage.gallery.eyebrow': 'Frisch aus der Küche',
  'diningPage.gallery.title': 'Food-Galerie',
  'diningPage.gallery.body': 'Ein näherer Blick auf das, was auf den Tisch kommt · gefangen, angebaut und gekocht an dieser Küste',
  'diningPage.gallery.filter.dishes': 'Gerichte',
  'diningPage.gallery.filter.breakfast': 'Frühstück',
  'diningPage.gallery.filter.drinks': 'Getränke',
  'diningPage.gallery.filter.moments': 'Am Tisch',

  'experiencesPage.headline': 'Ghana beginnt hier',
  'experiencesPage.intro':
    'KoSa liegt am Rand einer der schönsten und historisch reichsten Küsten Westafrikas · Wir sind deine Basis, dein Guide und dein Heimathafen nach jedem Abenteuer · Ob du auf dem Gelände bleibst oder darüber hinausgehst jede Erfahrung lohnt sich, mit nach Hause zu nehmen',
  'experiencesPage.property.title': 'Auf dem Gelände',
  'experiencesPage.property.body':
    'Der Ozean ist direkt dort · Genauso wie der Pool, der Garten, die Yogamatte und die Hängematte mit deinem Namen darauf · An den Tagen, an denen du einfach nur sein willst, reicht KoSa mehr als aus',
  'experiencesPage.ghana.title': 'Nach Ghana',
  'experiencesPage.ghana.body':
    'Wenn du erkunden möchtest, sind wir bereit · Cape Coast Castle · Elmina · Kakum · Die Fischerdörfer · Die Märkte · Die Geschichten, die es wert sind, gekannt zu werden · Wir verbinden dich mit Guides, die diese Orte tief kennen nicht als Touristen, sondern als Menschen, die hierhergehören',
  'experiencesPage.cta': 'Deine Erlebnisse planen',

  'eventsPage.headline': 'Es gibt immer etwas zu tun',
  'eventsPage.enquire': 'Buchen',
  'eventsPage.transport': 'Transport inklusive',
  'eventsPage.empty': 'In dieser Kategorie ist noch nichts.',

  'eventsPage.intro':
    'Manche Momente verdienen eine Kulisse, die ihnen gerecht wird · KoSa liegt zwischen Meer und Garten ein natürlicher Rahmen für Feiern, die echt wirken, Retreats, die wirklich erholen, und Treffen, bei denen man als Kollegen ankommt und als etwas Näheres geht',
  'eventsPage.weddings.title': 'Hochzeiten & Feiern',
  'eventsPage.weddings.body':
    'Eine Hochzeit bei KoSa ist die Strandzeremonie, die du dir immer vorgestellt hast Wellenrauschen, die Wärme der Küste, die Menschen, die du liebst, an einem schönen Ort versammelt · Wir kümmern uns mit Sorgfalt um jedes Detail · Du kommst und feierst',
  'eventsPage.weddings.cta': 'Hochzeit jetzt planen',
  'eventsPage.retreats.title': 'Wellness-Retreats',
  'eventsPage.retreats.body':
    'KoSa wurde zur Wiederherstellung gebaut · Gruppen-Retreats Yoga-Intensives, Achtsamkeits-Wochenenden oder individuelle Heilprogramme finden hier ein natürliches Zuhause · Wir bringen Raum, Stille und Begleitung · Du bringst die Absicht',
  'eventsPage.corporate.title': 'Firmenretreats & Offsite-Meetings',
  'eventsPage.corporate.body':
    'Die besten Ideen entstehen nicht in Konferenzräumen · Bring dein Team an die Küste, raus aus dem Alltag und sieh, was passiert, wenn Menschen endlich denken können · KoSa bietet Tagungsräume, Gruppenunterkünfte und Team-Erlebnisse, die die Menschen hinter der Arbeit wieder verbinden',
  'eventsPage.corporate.cta': 'Gruppenbuchung anfragen',
  'eventsPage.form.name': 'Name',
  'eventsPage.form.company': 'Unternehmen',
  'eventsPage.form.type': 'Event-Typ',
  'eventsPage.form.dates': 'Daten',
  'eventsPage.form.guests': 'Gästezahl',
  'eventsPage.form.message': 'Nachricht',
  'eventsPage.form.response': 'Wir antworten innerhalb von 24 Stunden',

  'planPage.headline': 'Alles, was du brauchst, um bereit anzukommen',
  'planPage.intro':
    'Wir möchten, dass dein KoSa-Erlebnis schon vor der Ankunft beginnt · Unten findest du alles, was du zur Planung brauchst Beispiel-Routen, Anreise, FAQs und die praktischen Infos, die wirklich einen Unterschied machen',
  'planPage.experiences.eyebrow': 'Was es hier zu tun gibt',
  'planPage.experiences.body':
    'Echte Erlebnisse im KoSa, vom Strand bis zur Küste wähle, was dich anspricht',
  'planPage.experiences.cta': 'Alle Erlebnisse ansehen',
  'planPage.itineraries.eyebrow': 'Beispiel-Reisepläne',
  'planPage.itineraries.body':
    'Drei vorgefertigte Aufenthalte im Tag-für-Tag-Format keine Stundenpläne, sondern Geschichten · Jede endet mit: Dies ist eine Version deines KoSa-Aufenthalts · Deine wird deine eigene sein gestalte sie bei Ankunft mit uns oder sag uns vorher, was du brauchst',
  'planPage.itineraries.cta1': 'Diesen Aufenthalt buchen',
  'planPage.itineraries.cta2': 'Plan individualisieren',
  'planPage.getting.title': 'Anreise',
  'planPage.getting.body':
    'KoSa Beach Resort liegt an der Küste der Central Region Ghanas, etwa 25 km von Elmina und 30 km vom Cape Coast Castle entfernt · Von Accras Kotoka International Airport sind es rund 3 Stunden Fahrt und wir organisieren gern den Transfer, damit deine Ruhe schon nach der Landung beginnt',
  'planPage.getting.cta': 'Flughafentransfer buchen',
  'planPage.faqs.title': 'Häufige Fragen',
  'planPage.faq.checkin.q': 'Wann ist Check-in und Check-out?',
  'planPage.faq.checkin.a':
    'Check-in ab 14:00 Uhr, Check-out bis 11:00 Uhr · Wir sind flexibel, wo wir können frag uns einfach',
  'planPage.faq.cancellation.q': 'Wie ist die Stornierungsregelung?',
  'planPage.faq.cancellation.a':
    '50 % Rückerstattung bei Stornierung mindestens 20 Tage vor Anreise; danach keine Rückerstattung · Hauptsaisonbuchungen sind nicht erstattungsfähig · Reservierungen können bis 48 Stunden vor Anreise geändert werden eine 50 %-Anzahlung bestätigt die Buchung',
  'planPage.faq.airport.q': 'Bietet ihr Flughafentransfers an?',
  'planPage.faq.airport.a':
    'Ja. Komfortable, private Transfers vom Kotoka International Airport in Accra · Bitte rechtzeitig buchen, damit wir dich bei der Ankunft abholen können',
  'planPage.faq.halal.q': 'Gibt es Halal-Mahlzeiten?',
  'planPage.faq.halal.a':
    'Ja. Halal-Optionen stehen über die gesamte Karte zur Verfügung · Vegetarische, vegane und andere Ernährungsbedürfnisse werden herzlich berücksichtigt',
  'planPage.faq.children.q': 'Können Kinder mitkommen?',
  'planPage.faq.children.a':
    'Selbstverständlich · KoSa ist ruhig, aber familienfreundlich · Sag uns das Alter wir richten alles passend ein',
  'planPage.faq.payment.q': 'Welche Zahlungsarten akzeptiert ihr?',
  'planPage.faq.payment.a':
    'Alle gängigen Karten, Mobile Money und Banküberweisung · Eine Anzahlung bestätigt die Buchung, den Rest zahlst du bei Ankunft',
  'planPage.faq.swim.q': 'Kann man im Meer schwimmen?',
  'planPage.faq.swim.a':
    'Der Atlantik hat Strömungen wir sagen dir immer die sichersten Zeiten · Der Pool ist den ganzen Tag geöffnet',
  'planPage.faq.wellness.q': 'Kann ich Wellness-Behandlungen vorab buchen?',
  'planPage.faq.wellness.a':
    'Ja bitte tu das · Spa, Coaching und Gruppensessions sind schnell ausgebucht · Sag uns vorher, was du gerne möchtest',

  'aboutPage.headline': 'Zwei Jahrzehnte am Meer. Und dennoch fühlt sich jeder Gast wie der Erste an',
  'aboutPage.opening':
    'KoSa Beach Resort entstand nicht aus einem Geschäftsplan. Es entstand aus einer Überzeugung - dass die ghanaische Küste einer der regenerierendsten Orte der Welt ist, und dass jeder, der hierher kommt, das spüren sollte. Seit über zwanzig Jahren halten wir an dieser Überzeugung fest.',
  'aboutPage.continued':
    'Wir sind Teil der Akwaaba Stays Hospitality Group - einer Familie von Unterkünften in Ghana und Westafrika, die ein gemeinsames Engagement für Gastfreundschaft teilen, die in Fürsorge, Gemeinschaft und den Orten verwurzelt ist, die wir Zuhause nennen. KoSa ist dort, wo dieses Engagement dem Wasser am nächsten lebt.',
  'aboutPage.values': 'Unsere Werte',
  'aboutPage.values.authenticity.title': 'Authentizität',
  'aboutPage.values.authenticity.body':
    'Ehrliche Gastfreundschaft, die den echten Rhythmus dieser Küste widerspiegelt · Keine Inszenierung · Kein Schein · KoSa, wie es ist und immer war',
  'aboutPage.values.community.title': 'Gemeinschaft',
  'aboutPage.values.community.body':
    'Wir arbeiten Seite an Seite mit den Menschen um uns lokale Fischer, Bauern und Handwerker, deren Arbeit und Wissen KoSa zu dem machen, was es ist · Wenn du hier bleibst, wachsen auch ihre Leben',
  'aboutPage.values.wellness.title': 'Wohlbefinden',
  'aboutPage.values.wellness.body':
    'Körper und Geist mit gutem Essen, Coaching und Stille nähren · Wir glauben, dass Wohlbefinden schön, natürlich und erreichbar sein sollte kein Luxus für wenige',
  'aboutPage.values.sustainability.title': 'Nachhaltigkeit',
  'aboutPage.values.sustainability.body':
    'Respekt für die Küste, das Land und das Leben, das sie tragen · Wir sind Hüter*innen dieses Ortes verantwortlich für ihn und für die Generationen, die nach uns kommen',
  'aboutPage.values.legacy.title': 'Vermächtnis',
  'aboutPage.values.legacy.body':
    'Zwei Jahrzehnte echter Verbindung und stetiger Fürsorge am Meer · Der Ozean hält uns demütig · Die Gäste, die zurückkehren, halten uns am Leben',
  'aboutPage.closing.headline': 'Komm und sieh selbst',
  'aboutPage.closing.body':
    'Wir könnten dir mehr erzählen aber KoSa erlebt man am besten persönlich · Die Meeresluft, das Essen, die Menschen, die Stille · Es gibt hier etwas, das sich nicht in Worte übersetzen lässt · Aber es wartet auf dich',
  'aboutPage.closing.ctaBook': 'Aufenthalt buchen',
  'aboutPage.closing.ctaGet': 'Kontakt aufnehmen',

  'exit.headline': 'Sichere dir KoSa-Tarife, bevor sie ausgebucht sind',
  'exit.body':
    'Früher Zugang zu Saisonpreisen, ruhigen Wochen und neuen Erlebnissen · Einmal im Monat, mehr nicht',
  'exit.cta': 'Halt mich auf dem Laufenden',
  'exit.placeholder': 'deine@email.com',
  'exit.dismiss': 'Nein, danke',
  'exit.thanks': 'Danke · Schau in dein Postfach',

  'common.bookYourStay': 'Aufenthalt buchen',
  'common.exploreKosa': 'KoSa entdecken',
  'common.whatsapp': 'WhatsApp',
  'common.getInTouch': 'Kontakt aufnehmen',
  'common.startPlanning': 'Mit der Planung beginnen',
  'common.readMore': 'Mehr lesen',

  'footer.quickLinks': 'Schnellzugriff',
  'footer.reviews': 'Bei unseren Gästen beliebt auf',
  'footer.address': 'Beach Road No.1, Ampenyi, Elmina, Ghana',
  'footer.group': 'Ein Haus der Akwaaba Stays Hospitality Group',

  // ─── Full-coverage UI strings (2026 i18n sweep) ────────────────────────
  'newsletter.placeholder': 'du@beispiel.com',
  'newsletter.success': 'Willkommen an der Küste',
  'newsletter.error': 'Etwas ist schiefgelaufen',
  'newsletter.failed': 'Anmeldung fehlgeschlagen',
  'newsletter.ariaEmail': 'E-Mail-Adresse',
  'newsletter.ariaSubscribe': 'Abonnieren',

  'home.hero.location': 'Elmina · Ghana',
  'home.itineraries.heading': 'Ein paar Arten, deine Zeit zu verbringen',

  'roomsPage.searchPlaceholder': 'Zimmer, Betten, Meerblick suchen…',
  'roomsPage.resultsOne': '1 Zimmertyp',
  'roomsPage.resultsMany': '{n} Zimmertypen',
  'roomsPage.searchEmpty': 'Keine Zimmer gefunden versuche ein anderes Wort oder Filter',
  'roomsPage.occupied': 'Belegt',
  'roomsPage.upTo': 'Bis zu',
  'roomsPage.guestsUnit': 'Gäste',

  'roomDetail.amenities': 'Ausstattung',
  'roomDetail.from': 'Ab',
  'roomDetail.taxesIncluded': 'Steuern und Frühstück inbegriffen',
  'roomDetail.reserve': 'Reservieren',
  'roomDetail.askConcierge': 'Den Concierge fragen',
  'roomDetail.freeCancellation': 'Kostenlose Stornierung bis 48 Stunden vor Anreise',
  'roomDetail.otherRooms': 'Weitere Zimmer, die dir gefallen könnten',
  'roomDetail.descFallback':
    'Ein stimmiger Rückzugsort weiches Leinen, geflochtene Palme, handgetöpferte Keramik · Ein Zimmer, das mit den Gezeiten atmet',
  'roomDetail.amenity.balcony': 'Balkon direkt am Strand',
  'roomDetail.amenity.bed': 'Kingsize-Bett mit Leinenbettwäsche',
  'roomDetail.amenity.shower': 'Regendusche unter freiem Himmel',
  'roomDetail.amenity.local': 'Pflegeprodukte aus der Region',
  'roomDetail.amenity.wifi': 'Schnelles WLAN',
  'roomDetail.amenity.ac': 'Klimaanlage + Deckenventilator',
  'roomDetail.amenity.breakfast': 'Tägliches Frühstück inbegriffen',
  'roomDetail.amenity.welcome': 'Willkommensrituale',

  'wellnessPage.heroSub': 'Offen für Tagesgäste und Resortgäste',
  'wellnessPage.enquiry.eyebrow': 'Anfragen',
  'wellnessPage.enquiry.title': 'Kein Aufenthalt nötig',
  'wellnessPage.enquiry.body': 'Sag uns, was dich anspricht, und wir arrangieren es ob du bei uns wohnst oder für den Tag kommst',
  'wellnessPage.enquiry.point1': 'Tagesgäste willkommen komm für eine Behandlung oder Session',
  'wellnessPage.enquiry.point2': 'Wir bestätigen die Zeit per E-Mail oder WhatsApp',
  'wellnessPage.enquiry.point3': 'Paare und kleine Gruppen möglich',
  'wellnessForm.interest': 'Was dich interessiert',
  'wellnessForm.choose': 'Programm wählen',
  'wellnessForm.notSure': 'Noch unsicher - bitte beraten',
  'wellnessForm.guestType': 'Wohnst du bei uns?',
  'wellnessForm.day': 'Tagesgast (kein Aufenthalt)',
  'wellnessForm.staying': 'Gast im KoSa',
  'wellnessForm.date': 'Wunschdatum',
  'wellnessForm.guests': 'Anzahl der Gäste',
  'wellnessForm.message': 'Sonst noch etwas?',
  'wellnessForm.submit': 'Anfrage senden',
  'wellnessForm.whatsapp': 'Per WhatsApp senden',
  'wellnessForm.thankTitle': 'Danke',
  'wellnessForm.thankBody': 'Wir haben deine Anfrage erhalten und melden uns in Kürze',
  'wellnessForm.waIntro': 'Hallo KoSa! Ich möchte eine Wellness-Anfrage stellen:',
  'wellnessPage.treatmentsHeading': 'Behandlungen & Sessions',
  'wellnessPage.treatmentsIntro': 'Stöbere nach dem, was du brauchst - Massagen und Körperarbeit im KoSa Health Spa oder die tieferen Rituale und Retreats von O2 Wellness.',
  "quote.ocean": "Das Meer hat es nicht eilig. Du solltest es auch nicht haben",
  "quote.stop": "So fühlt es sich an, endlich anzuhalten",
  'home.welcome.eyebrow': 'Akwaba · Willkommen zu Hause',
  'home.welcome.heading': 'Manche Orte besucht man Nach KoSa kommt man heim',
  'home.welcome.body': 'Erlebe, wie ein KoSa-Willkommen entsteht: Trommeln im Sand, weißes Tuch in der Brise, eine Namensfeier am Meer. So fühlt sich Ankommen an.',
  'home.welcome.cta': 'Film abspielen',
  'home.welcome.play': 'Den Welcome-Home-Film abspielen',
  "wellnessPage.hero.line": "Du brauchst kein Programm. Du brauchst die Erlaubnis, innezuhalten",
  "wellnessPage.offerings.eyebrow": "KoSa Wohlbefinden",
  "wellnessPage.yoga.title": "Yoga am Meer",
  "wellnessPage.yoga.body": "Sanfte Bewegung im Sand, Atem und Meer im selben Takt. Komm, wie du bist; jedes Niveau ist willkommen.",
  "wellnessPage.journeys.sense": "Es wird nichts geplant, was du nicht gewählt hast. Der Tag richtet sich nach dir, nicht umgekehrt.",
  "wellnessPage.coaching.sense": "Du triffst deinen Coach am Morgen nach deiner Ankunft. Einfach zum Reden.",
  "wellnessPage.spa.sense": "Die Behandlungsräume öffnen sich zum Garten. Du hörst Vogelgesang.",
  "wellnessPage.tea.sense": "Wir brühen mit Kräutern vom Grundstück. Manche Gäste fragen nach dem Rezept.",
  "wellnessPage.yoga.sense": "Die Einheiten beginnen um 7 Uhr, wenn das Licht noch weich und der Strand still ist.",
  "wellnessPage.day.eyebrow": "Ein Tag hier",
  "wellnessPage.day.heading": "So sieht ein Wellness-Tag im KoSa aus",
  "wellnessPage.day.intro": "Kein Zeitplan. Nur ein sanfter Rhythmus, dem du so viel folgst, wie du magst.",
  "wellnessPage.day.s1.time": "Bei Sonnenaufgang",
  "wellnessPage.day.s1.text": "Morgentee auf der Terrasse, während das Licht kommt. Keine Eile, noch nichts zu sein.",
  "wellnessPage.day.s2.time": "Früh am Morgen",
  "wellnessPage.day.s2.text": "Ein langsamer Spaziergang am Strand, der Sand noch kühl und das Ufer still.",
  "wellnessPage.day.s3.time": "7 Uhr",
  "wellnessPage.day.s3.text": "Yoga am Meer, Atem und Wellen im selben Takt.",
  "wellnessPage.day.s4.time": "Am späten Vormittag",
  "wellnessPage.day.s4.text": "Eine Spa-Behandlung mit offenen Gartentüren und hereinwehendem Vogelgesang.",
  "wellnessPage.day.s5.time": "Mittags",
  "wellnessPage.day.s5.text": "Mittagessen auf der Terrasse, frisch aus der Küche, in Ruhe im Schatten genossen.",
  "wellnessPage.day.s6.time": "Am Nachmittag",
  "wellnessPage.day.s6.text": "Eine Coaching-Sitzung oder einfach eine Hängematte und ein Buch. Ganz wie du magst.",
  "wellnessPage.day.s7.time": "Am Abend",
  "wellnessPage.day.s7.text": "Abendessen am Lagerfeuer, während die Sterne über dem Wasser erscheinen.",
  "wellnessPage.closing.eyebrow": "Wohlbefinden, auf deine Art",
  "wellnessPage.closing.headline": "Sag uns, was du brauchst. Um den Rest kümmern wir uns",
  "wellnessPage.closing.body": "Keine festen Programme, kein Druck. Sag uns, wie du dich fühlen möchtest, und wir gestalten deinen Aufenthalt darum herum.",
  "wellnessPage.closing.cta": "Schreib uns auf WhatsApp",

  // Experiences - kostenlose tägliche Aktivitäten
  'experiencesPage.daily.eyebrow': 'Jeden Tag, inklusive',
  'experiencesPage.daily.heading': 'Kostenlose tägliche Aktivitäten',
  'experiencesPage.daily.intro':
    'Jeder Tag im KoSa hat seinen Rhythmus. Alle Aktivitäten sind für unsere Gäste kostenlos: Mach mit, wobei du möchtest, oder genieße einfach die Ruhe.',
  'experiencesPage.daily.free': 'Kostenlos',
  'experiencesPage.daily.footnote':
    'Alle Aktivitäten sind für Gäste kostenlos. Anmeldung an der Rezeption. Das Programm kann variieren.',

  // Wellness - Pakete
  'planPage.packages.eyebrow': 'Kuratierte Aufenthalte',
  'planPage.packages.heading': 'Aufenthaltspakete',
  'planPage.packages.intro':
    'Alles arrangiert. Du musst nur ankommen. Jedes Paket umfasst tägliches Frühstück, eine kostenlose 10-minütige Willkommensmassage bei der Ankunft und vollen Strandzugang.',
  'planPage.packages.enquireRates': 'Frag nach unseren aktuellen Preisen',
  'planPage.packages.enquire': 'Anfragen',

  // Wellness - Extras
  'wellnessPage.enhance.eyebrow': 'Extras',
  'wellnessPage.enhance.heading': 'Verfeinere deinen Aufenthalt',
  'wellnessPage.enhance.intro':
    'Füge jedem Paket oder jeder Zimmerbuchung etwas Besonderes hinzu. Arrangiere es an der Rezeption, telefonisch oder bei der Buchung.',
  'wellnessPage.enhance.cta': 'Nach Extras fragen',
  'wellnessPage.enhance.enquire': 'Anfragen',
  'wellnessPage.beginHeadline': 'Beginne deinen Weg zurück',

  'experiencesPage.buildDay': 'Lass uns deinen perfekten Tag gestalten',

  'contactPage.eyebrow': 'Kontakt',
  'contactPage.title': 'Sprich mit uns, ganz einfach',
  'contactPage.whereToFind': 'Wo du uns findest',
  'contactPage.whatsappUs': 'Schreib uns auf WhatsApp',
  'contactPage.mapTitle': 'Standortkarte von KoSa',

  'bookPage.eyebrow': 'Plane deine Rückkehr',
  'bookPage.title': 'Aufenthalt buchen',
  'bookPage.subtitle': 'Bestpreis, kostenlose Stornierung bis 48 Stunden, sofortige Bestätigung',

  'book.step.dates': 'Daten',
  'book.step.room': 'Zimmer',
  'book.step.guest': 'Angaben',
  'book.step.confirm': 'Bestätigen',
  'book.datesHeading': 'Wann möchtest du bleiben?',
  'book.checkIn': 'Anreise',
  'book.checkOut': 'Abreise',
  'book.adults': 'Erwachsene',
  'book.children': 'Kinder',
  'book.continue': 'Weiter',
  'book.editDates': 'Daten ändern',
  'book.guestHeading': 'Deine Angaben',
  'book.firstName': 'Vorname',
  'book.lastName': 'Nachname',
  'book.email': 'E-Mail',
  'book.phone': 'Telefon',
  'book.country': 'Land',
  'book.notes': 'Anmerkungen (optional)',
  'book.confirmReservation': 'Reservierung bestätigen',
  'book.guests': 'Gäste',
  'book.adultsUnit': 'Erwachsene',
  'book.childrenUnit': 'Kinder',
  'book.nights': 'Nächte',
  'book.nightsUnit': 'Nächte',
  'book.total': 'Gesamt',
  'book.taxesLine': 'Steuern und Frühstück inbegriffen · Kostenlose Stornierung bis 48 Stunden',
  'book.doneHeading': 'Akwaaba wir haben deine Buchung',
  'book.confirmationLabel': 'Bestätigung:',
  'book.doneBody':
    'Eine Bestätigung wurde an deine E-Mail gesendet · Unser Concierge meldet sich innerhalb eines Tages mit Anreisedetails und einem Willkommensritual',
  'book.returnHome': 'Zur Startseite',
  'book.whatsappUs': 'Schreib uns auf WhatsApp',
  'book.errRequired': 'Erforderlich',
  'book.errEmail': 'Gültige E-Mail erforderlich',
  'book.failed': 'Buchung fehlgeschlagen',

  'eventsPage.form.optWedding': 'Hochzeit',
  'eventsPage.form.optRetreat': 'Wellness-Retreat',
  'eventsPage.form.optCorporate': 'Firmen-Offsite',
  'eventsPage.form.optOther': 'Andere Feier',
  'eventsPage.form.thankYou': 'Danke',
  'eventsPage.form.error': 'Bitte gib deinen Namen und eine gültige E-Mail an',
  'eventsPage.form.sendError': 'Deine Anfrage konnte nicht gesendet werden',
  'eventsPage.form.sending': 'Wird gesendet…',

  'emailCapture.invalid': 'Bitte gib eine gültige E-Mail an',
  'emailCapture.error': 'Anmeldung fehlgeschlagen',

  'tour.viewRooms': 'Zimmer ansehen',
  'tour.fullscreen': 'Vollbild',
  'tour.loading': 'Lädt',
  'tour.loadingTour': 'Tour wird geladen…',
  'tour.noWebgl': 'Dein Gerät unterstützt keine 360°-Ansicht genieße stattdessen eine Bildergalerie',

  'common.email': 'E-Mail',
  'common.returnHome': 'Zur Startseite',
  'error.headline': 'Eine kleine Welle hat uns umgeworfen',
  'error.body': 'Bitte versuche es erneut wir finden das Gleichgewicht wieder',
  'error.retry': 'Erneut versuchen',
  'notFound.headline': 'Auf hoher See verloren',
  'notFound.body': 'Die gesuchte Seite ist abgetrieben · Wir bringen dich nach Hause',
  'notFound.concierge': 'Mit dem Concierge sprechen',
  'experiencesPage.detailFallback': 'Die Sessions sind intim höchstens sechs Gäste · Die Zeiten verschieben sich sanft mit Gezeiten und Sonne · Sprich mit unserem Concierge für private Buchungen, individuelle Rituale und saisonale Angebote',
  'experiencesPage.addToStay': 'Zum Aufenthalt hinzufügen',
  'common.speakConcierge': 'Mit dem Concierge sprechen',
  'blogPage.eyebrow': 'Briefe von der Küste',
  'blogPage.comingSoon': 'Briefe von der Küste bald verfügbar',
  'blogPage.subtitle': 'Geschichten, Tipps und stille Notizen aus unserem Stück Küste',
  'blogPage.featured': 'Empfohlen',
  'blogPage.readStory': 'Geschichte lesen',
  'blogPage.readMins': 'Min Lesezeit',
  'blogPage.moreStories': 'Mehr aus dem Journal',
  'blogPage.backToJournal': 'Zurück zum Journal',
  'blogPage.cta.headline': 'Komm und erlebe es selbst',
  'blogPage.cta.body': 'Die Küste wartet, wann immer du bereit bist',
  'eventsPage.form.datesPlaceholder': 'z. B. 12.–15. Aug. 2026',
  'eventsPage.form.guestsPlaceholder': 'z. B. 40',
  'a11y.close': 'Schließen',
  'a11y.previous': 'Zurück',
  'a11y.next': 'Weiter',
  'a11y.openMenu': 'Menü öffnen',
  'a11y.closeMenu': 'Menü schließen',
  'a11y.scrollNext': 'Zum nächsten Abschnitt',
  'a11y.resortChat': 'Resort-Chat',
  'gallery.empty': 'Noch keine Bilder in der Galerie',
  'chat.errorEmpty': "Akwaaba ich bin da, aber mein Concierge-Gehirn war kurz still · Versuche es erneut oder schreib uns auf WhatsApp unter +233 24 437 5432",
  'chat.errorTimeout': 'Das hat länger gedauert als erwartet versuche es erneut oder schreib uns auf WhatsApp unter +233 24 437 5432',
  'chat.errorGeneric': "Ich erreiche die Resort-Informationen gerade nicht · Schreib uns auf WhatsApp unter +233 24 437 5432, wir antworten gleich",
  'alt.heroShoreline': 'Luftaufnahme der Küste von KoSa, Elmina, Ghana',
  'alt.feelingHammock': 'Eine ruhige Hängematte zwischen den Palmen von KoSa',
  'alt.aboutSea': 'KoSa Beach Resort am Meer',
  'aboutPage.enrichedSetting': 'Es zeigt sich in den Fischern, mit denen wir zusammenarbeiten, den Bauern, die unsere Küche versorgen, den Handwerkern, deren Hände all das geformt haben, was dich hier umgibt.',
  'aboutPage.enrichedEco': 'Wir wollten nie ein Luxusresort bauen. Wir wollten einen Ort schaffen, an dem man die Küste so erleben kann, wie sie wirklich ist - ungehetzt, großzügig, lebendig.',
  'diningPage.bar.name': 'Kooki Beach Bar',
  'diningPage.bar.hours': 'Cocktails bis 22 Uhr',
  'diningPage.restaurant.hours': 'Frühstück, Mittag- & Abendessen · 7 bis 21 Uhr, täglich',
  'experiencesPage.signature.eyebrow': 'Signature-Erlebnisse',
  'experiencesPage.signature.headline': 'Eine Handvoll Dinge, gemeinsam mit denen, die sie kennen',
  'experiencesPage.signature.ampenyi.title': 'Spaziergang durch Ampenyi',
  'experiencesPage.signature.ampenyi.body': 'Ein geführter Gang durch Ampenyi begegne den Fischern, sieh wie der Fang ankommt, und (wenn er da ist) erweise dem Chief deine Aufwartung',
  'experiencesPage.signature.capeCoast.title': 'Cape Coast Castle',
  'experiencesPage.signature.capeCoast.body': 'Eine kurze Fahrt nach Osten · Ein Gewicht, das es lohnt zu tragen nimm Wasser mit, lass danach Zeit für die Stille',
  'experiencesPage.signature.elmina.title': 'Elmina Castle',
  'experiencesPage.signature.elmina.body': 'Zwanzig Minuten von KoSa. Eines der ältesten von Europäern errichteten Bauwerke Westafrikas, in Ruhe begangen',
  'experiencesPage.signature.kakum.title': 'Kakum-Nationalpark',
  'experiencesPage.signature.kakum.body': 'Regenwald, Hängebrücken in der Baumkrone, Schmetterlinge, die du nur hier siehst · Früh los, rechtzeitig zurück zum Abendessen',
  'experiencesPage.signature.massage.title': 'Thai-Massage am Meer',
  'experiencesPage.signature.massage.body': 'Wähle, wo: am Strand mit den Wellen, im Garten unter den Palmen oder in der Ruhe deines Zimmers',
  'experiencesPage.signature.horse.title': 'Reiten & Schmuck-Workshops',
  'experiencesPage.signature.horse.body': 'Strandritte zur goldenen Stunde, Schmuckworkshops mit lokalen Handwerker*innen kleine Dinge, die einen Aufenthalt zur Erinnerung machen',
};

const fr = { ...frBase, ...frRedesign };
const es = { ...esBase, ...esRedesign };
const nl = { ...nlBase, ...nlRedesign };
const de = { ...deBase, ...deRedesign };
const zhAll = { ...zh, ...zhRedesign };

export const dictionaries = { en, fr, es, nl, de, zh: zhAll } as const;
export type DictKey = keyof typeof en;

export function translate(locale: Locale, key: DictKey): string {
  return dictionaries[locale]?.[key] ?? dictionaries.en[key] ?? key;
}