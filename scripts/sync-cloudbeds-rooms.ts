/* eslint-disable no-console */
// Daily sync pulls Cloudbeds room types and refreshes the local cache + ES knowledge.
// Run: npx tsx scripts/sync-cloudbeds-rooms.ts
import { cloudbedsFetch } from '../lib/cloudbeds/auth';

async function main() {
  const propertyID = process.env.CLOUDBEDS_PROPERTY_ID;
  if (!propertyID) {
    console.error('CLOUDBEDS_PROPERTY_ID not set.');
    process.exit(1);
  }

  try {
    const data = await cloudbedsFetch('/getRoomTypes', { params: { propertyID } });
    console.log('Pulled rooms:', JSON.stringify(data, null, 2).slice(0, 800));
    console.log('TODO: feed into seed-knowledge-base.ts');
  } catch (e) {
    console.error('Cloudbeds fetch failed:', (e as Error).message);
    process.exit(1);
  }
}

main();
