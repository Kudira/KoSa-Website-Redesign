-- Seed KO-SA dining: Kosa Breeze venue + filterable breakfast menu
-- (sourced from ko-sa.com/dining). Idempotent: clears dining tables first.
DELETE FROM "MenuItem";
DELETE FROM "MenuSection";
DELETE FROM "DiningVenue";

INSERT INTO "DiningVenue" ("id","slug","name","tagline","description","hours","image","gallery","status","sortOrder","createdAt","updatedAt")
VALUES (
  'venue_kosa_breeze','kosa-breeze','Kosa Breeze',
  'Authentic flavours from our beachfront kitchen',
  'Every dish is prepared fresh from scratch when you order, so good things take a little time. Breakfast 7:00 to 11:00 AM, lunch 12:00 to 4:00 PM, and dinner 6:00 to 10:00 PM, every day.',
  'Breakfast 7-11 AM · Lunch 12-4 PM · Dinner 6-10 PM',
  'https://ubsgvfouroqkgqufzeat.supabase.co/storage/v1/object/public/kosa-public/gallery/dining/0-772A1897.webp',
  '{}','PUBLISHED',0,now(),now()
);

INSERT INTO "MenuSection" ("id","venueId","name","description","sortOrder","createdAt","updatedAt") VALUES
  ('sec_signature','venue_kosa_breeze','Signature Breakfasts','Our most-loved ways to start the day.',1,now(),now()),
  ('sec_eggs','venue_kosa_breeze','Eggs & Omelettes','Fresh eggs, any style, folded with what the garden gives us.',2,now(),now()),
  ('sec_pancakes','venue_kosa_breeze','Pancakes & Cereals','Sweet, warm and unhurried.',3,now(),now()),
  ('sec_sandwiches','venue_kosa_breeze','Sandwiches & Toast','Light, fresh and made to order.',4,now(),now()),
  ('sec_extras','venue_kosa_breeze','Extras','Add a little something.',5,now(),now());

INSERT INTO "MenuItem" ("id","sectionId","name","description","price","currency","dietary","isFeatured","sortOrder","createdAt","updatedAt") VALUES
  (gen_random_uuid()::text,'sec_signature','Kosa Breakfast','Two eggs any style, wheat toast with butter and house-made jam, served with fresh coffee or tea.',NULL,'GHS','{}',true,1,now(),now()),
  (gen_random_uuid()::text,'sec_signature','Kosa Breakfast Deluxe','Two eggs, wheat toast, fresh coffee or tea, with chicken sausage, tuna or veggie sausage.',NULL,'GHS','{}',true,2,now(),now()),

  (gen_random_uuid()::text,'sec_eggs','Cheese Omelette','Classic omelette with melted cheese.',NULL,'GHS','{"VG"}',true,1,now(),now()),
  (gen_random_uuid()::text,'sec_eggs','Vegetable Omelette','Fresh garden vegetables folded into fluffy eggs.',NULL,'GHS','{"VG"}',false,2,now(),now()),
  (gen_random_uuid()::text,'sec_eggs','Tuna Omelette','Fluffy omelette filled with tuna.',NULL,'GHS','{}',false,3,now(),now()),
  (gen_random_uuid()::text,'sec_eggs','Omelette with Vegetable Sausage','Omelette served with veggie sausage.',NULL,'GHS','{"VG"}',false,4,now(),now()),

  (gen_random_uuid()::text,'sec_pancakes','Pancakes with Fresh Seasonal Fruits','Fluffy pancakes topped with fresh seasonal fruit, served with honey or chocolate.',NULL,'GHS','{"VG"}',true,1,now(),now()),
  (gen_random_uuid()::text,'sec_pancakes','Pancakes','Traditional pancakes served with honey or chocolate.',NULL,'GHS','{"VG"}',false,2,now(),now()),
  (gen_random_uuid()::text,'sec_pancakes','Granola','Rolled oats, nuts and dried fruit topped with fresh seasonal fruit and chilled milk.',NULL,'GHS','{"VG"}',false,3,now(),now()),
  (gen_random_uuid()::text,'sec_pancakes','Warm Oatmeal','Served warm with fresh milk.',NULL,'GHS','{"VG"}',false,4,now(),now()),
  (gen_random_uuid()::text,'sec_pancakes','Crispy Cornflakes','Served with fresh milk.',NULL,'GHS','{"VG"}',false,5,now(),now()),

  (gen_random_uuid()::text,'sec_sandwiches','Tomato, Mozzarella & Basil Sandwich','Fresh tomato, mozzarella and basil.',NULL,'GHS','{"VG"}',false,1,now(),now()),
  (gen_random_uuid()::text,'sec_sandwiches','Chicken Sandwich','Fresh chicken sandwich.',NULL,'GHS','{}',false,2,now(),now()),
  (gen_random_uuid()::text,'sec_sandwiches','Tuna Sandwich','Fresh tuna sandwich.',NULL,'GHS','{}',false,3,now(),now()),
  (gen_random_uuid()::text,'sec_sandwiches','Fresh Egg Sandwich','Simple, fresh egg sandwich.',NULL,'GHS','{"VG"}',false,4,now(),now()),
  (gen_random_uuid()::text,'sec_sandwiches','Toasted Wheat Bread','With butter and house-made jam or honey.',NULL,'GHS','{"VG"}',false,5,now(),now()),

  (gen_random_uuid()::text,'sec_extras','Add Cheese','A little extra melted cheese.',20,'GHS','{"VG"}',false,1,now(),now()),
  (gen_random_uuid()::text,'sec_extras','Chicken Sausage',NULL,NULL,'GHS','{}',false,2,now(),now()),
  (gen_random_uuid()::text,'sec_extras','Veggie Sausage',NULL,NULL,'GHS','{"VG"}',false,3,now(),now()),
  (gen_random_uuid()::text,'sec_extras','Tuna',NULL,NULL,'GHS','{}',false,4,now(),now());
