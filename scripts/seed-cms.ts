/**
 * Seed the CMS with the editorial fallback content from `lib/content/home.ts`,
 * including FR/ES/NL/DE translations sourced from the i18n dictionaries.
 *
 * Idempotent: matches by slug/sceneId/(guestName+sortOrder); skips rows that
 * already exist. Re-run safely after schema changes.
 *
 *   pnpm tsx scripts/seed-cms.ts
 *   # or: npm run db:seed-cms
 */

import { prisma } from '../lib/prisma';
import {
  rooms as fallbackRooms,
  experiences as fallbackExperiences,
  treatments as fallbackTreatments,
  testimonials as fallbackTestimonials,
  gallery as fallbackGallery,
} from '../lib/content/home';
import { dictionaries, SUPPORTED_LOCALES, type Locale } from '../lib/i18n/dictionaries';
import type { Prisma } from '@prisma/client';

const NON_EN: Locale[] = SUPPORTED_LOCALES.filter((l) => l !== 'en') as Locale[];

function dict(locale: Locale, key: string): string | null {
  // Cast is safe the dictionary type is exact, but we want runtime lookup.
  const v = (dictionaries[locale] as unknown as Record<string, string | undefined>)[key];
  return typeof v === 'string' && v.trim().length ? v : null;
}

/** Build a translations object for an entity given mapping `field → dict key`. */
function buildTranslations(map: Record<string, string>): Prisma.InputJsonValue | undefined {
  const out: Partial<Record<Locale, Record<string, string>>> = {};
  for (const locale of NON_EN) {
    const overlay: Record<string, string> = {};
    for (const [field, dictKey] of Object.entries(map)) {
      const v = dict(locale, dictKey);
      if (v) overlay[field] = v;
    }
    if (Object.keys(overlay).length) out[locale] = overlay;
  }
  return Object.keys(out).length ? (out as unknown as Prisma.InputJsonValue) : undefined;
}

const ROOM_CATEGORY: Record<string, 'SUITE' | 'PALM_SIDE' | 'BEACH_VIEW'> = {
  'Garden View': 'SUITE',
  'Palm Side': 'PALM_SIDE',
  'Beach View': 'BEACH_VIEW',
};

async function seedRooms() {
  let added = 0;
  for (let i = 0; i < fallbackRooms.length; i++) {
    const r = fallbackRooms[i];
    const exists = await prisma.room.findUnique({ where: { slug: r.slug }, select: { id: true } });
    if (exists) continue;

    const name = dict('en', `rooms.${r.slug}.name`) ?? r.slug;
    const tagline = dict('en', `rooms.${r.slug}.tagline`);

    await prisma.room.create({
      data: {
        slug: r.slug,
        name,
        tagline,
        category: ROOM_CATEGORY[r.category],
        price: r.price,
        currency: r.currency,
        image: r.image,
        gallery: [],
        amenities: [],
        features: [],
        sortOrder: i,
        translations: buildTranslations({
          name: `rooms.${r.slug}.name`,
          tagline: `rooms.${r.slug}.tagline`,
        }),
      },
    });
    added += 1;
  }
  console.log(`Rooms: +${added}`);
}

async function seedTreatments() {
  let added = 0;
  for (let i = 0; i < fallbackTreatments.length; i++) {
    const t = fallbackTreatments[i];
    const exists = await prisma.treatment.findUnique({ where: { slug: t.slug }, select: { id: true } });
    if (exists) continue;
    const name = dict('en', `treatments.${t.slug}.name`) ?? t.slug;
    const durationMin = parseInt(t.duration, 10) || 60;
    await prisma.treatment.create({
      data: {
        slug: t.slug,
        name,
        durationMin,
        price: t.price,
        currency: 'USD',
        sortOrder: i,
        translations: buildTranslations({
          name: `treatments.${t.slug}.name`,
        }),
      },
    });
    added += 1;
  }
  console.log(`Treatments: +${added}`);
}

async function seedExperiences() {
  let added = 0;
  for (let i = 0; i < fallbackExperiences.length; i++) {
    const e = fallbackExperiences[i];
    const exists = await prisma.experience.findUnique({ where: { slug: e.slug }, select: { id: true } });
    if (exists) continue;
    const label = dict('en', `experiences.${e.slug}.label`) ?? e.slug;
    const title = dict('en', `experiences.${e.slug}.title`) ?? e.slug;
    const description = dict('en', `experiences.${e.slug}.description`) ?? '';
    await prisma.experience.create({
      data: {
        slug: e.slug,
        label,
        title,
        description,
        image: e.image,
        gallery: [],
        adinkra: e.adinkra,
        sortOrder: i,
        translations: buildTranslations({
          label: `experiences.${e.slug}.label`,
          title: `experiences.${e.slug}.title`,
          description: `experiences.${e.slug}.description`,
        }),
      },
    });
    added += 1;
  }
  console.log(`Experiences: +${added}`);
}

async function seedGallery() {
  let added = 0;
  const existing = await prisma.galleryItem.count();
  if (existing > 0) {
    console.log(`Gallery: ${existing} item(s) already present skipped`);
    return;
  }
  for (let i = 0; i < fallbackGallery.length; i++) {
    await prisma.galleryItem.create({
      data: { imageUrl: fallbackGallery[i], sortOrder: i },
    });
    added += 1;
  }
  console.log(`Gallery: +${added}`);
}

async function seedTestimonials() {
  let added = 0;
  const existing = await prisma.testimonial.count();
  if (existing > 0) {
    console.log(`Testimonials: ${existing} row(s) already present skipped`);
    return;
  }
  for (let i = 0; i < fallbackTestimonials.length; i++) {
    const t = fallbackTestimonials[i];
    const country = dict('en', `testimonials.${t.index}.country`);
    const quote = dict('en', `testimonials.${t.index}.quote`) ?? '';
    await prisma.testimonial.create({
      data: {
        guestName: t.name,
        country,
        rating: t.rating,
        quote,
        avatarUrl: t.avatar,
        sortOrder: i,
        translations: buildTranslations({
          country: `testimonials.${t.index}.country`,
          quote: `testimonials.${t.index}.quote`,
        }),
      },
    });
    added += 1;
  }
  console.log(`Testimonials: +${added}`);
}

async function main() {
  console.log('Seeding CMS from fallback content…');
  await seedRooms();
  await seedTreatments();
  await seedExperiences();
  await seedGallery();
  await seedTestimonials();
  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
