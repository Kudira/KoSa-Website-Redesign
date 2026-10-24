import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin/auth';
import { PageHeader } from '@/components/admin/PageHeader';
import { UsersManager } from './UsersManager';

export const metadata: Metadata = { title: 'Admin users · Admin', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const session = await getAdminSession();
  if (!session || session.role !== 'OWNER') redirect('/admin');

  const users = await prisma.adminUser.findMany({
    orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      lastSeen: true,
      createdAt: true,
    },
  });

  return (
    <section className="px-4 md:px-10 py-10">
      <PageHeader
        eyebrow="Configuration"
        title="Admin users"
        description="Add staff, change roles, deactivate accounts. Owners only."
      />
      <UsersManager
        currentUserId={session.id}
        initial={users.map((u) => ({
          ...u,
          lastSeen: u.lastSeen?.toISOString() ?? null,
          createdAt: u.createdAt.toISOString(),
        }))}
      />
    </section>
  );
}
