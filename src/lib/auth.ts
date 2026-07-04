import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { logger } from './logger';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          logger.warn('Login attempt: user not found', { email: credentials.email });
          return null;
        }

        const valid = await bcrypt.compare(credentials.password, user.hashedPassword);
        if (!valid) {
          logger.warn('Login attempt: invalid password', { userId: user.id });
          return null;
        }

        logger.info('Login success', { userId: user.id });
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // First sign-in: enrich token with RBAC data
        const userProfile = await prisma.userProfile.findUnique({
          where: { userId: user.id },
          include: {
            profile: {
              include: {
                permissions: { include: { permission: true } },
              },
            },
          },
        });
        token.profileName = userProfile?.profile.name ?? 'student';
        token.permissions =
          userProfile?.profile.permissions.map((p) => p.permission.action) ?? [];
        logger.info('JWT enriched with RBAC', {
          userId: user.id,
          profileName: token.profileName,
        });
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.profileName = token.profileName as string;
        session.user.permissions = token.permissions as string[];
      }
      return session;
    },
  },
};
