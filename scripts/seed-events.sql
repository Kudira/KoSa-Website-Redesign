-- Seed KO-SA events/activities (sourced from ko-sa.com/activities + Naming Ceremony).
-- Idempotent: clears the table then inserts the full set.
DELETE FROM "Event";

INSERT INTO "Event"
  ("id","slug","title","category","description","image","transportIncluded","priceNote","status","sortOrder","createdAt","updatedAt")
VALUES
  (gen_random_uuid()::text,'cooking-class','Cooking Class','Culinary',
   'Learn to prepare authentic Ghanaian dishes with our expert chefs, then sit down to enjoy what you have made.',
   'https://ubsgvfouroqkgqufzeat.supabase.co/storage/v1/object/public/kosa-public/gallery/dining/2-772A1911.webp',
   false,'On request','PUBLISHED',1,now(),now()),

  (gen_random_uuid()::text,'market-tour-with-cooking','Market Tour with Cooking','Culinary',
   'Shop for fresh ingredients at a vibrant local market, then return to the resort to cook alongside our chefs.',
   'https://ubsgvfouroqkgqufzeat.supabase.co/storage/v1/object/public/kosa-public/gallery/dining/0-772A1897.webp',
   true,'On request','PUBLISHED',2,now(),now()),

  (gen_random_uuid()::text,'drumming-and-dancing','Drumming and Dancing','Cultural',
   'Immerse yourself in traditional Ghanaian rhythms and movements with local drummers and dancers.',
   'https://ubsgvfouroqkgqufzeat.supabase.co/storage/v1/object/public/kosa-public/gallery/resort/0-772A4907.webp',
   true,'On request','PUBLISHED',3,now(),now()),

  (gen_random_uuid()::text,'castle-tours','Castle Tours','Cultural',
   'A full-day exploration of the historic coastal castles and forts of Cape Coast and Elmina.',
   'https://ubsgvfouroqkgqufzeat.supabase.co/storage/v1/object/public/kosa-public/gallery/beach/12-772A2007.webp',
   true,'Full day','PUBLISHED',4,now(),now()),

  (gen_random_uuid()::text,'market-tour','Market Tour','Cultural',
   'Experience the colour, sound and warmth of a vibrant local market and authentic Ghanaian daily life.',
   'https://ubsgvfouroqkgqufzeat.supabase.co/storage/v1/object/public/kosa-public/gallery/resort/11-772A4926.webp',
   false,'On request','PUBLISHED',5,now(),now()),

  (gen_random_uuid()::text,'guided-city-tour','Guided City Tour','Cultural',
   'Discover Elmina''s rich history and vibrant neighbourhoods with a guide who knows it intimately.',
   'https://ubsgvfouroqkgqufzeat.supabase.co/storage/v1/object/public/kosa-public/media/scenery/scenery-kosa2.webp',
   false,'On request','PUBLISHED',6,now(),now()),

  (gen_random_uuid()::text,'batik-making','Batik Making','Arts',
   'Create beautiful traditional fabric art and take home a piece dyed by your own hands.',
   'https://ubsgvfouroqkgqufzeat.supabase.co/storage/v1/object/public/kosa-public/gallery/resort/12-772A4928.webp',
   true,'On request','PUBLISHED',7,now(),now()),

  (gen_random_uuid()::text,'bead-making','Bead Making Class','Arts',
   'Craft your own unique jewellery using traditional Ghanaian glass-bead techniques.',
   'https://ubsgvfouroqkgqufzeat.supabase.co/storage/v1/object/public/kosa-public/media/environment/general-environment-img_3964.webp',
   false,'On request','PUBLISHED',8,now(),now()),

  (gen_random_uuid()::text,'painting-class','Painting Class','Arts',
   'Express your creativity with a guided painting session inspired by the colours of the coast.',
   'https://ubsgvfouroqkgqufzeat.supabase.co/storage/v1/object/public/kosa-public/gallery/wellness/0-772A2086.webp',
   true,'On request','PUBLISHED',9,now(),now()),

  (gen_random_uuid()::text,'horse-back-riding','Horse Back Riding','Adventure',
   'Explore scenic trails on horseback along the shoreline, at your own gentle pace.',
   'https://ubsgvfouroqkgqufzeat.supabase.co/storage/v1/object/public/kosa-public/gallery/beach/1-772A1842.webp',
   false,'On request','PUBLISHED',10,now(),now()),

  (gen_random_uuid()::text,'kakum-tour','Kakum Tour','Adventure',
   'A full-day experience through famous Kakum National Park and its rainforest canopy walkway.',
   'https://ubsgvfouroqkgqufzeat.supabase.co/storage/v1/object/public/kosa-public/media/scenery/scenery-kosa3.webp',
   true,'Full day','PUBLISHED',11,now(),now()),

  (gen_random_uuid()::text,'bird-watching','Bird Watching','Nature',
   'Discover Ghana''s diverse bird species in their natural coastal and wetland habitats.',
   'https://ubsgvfouroqkgqufzeat.supabase.co/storage/v1/object/public/kosa-public/media/environment/general-environment-img_3589.webp',
   false,'On request','PUBLISHED',12,now(),now()),

  (gen_random_uuid()::text,'naming-ceremony','Naming Ceremony','Celebrations',
   'Mark a new life the Ghanaian way. We host traditional outdooring and naming ceremonies on the beach, with drumming, blessings and the giving of a name, arranged with care from start to finish.',
   'https://ubsgvfouroqkgqufzeat.supabase.co/storage/v1/object/public/kosa-public/media/events/special-events-img_1126.webp',
   false,'On request','PUBLISHED',13,now(),now()),

  (gen_random_uuid()::text,'beach-wedding','Weddings & Celebrations','Celebrations',
   'The beach ceremony you always pictured, the sound of the waves, the warmth of the coast, and the people you love in one beautiful place. We handle every detail; you simply celebrate.',
   'https://ubsgvfouroqkgqufzeat.supabase.co/storage/v1/object/public/kosa-public/media/events/special-events-img_1141.webp',
   false,'Enquire for packages','PUBLISHED',14,now(),now());
