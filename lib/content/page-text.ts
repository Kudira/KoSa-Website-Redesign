// Page wording that is not translated (English only): the wellness journeys,
// the philosophy page and the legal pages. Edit in Admin > Pages; these are the
// built-in defaults.
//
// Legal text format: a line starting "## " is a heading, "- " is a bullet,
// **bold** is bold, and a blank line starts a new paragraph.

import { overridable } from './store';

const RAW = {
  wellness: {
    escapesEyebrow: 'One-day escapes',
    escapesHeading: 'Signature day journeys',
    escapesIntro:
      'Three ways to spend a single unhurried day at O2. Each includes treatments, a fresh juice elixir where noted, and a wholesome meal.',
    escapeButton: 'Reserve this escape',
    retreatsEyebrow: 'Multi-day retreats',
    retreatsHeading: 'Give it room to breathe',
    retreatsIntro:
      'The Signature Rotation carries Relaxation, Detox and Beauty days across a longer stay, with room and full board included throughout.',
    retreatDaysWord: 'days',
    retreatTotalLine: 'total, including {days} nights',
    retreatsFootnote: 'The Signature Rotation extends to 7 or 10-day journeys; see the tiers above.',
    trackSpaLabel: 'Spa Journey',
    trackStayLabel: 'With 3 Nights’ Stay',
    trackOneDay: 'Also available as a One-Day Escape',
    trackButton: 'Enquire About This Retreat',
    designEyebrow: 'Beyond the menu',
    designHeading: 'Or, let’s design yours',
    designIntro:
      'Not every guest fits a set journey. Sit with our wellness team for a private consultation, and we’ll build something around what you actually need, pulled from our full treatment menu.',
    step1Title: 'Consult',
    step1Body: 'A private session to talk through goals, sensitivities, and time on property.',
    step2Title: 'Design',
    step2Body: 'We build your itinerary from the same menu behind every package above.',
    step3Title: 'Arrive and exhale',
    step3Body: 'Your rhythm is ready when you check in, with nothing left to plan.',
    consultButton: 'Book a consultation',
    consultNote: 'Private Wellness Consultation, GHS 200, credited toward your custom itinerary.',
  },
  philosophy: {
    eyebrow: 'Our philosophy',
    title: 'The five layers of self',
    subtitle: 'A quiet, Akan-rooted framework woven into every part of the stay: body, breath, mind, knowing, joy.',
    introEyebrow: 'Where we begin',
    introHeading: 'A resort, but really a frame for paying attention',
    introBody:
      'The five layers, drawn from Akan thought and gently held, are the lens we use to plan a morning, to lay a table, to choose the linen. They are not amenities. They are the questions the property asks the guest: how is your body, how is your breath, how is your mind, what do you know now, and where is your joy.',
    layer1Twi: 'Honam',
    layer1Name: 'The Body',
    layer1Body:
      'Soft linen, salt water before breakfast, a massage with shea butter. We treat the body as the first room you stay in, the one before the suite.',
    layer2Twi: 'Honhom',
    layer2Name: 'The Breath',
    layer2Body:
      'Sunrise yoga by the sea and the rhythm of the surf, slower than yours when you arrive and the same as yours when you leave. Breath is the pace we keep.',
    layer3Twi: 'Adwene',
    layer3Name: 'The Mind',
    layer3Body:
      'The mind is given less to chew on, so it can taste again: the Atlantic, the food, the conversation across the table.',
    layer4Twi: 'Honhom Kronkron',
    layer4Name: 'The Knowing',
    layer4Body:
      'The quiet sense of place that arrives on the second morning. Knowing is what unhurried hospitality grows on its own; we just leave it space.',
    layer5Twi: 'Anigye',
    layer5Name: 'The Joy',
    layer5Body:
      'Drumming circles where guests join the rhythm without asking permission. Joy is communal here. It is not entertainment; it is the by-product of belonging.',
    closingEyebrow: 'And then you arrive',
    closingHeading: 'The five layers don’t need to be learned. They need to be remembered.',
    closingBody:
      'We don’t teach the philosophy. We design the days so that by the third morning, you’ve found it on your own: in the slowness of breakfast and the sound of the sea at night.',
    closingLine: 'Life is better at the beach.',
    closingButton: 'Plan your stay',
    closingLink: 'More about KoSa',
  },
  privacy: {
    title: 'Privacy Policy',
    updated: 'October 2026',
    body: `KoSa Beach Resort ("KoSa", "we", "us") respects your privacy. This policy explains what personal information we collect when you visit **ko-sa.com**, make a reservation, contact us or subscribe to our newsletter, how we use it, and the rights you have over it.

## 1. Information we collect
- **Booking details**: name, email, phone, dates of stay and guest numbers. Reservations and payments are handled by our booking partner Cloudbeds, with payments through Paystack.
- **Contact and newsletter**: the name and email you send through our forms.
- **Concierge chat**: messages you exchange with Abena, our website concierge, or with our team through the chat. They are kept for 90 days to help us answer you.
- **Technical data**: IP address, device, browser and pages visited, through cookies and analytics, for site reliability and overall reporting.

## 2. How we use it
We use your information to manage your reservation, provide the services you ask for, answer enquiries, send booking emails and (where you have opted in) news from KoSa, meet legal obligations, and improve our website.

## 3. Sharing
We share data only with the services that help us run the resort and this website: Cloudbeds (bookings), Paystack (payments), Resend (email), Supabase and Vercel (hosting), and analytics tools. We never sell personal data.

## 4. Your rights
You can ask to see, correct, delete or move your personal data, withdraw consent for marketing, or complain to the Ghana Data Protection Commission. Email info@ko-sa.com and we will respond within 30 days.

## 5. Cookies
We use a small number of cookies for your session, your language choice and overall analytics. You can switch cookies off in your browser; some parts of the site may then work less well.

## 6. Retention
Booking records are kept for 7 years (Ghana Revenue Authority requirement), contact enquiries for 24 months, chats for 90 days, and newsletter subscriptions until you unsubscribe.

## 7. Contact
KoSa Beach Resort, Beach Road No.1, Ampenyi, Elmina, Ghana. info@ko-sa.com`,
  },
  terms: {
    title: 'Terms of Service',
    updated: 'October 2026',
    body: `These terms cover your use of **ko-sa.com** and any reservation made through it. By booking with us, you agree to them.

## 1. Reservations and rates
Rates are shown in Ghana cedis (GHS). Reservations are made on our secure Cloudbeds booking page. A 30% deposit is required to confirm every booking, and the remaining balance is due on arrival. KoSa is cashless: we accept Mobile Money, card, Paystack payment links, bank transfer and QR payments.

## 2. Cancellation policy
- **More than 3 days before arrival**: free cancellation.
- **Within 3 days of arrival**: 50% of the deposit is refunded.
- **Within 24 hours of arrival, or no-show**: 50% of the deposit is kept.
- The deposit invoice is valid for 2 days.

## 3. Check-in and check-out
Check-in is from 2pm and check-out by 11am. Early check-in or late check-out may be possible, subject to availability. Photo ID is required at check-in for all guests over 18.

## 4. Conduct
KoSa is a place to rest. We ask all guests to keep noise low after 10pm, to respect our team and other guests, and to treat the resort and its surroundings with care. We may decline service to anyone whose behaviour disturbs others.

## 5. Damages
Guests are responsible for damage to the property caused by themselves or their party, beyond reasonable wear.

## 6. Liability
As far as the law allows, KoSa is not liable for indirect loss, loss of personal property, or interruptions caused by events beyond our control (severe weather, public unrest, utility outages and similar). Our maximum liability is the total amount paid for your reservation.

## 7. Website use
Content on ko-sa.com belongs to KoSa Beach Resort or is used with permission. Personal viewing is welcome; copying or commercial use needs our written permission.

## 8. Governing law
These terms are governed by the laws of the Republic of Ghana.

## 9. Contact
KoSa Beach Resort, Beach Road No.1, Ampenyi, Elmina, Ghana. info@ko-sa.com`,
  },
};

export const pageTextDefaults = RAW;

/** English-only page wording. Admin edits (/admin/pages) win. */
export const pageText = overridable('text', RAW);
