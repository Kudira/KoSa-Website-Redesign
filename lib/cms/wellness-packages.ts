import { prisma } from '@/lib/prisma';

export async function listPublicWellnessPackages() {
  return prisma.wellnessPackage.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
}

export async function getPublicWellnessPackage(slug: string) {
  return prisma.wellnessPackage.findUnique({ where: { slug } });
}

export async function listAdminWellnessPackages() {
  return prisma.wellnessPackage.findMany({ orderBy: [{ sortOrder: 'asc' }] });
}
