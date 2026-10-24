// Site-level configuration. Keep aligned with KOSA Brand Guide + Website
// Content Brief. The nav structure here drives Navbar, Footer and the
// AdminShell's "View site" link.

export const site = {
  name: 'KoSa Beach Resort',
  brand: 'Akwaaba Stays',
  group: 'Akwaaba Stays Hospitality Group',
  domain: 'ko-sa.com',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://ko-sa.com',
  description:
    "Eco-luxury beach resort in Ampenyi, Elmina Ghana's coastal sanctuary for the soul. Reconnect, recharge, renew",
  tagline: 'Life is better at the beach',
  taglines: ['Life is better at the beach', 'Simply, Breathe', 'Simply, Beach'] as const,
  location: { lat: 5.0853, lng: -1.3496, city: 'Ampenyi · Elmina', region: 'Central Region', country: 'Ghana' },
  // External Cloudbeds booking engine. Every "Book Now" / room-booking CTA
  // points here for now (opens in a new tab). Swap this single value when the
  // native booking flow goes live.
  bookingUrl: 'https://us2.cloudbeds.com/en/reservation/65CAqa?currency=ghs',
  contact: {
    email: 'info@ko-sa.com',
    phone: '+233 24 437 5432',
    whatsapp: '233244375432',
    whatsappMessage: "Hi KoSa! I'd like to find out more about booking a stay",
    address: 'Beach Road No.1, Ampenyi, Elmina, Ghana',
  },
  socials: {
    instagram: 'https://www.instagram.com/kosabeachresort',
    facebook: 'https://www.facebook.com/kosabeachresort',
    tripadvisor: 'https://www.tripadvisor.com/Hotel_Review-Ko-Sa-Beach-Resort',
    whatsapp: 'https://wa.me/233244375432',
  },
  reviews: {
    google: { score: 4.8, max: 5, url: 'https://maps.google.com/?cid=ko-sa-beach-resort' },
    booking: { score: 9.1, max: 10, url: 'https://booking.com/hotel/gh/ko-sa-beach-resort' },
    tripadvisor: { score: 4.7, max: 5, url: 'https://www.tripadvisor.com/Hotel_Review-Ko-Sa-Beach-Resort' },
    totalGuests: 5000,
  },
  // Primary navigation. Experiences stays a top-level item; the secondary
  // destinations (Events, Gallery, Journal, Virtual Tour, Contact) live in an
  // "Explore" dropdown so every page is reachable from the navbar, not just the
  // footer. Order: Stay · Wellness · Dine · Experiences · Explore ▾ ·
  //   Plan Your Visit · Our Story · [Book Now]
  nav: [
    { label: 'Stay', href: '/rooms', dictKey: 'nav.stay' },
    { label: 'Wellness', href: '/wellness', dictKey: 'nav.wellness' },
    { label: 'Dine', href: '/dining', dictKey: 'nav.dine' },
    { label: 'Experiences', href: '/experiences', dictKey: 'nav.experiences' },
    {
      label: 'Explore',
      href: '/gallery',
      dictKey: 'nav.explore',
      children: [
        { href: '/events', dictKey: 'nav.events' },
        { href: '/gallery', dictKey: 'nav.gallery' },
        { href: '/blog', dictKey: 'nav.blog' },
        // Virtual Tour temporarily hidden from the nav (re-enable when ready).
        // { href: '/virtual-tour', dictKey: 'nav.virtualTour' },
        { href: '/contact', dictKey: 'nav.contact' },
      ],
    },
    { label: 'Plan Your Visit', href: '/plan', dictKey: 'nav.plan' },
    { label: 'Our Story', href: '/about', dictKey: 'nav.about' },
  ] as const,
} as const;

export type Site = typeof site;

// Convenience: flat list of all reachable primary nav items.
export const allNavLinks: { href: string; dictKey: string }[] = site.nav.map((item) => ({
  href: item.href,
  dictKey: item.dictKey,
}));
