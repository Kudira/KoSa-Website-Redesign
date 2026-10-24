import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

declare module 'next-auth' {
  interface Session {
    user: { id: string; email: string; name?: string | null; role: 'OWNER' | 'EDITOR' };
  }
}
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'OWNER' | 'EDITOR';
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 60 * 60 * 8 }, // 8h
  pages: { signIn: '/admin/login' },
  providers: [
    CredentialsProvider({
      name: 'KoSa Admin',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.toLowerCase().trim();

        // Bootstrap: if no users exist and ENV provides first-admin creds, accept those.
        const userCount = await prisma.adminUser.count().catch(() => 0);
        if (userCount === 0) {
          const bootEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.toLowerCase();
          const bootPass = process.env.ADMIN_BOOTSTRAP_PASSWORD;
          if (bootEmail && bootPass && email === bootEmail && credentials.password === bootPass) {
            const created = await prisma.adminUser.create({
              data: {
                email: bootEmail,
                password: await bcrypt.hash(bootPass, 12),
                name: 'KoSa Owner',
                role: 'OWNER',
              },
            });
            return { id: created.id, email: created.email, name: created.name, role: created.role };
          }
        }

        const user = await prisma.adminUser.findUnique({ where: { email } });
        if (!user) return null;
        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
