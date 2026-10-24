import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _browser: SupabaseClient | null = null;
let _admin: SupabaseClient | null = null;

/** Browser-safe client (anon key). Safe to import in client components. */
export function getSupabaseBrowser(): SupabaseClient | null {
  if (_browser) return _browser;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  _browser = createClient(url, key, { auth: { persistSession: true } });
  return _browser;
}

/** Server-only client (service-role). NEVER import in client components. */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  _admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _admin;
}

/** Public URL for an object in the configured storage bucket. */
export function publicAssetUrl(path: string, bucket?: string): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const b = bucket || process.env.SUPABASE_STORAGE_BUCKET || 'kosa-public';
  if (!url) return null;
  const clean = path.replace(/^\/+/, '');
  return `${url}/storage/v1/object/public/${b}/${clean}`;
}

// Cache buckets we've already ensured exist saves a roundtrip per upload.
const ensuredBuckets = new Set<string>();

/**
 * Idempotent bucket bootstrap. Creates the bucket as public if it doesn't yet
 * exist. Subsequent calls are a no-op thanks to the in-process cache.
 */
export async function ensureBucket(bucket: string): Promise<{ ok: true } | { error: string }> {
  if (ensuredBuckets.has(bucket)) return { ok: true };
  const client = getSupabaseAdmin();
  if (!client) return { error: 'Supabase admin not configured' };
  const { data: existing, error: getErr } = await client.storage.getBucket(bucket);
  if (existing) {
    ensuredBuckets.add(bucket);
    return { ok: true };
  }
  // getBucket returns a non-404 error only when something else is wrong.
  if (getErr && !/not.found|does.not.exist/i.test(getErr.message)) {
    // fall through and try creating anyway
  }
  const { error: createErr } = await client.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 50 * 1024 * 1024,
  });
  if (createErr && !/already.exists/i.test(createErr.message)) {
    return { error: createErr.message };
  }
  ensuredBuckets.add(bucket);
  return { ok: true };
}

/**
 * Server-side upload helper. Returns the public URL on success. Auto-creates
 * the bucket as public if missing.
 */
export async function uploadAsset(
  path: string,
  data: Blob | ArrayBuffer | Buffer,
  contentType: string,
  bucket?: string,
): Promise<{ url: string } | { error: string }> {
  const client = getSupabaseAdmin();
  if (!client) return { error: 'Supabase admin not configured' };
  const b = bucket || process.env.SUPABASE_STORAGE_BUCKET || 'kosa-public';

  const ensured = await ensureBucket(b);
  if ('error' in ensured) return { error: ensured.error };

  const { error } = await client.storage.from(b).upload(path, data, {
    contentType,
    upsert: true,
  });
  if (error) return { error: error.message };
  const url = publicAssetUrl(path, b);
  return url ? { url } : { error: 'Could not resolve public URL' };
}
