import { prisma } from '@/lib/prisma';

// Stay-enhancement categories managed here. Spa categories (KoSa Health Spa,
// O2 Wellness) are managed separately as Treatments in /admin/wellness.
export const ENHANCEMENT_CATEGORIES = [
  'Experiences & Celebrations',
  'Activities & Excursions',
] as const;

export async function listPublicStayEnhancements() {
  return prisma.stayEnhancement.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
  });
}

export async function listAdminStayEnhancements() {
  return prisma.stayEnhancement.findMany({
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
  });
}

export function groupByCategory<T extends { category: string }>(items: T[]) {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const list = map.get(item.category) ?? [];
    list.push(item);
    map.set(item.category, list);
  }
  return map;
}
