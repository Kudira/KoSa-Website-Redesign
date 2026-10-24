import './_env';
import { prisma } from '../lib/prisma';
import { getSupabaseAdmin, ensureBucket, uploadAsset, publicAssetUrl } from '../lib/supabase';

async function main() {
  // 1. DB
  const rooms = await prisma.room.count();
  const media = await prisma.mediaAsset.count();
  const admins = await prisma.adminUser.count();
  console.log(`DB OK rooms=${rooms} media=${media} admins=${admins}`);

  // 2. Supabase storage
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'kosa-public';
  const client = getSupabaseAdmin();
  if (!client) throw new Error('Supabase admin client not configured');
  const ensured = await ensureBucket(bucket);
  if ('error' in ensured) throw new Error('ensureBucket: ' + ensured.error);
  console.log(`Bucket "${bucket}" ready`);

  // 3. Round-trip a tiny file
  const path = `_diagnostics/connectivity-${Date.now()}.txt`;
  const up = await uploadAsset(path, Buffer.from('ok'), 'text/plain', bucket);
  if ('error' in up) throw new Error('upload: ' + up.error);
  console.log(`Upload OK → ${up.url}`);
  await client.storage.from(bucket).remove([path]);
  console.log('Cleanup OK');
  console.log('publicAssetUrl sample:', publicAssetUrl('rooms/test.jpg', bucket));
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('FAIL:', e.message || e);
    process.exit(1);
  });
