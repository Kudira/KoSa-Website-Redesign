import { prisma } from '@/lib/prisma';

export const DAY_ORDER = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY',
] as const;

export type DayOfWeek = (typeof DAY_ORDER)[number];

export async function listPublicDailyActivities() {
  return prisma.dailyActivity.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
}

export async function listAdminDailyActivities() {
  return prisma.dailyActivity.findMany({
    orderBy: [{ day: 'asc' }, { sortOrder: 'asc' }],
  });
}

export function groupByDay<T extends { day: string }>(activities: T[]) {
  const map = new Map<string, T[]>();
  for (const day of DAY_ORDER) map.set(day, []);
  for (const a of activities) {
    const list = map.get(a.day);
    if (list) list.push(a);
  }
  return map;
}
