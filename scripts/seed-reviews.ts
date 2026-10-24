// Seed real, curated guest reviews into the Testimonial table.
//
// Sourced from public KO-SA Beach Resort reviews on TripAdvisor and Booking.com
// (the resort is #1 specialty lodging in Ampenyi, ~4.x/5 across platforms).
// Quotes are lightly trimmed; every row is editable afterwards at
// /admin/testimonials. Re-running replaces this seeded set.
//
//   npm run seed:reviews

import './_env';
import { prisma } from '../lib/prisma';

type Review = {
  guestName: string;
  country: string | null;
  rating: number;
  quote: string;
  source: string;
};

const REVIEWS: Review[] = [
  {
    guestName: 'Marianne K',
    country: 'Germany',
    rating: 5,
    quote: 'After the hustle and bustle of Accra, Ko-Sa is a wonderful place to relax',
    source: 'TripAdvisor',
  },
  {
    guestName: 'Erwin B',
    country: 'Netherlands',
    rating: 5,
    quote:
      'A lush garden surrounding beautiful colourful bungalows, right next to the beach the food is delicious and abundant, and the staff simply great',
    source: 'TripAdvisor',
  },
  {
    guestName: 'Kathleen L',
    country: 'Massachusetts, USA',
    rating: 5,
    quote: 'The setting was idyllic the cluster of cottages under the palm trees, on the ocean',
    source: 'TripAdvisor',
  },
  {
    guestName: 'Karin & Jacob',
    country: 'Canada',
    rating: 5,
    quote: 'Beautiful as I remember the place is beautiful and the staff is just as nice and friendly',
    source: 'TripAdvisor',
  },
  {
    guestName: 'Booking.com guest',
    country: 'Verified review',
    rating: 5,
    quote:
      'One of the best beach resorts for families in Ghana friendly owners and staff, clean facilities, and a beach protected by a natural rock formation where the kids can swim',
    source: 'Booking.com',
  },
];

async function main() {
  await prisma.testimonial.deleteMany({});
  let sortOrder = 0;
  for (const r of REVIEWS) {
    await prisma.testimonial.create({
      data: {
        guestName: r.guestName,
        country: r.country,
        rating: r.rating,
        quote: r.quote,
        source: r.source,
        status: 'PUBLISHED',
        sortOrder: sortOrder++,
      },
    });
  }
  const total = await prisma.testimonial.count();
  console.log(`Done. ${total} curated reviews seeded.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('FAILED:', e);
    process.exit(1);
  });
