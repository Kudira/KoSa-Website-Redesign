import { slugify } from '@/lib/utils';

/**
 * Produce a unique slug. Given an existence-check function and a desired base
 * value, appends `-2`, `-3`, … until a free slug is found. `currentId` lets you
 * keep the existing slug on update without bumping numbers.
 */
export async function ensureUniqueSlug(
  desired: string | undefined,
  fallback: string,
  exists: (slug: string) => Promise<{ id: string } | null>,
  currentId?: string,
): Promise<string> {
  const base = slugify(desired?.trim() || fallback || 'item') || 'item';
  let candidate = base;
  let n = 2;
  // Cap retries slugs collide rarely in practice.
  while (n < 50) {
    const hit = await exists(candidate);
    if (!hit || hit.id === currentId) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
  }
  return `${base}-${Date.now()}`;
}
