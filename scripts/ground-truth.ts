import './_env';
import { prisma } from '../lib/prisma';

async function main() {
  const rooms = await prisma.room.findMany({ orderBy: { sortOrder: 'asc' } });
  const media = await prisma.mediaAsset.count();
  const gallery = await prisma.galleryItem.count();
  console.log(`COUNTS rooms=${rooms.length} media=${media} gallery=${gallery}`);
  for (const r of rooms) {
    console.log(`ROOM ${r.sortOrder} | ${r.slug} | ${r.category} | ${r.currency}${r.price} | imgs=${r.gallery.length} | img=${r.image ?? 'NULL'}`);
  }
}
main().then(() => process.exit(0)).catch((e) => { console.error('ERR', e); process.exit(1); });
