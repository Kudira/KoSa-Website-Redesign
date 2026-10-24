// Home. The page is one day at KoSa, then the morning after:
//   dawn     arrival film, a slow breath of a paragraph
//   the day  first light to the last star, the sky changing as you read
//   morning  the rooms you wake up in
//   noon     the spa and the table
//   at sea   the Welcome Home film
//   golden   ways to stay
//   dusk     guests in their own words (only when real reviews exist)
//   night    the footer says goodnight

import { HeroFilm } from '@/components/home/HeroFilm';
import { Exhale } from '@/components/home/Exhale';
import { DayAtKosa, type DayMoment } from '@/components/home/DayAtKosa';
import { RoomsDrift } from '@/components/home/RoomsDrift';
import { WellTable } from '@/components/home/WellTable';
import { Homecoming } from '@/components/home/Homecoming';
import { Stays } from '@/components/home/Stays';
import { Voices } from '@/components/home/Voices';
import { listPublicRooms } from '@/lib/cms/rooms';
import { listPublicTestimonials } from '@/lib/cms/testimonials';
import { getSetting } from '@/lib/cms/settings';
import { media } from '@/lib/content/media';

export const dynamic = 'force-dynamic';

const MOMENTS: DayMoment[] = [
  { key: 'firstLight', sky: 'dawn', image: media.wellness.yoga, href: '/wellness' },
  { key: 'breakfast', sky: 'morning', image: media.dining.breakfast, href: '/dining' },
  { key: 'atlantic', sky: 'noon', image: media.gallery.beach1, href: '/experiences' },
  { key: 'quiet', sky: 'noon', image: media.wellness.tea, href: '/wellness' },
  { key: 'golden', sky: 'golden', image: media.gallery.beach12, href: '/experiences' },
  { key: 'fire', sky: 'dusk', image: media.drumCircle, href: '/dining' },
  { key: 'stars', sky: 'night', image: media.scenery3, href: '/about' },
];

export default async function HomePage() {
  const [rooms, testimonials, pricing, hero] = await Promise.all([
    listPublicRooms(),
    listPublicTestimonials(),
    getSetting('pricing'),
    getSetting('hero'),
  ]);

  return (
    <>
      <HeroFilm videoUrl={hero.videoUrl} posterUrl={hero.posterUrl} />
      <Exhale />
      <DayAtKosa moments={MOMENTS} />
      <RoomsDrift rooms={rooms} showPrices={!pricing.hideRoomPrices} />
      <WellTable />
      <Homecoming />
      <Stays />
      {/* Only real reviews published in the admin; never placeholder quotes. */}
      <Voices testimonials={testimonials.filter((q) => !q.id.startsWith('fallback'))} />
    </>
  );
}
