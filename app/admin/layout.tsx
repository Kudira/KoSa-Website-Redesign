import type { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { AdminShell } from '@/components/admin/AdminShell';
import { ToastProvider } from '@/components/admin/Toast';

export const metadata: Metadata = {
  title: 'Admin · KoSa',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // /admin/login renders bare; middleware excludes it from the auth requirement.
  if (!session?.user) {
    return <div className="min-h-screen bg-bg-orange">{children}</div>;
  }

  return (
    <ToastProvider>
      <AdminShell
        user={
          session.user as {
            id: string;
            email: string;
            name?: string | null;
            role: string;
          }
        }
      >
        {children}
      </AdminShell>
    </ToastProvider>
  );
}
