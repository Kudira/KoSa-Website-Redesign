import { prisma } from '@/lib/prisma';

// Public-facing event/activity categories (mirrors ko-sa.com/activities + a
// Celebrations bucket for ceremonies such as the Naming Ceremony).
export const EVENT_CATEGORIES = [
  'Cultural',
  'Culinary',
  'Arts',
  'Adventure',
  'Nature',
  'Celebrations',
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export async function listPublicEvents() {
  return prisma.event.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
}

export async function listAdminEvents() {
  return prisma.event.findMany({
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
  });
}
