// Seed the full Kosa Breeze à la carte MAIN MENU into the Dining CMS, from
// files/KOSA BREEZE RESTAURANT MENU.pdf (June 2026). Adds all main-menu
// sections to the existing "kosa-breeze" venue and pushes the breakfast
// sections to the end so the page shows the full menu, not breakfast only.
//
// Idempotent: re-running deletes + recreates the main-menu sections by name.
// Run: node scripts/seed-dining-main-menu.mjs

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// (V) on the printed menu = vegan friendly; we tag with the site's existing
// dietary code "VG" (rendered as a small badge).
const V = ['VG'];

const SECTIONS = [
  {
    name: 'Starters',
    items: [
      { name: 'Bruschetta with Fresh Tomatoes', description: '4 pieces', price: 30 },
      { name: 'Spring Rolls', description: '4 pieces', price: 75 },
      { name: 'Kelewele', description: 'Fried plantain with peanuts', price: 50, dietary: V },
      { name: 'Fresh Tomato Soup with Toast', price: 55, dietary: V },
      { name: 'Vegetable Soup with Toast', price: 60, dietary: V },
      { name: 'Chicken Soup with Toast', price: 65 },
      { name: 'Chicken Kebab', description: '1 skewer', price: 50 },
      { name: 'Beef Kebab', description: '1 skewer', price: 55 },
      { name: 'Fish Kebab', description: '1 skewer', price: 55 },
      { name: 'Veggie Kebab', description: '1 skewer', price: 50, dietary: V },
    ],
  },
  {
    name: 'Salads',
    items: [
      { name: 'Mixed Salad', price: 95, dietary: V },
      { name: 'Chicken Salad', price: 105 },
      { name: 'Shrimp Salad', price: 130, featured: true },
    ],
  },
  {
    name: 'Sides',
    items: [
      { name: 'Jollof Rice', price: 50, dietary: V, featured: true },
      { name: 'Fried Rice', price: 50, dietary: V },
      { name: 'Plain Rice', price: 50, dietary: V },
      { name: 'Fried Chicken Wings', description: '6 pieces', price: 120 },
      { name: 'Fried Chicken', description: '2 pieces', price: 60 },
      { name: 'Mashed Potatoes', price: 80, dietary: V },
      { name: 'Sautéed Potatoes', price: 80, dietary: V },
      { name: 'Hand-cut Fries', price: 60, dietary: V },
      { name: 'Fried Plantain', price: 65, dietary: V },
      { name: 'Coastal Coleslaw', price: 50, dietary: V },
      { name: 'Yam Fries', price: 50, dietary: V },
    ],
  },
  {
    name: 'Main Dishes',
    description: 'Comes with a side of your choice',
    items: [
      { name: "Fisherman's Soup with Red Fish", price: 140 },
      { name: "Catch of the Day Fisherman's Soup", price: 150, featured: true },
      { name: 'Fried Chicken Wings', description: '6 pieces, with green or red chili', price: 140 },
      { name: 'Chicken Indian Curry', price: 150 },
      { name: 'Chicken with Mushroom Sauce', price: 150 },
      { name: 'Stuffed Chicken Fillet', price: 180 },
      { name: 'Sliced Tenderloin Beef with Vegetables', price: 160 },
      { name: 'Beef Stew', price: 160 },
      { name: 'Steak Dinner', description: '1 side', price: 160 },
      { name: 'Beef in Coconut Sauce', price: 160 },
    ],
  },
  {
    name: 'Pasta',
    items: [
      { name: 'Spaghetti with Tomato & Garlic Sauce', price: 75, dietary: V },
      { name: 'Vegetable Olive Oil Garlic Pasta', price: 85, dietary: V },
      { name: 'Spicy Delhi Beef Pasta', price: 100 },
      { name: 'Seafood Alfredo Pasta', price: 160, featured: true },
      { name: 'Grounded Meat Sauce Pasta', price: 110 },
    ],
  },
  {
    name: 'Burgers',
    description: 'Beef, chicken & fish burgers',
    items: [
      { name: 'Beef Burger', price: 110, featured: true },
      { name: 'Fish Burger', price: 120 },
      { name: 'Beef Burger with Egg', price: 130 },
      { name: 'Chicken Burger', price: 120 },
    ],
  },
  {
    name: 'Local Favourites',
    items: [
      { name: 'Jollof Rice with Grilled Chicken', price: 140, featured: true },
      { name: 'Fried Rice with Grilled Chicken', price: 140 },
      { name: 'Fried Chicken with Jollof or Fried Rice', description: '2 pieces', price: 140 },
      { name: 'Toasted Vegetables with Grilled Chicken', description: 'Seasonal vegetables', price: 140 },
      { name: 'Red Red with Chicken or Fish', price: 150 },
      { name: 'Mushroom Stroganoff with Plain Rice', price: 125 },
      { name: 'Yam with Palava Sauce', price: 80, dietary: V },
      { name: 'Chicken Groundnut Soup', price: 140 },
      { name: 'Red Fish Groundnut Soup', price: 140 },
      { name: 'Banku with Red Fish & Pepper Sauce', price: 140 },
      { name: 'Banku with Chicken & Pepper Sauce', price: 130 },
      { name: 'Banku with Okro Stew', description: 'Can be served with chicken, beef or fish', price: 130, featured: true },
      { name: 'Fufu with Chicken Light Soup', price: 140 },
      { name: 'Fufu with Red Fish Light Soup', price: 140 },
      { name: 'Fufu with Light Soup', price: 140, dietary: V },
      { name: 'Fufu with Beef Light Soup', price: 140 },
    ],
  },
  {
    name: 'Kebab Plate',
    description: 'Comes with a side of your choice',
    items: [
      { name: 'Chicken Kebab', description: '2 skewers', price: 140 },
      { name: 'Beef Kebab', description: '2 skewers', price: 130 },
      { name: 'Veggie Kebab', description: '2 skewers', price: 105, dietary: V },
      { name: 'Seafood Kebab', description: '2 skewers', price: 145, featured: true },
    ],
  },
  {
    name: 'Seafood & Grill',
    description: 'Comes with a side of your choice',
    items: [
      { name: 'Grilled Squid', price: 170 },
      { name: 'Grilled/Fried Red Fish', price: 160 },
      { name: 'Grilled Lobster/Prawns', price: 280 },
      { name: 'Steamed Grouper in Coconut & Lemongrass', price: 170 },
      { name: 'Grilled Prawns', price: 280 },
      { name: 'Grouper Fillet Mushroom Sauce', price: 170 },
      { name: 'Grouper Fillet Garlic Butter', price: 170 },
      { name: 'Seafood Platter', description: 'Serves up to 4 people. Prawns, lobster, calamari, fish fillet.', price: 750, featured: true },
    ],
  },
  {
    name: 'Sandwiches',
    items: [
      { name: 'Chicken Sandwich', price: 110 },
      { name: 'Tuna Sandwich', price: 110 },
      { name: 'Tomato, Mozzarella & Basil Sandwich', price: 115, dietary: V },
      { name: 'Club Sandwich', price: 120 },
    ],
  },
  {
    name: 'Children',
    items: [
      { name: 'Chicken Basket with Fries', price: 80 },
      { name: 'Fish Basket with Fries', price: 100 },
      { name: 'Spaghetti with Beef Sauce', price: 70 },
      { name: 'Spaghetti with Meatballs', price: 75 },
    ],
  },
  {
    name: 'Dessert',
    items: [
      { name: 'Ice Cream', price: 15 },
      { name: 'Ice Cream with Chocolate Sauce', price: 20 },
      { name: 'Banana Milkshake', price: 65 },
      { name: 'Seasonal Fruit Shake', price: 65 },
      { name: 'Crepe with Seasonal Fruits', price: 60 },
      { name: 'Crepe with Ice Cream', price: 60, featured: true },
    ],
  },
];

async function main() {
  const venue = await prisma.diningVenue.findUnique({
    where: { slug: 'kosa-breeze' },
    include: { sections: true },
  });
  if (!venue) throw new Error('Venue "kosa-breeze" not found');

  const mainNames = SECTIONS.map((s) => s.name);

  // Idempotent: drop any previously seeded main-menu sections (cascades items).
  const del = await prisma.menuSection.deleteMany({
    where: { venueId: venue.id, name: { in: mainNames } },
  });

  // Push the remaining (breakfast) sections to the end, after the main menu.
  const breakfast = venue.sections
    .filter((s) => !mainNames.includes(s.name))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  let order = SECTIONS.length;
  for (const s of breakfast) {
    await prisma.menuSection.update({ where: { id: s.id }, data: { sortOrder: order++ } });
  }

  // Create the main-menu sections first (sortOrder 0..n).
  let so = 0;
  let itemCount = 0;
  for (const sec of SECTIONS) {
    await prisma.menuSection.create({
      data: {
        venueId: venue.id,
        name: sec.name,
        description: sec.description ?? null,
        sortOrder: so++,
        items: {
          create: sec.items.map((it, i) => {
            itemCount++;
            return {
              name: it.name,
              description: it.description ?? null,
              price: it.price,
              currency: 'GHS',
              dietary: it.dietary ?? [],
              isFeatured: !!it.featured,
              sortOrder: i,
            };
          }),
        },
      },
    });
  }

  console.log(`Removed ${del.count} old main-menu section(s).`);
  console.log(`Pushed ${breakfast.length} breakfast section(s) to the end.`);
  console.log(`Created ${SECTIONS.length} main-menu sections, ${itemCount} items.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
