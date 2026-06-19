import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@cct/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Google OAuth: upsert user + workspace
      if (account?.provider === 'google' && user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existing) {
          const newUser = await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              avatarUrl: user.image,
              emailVerified: new Date(),
            },
          });

          // Create default workspace
          const slug = `${(user.name ?? 'workspace').toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).slice(2, 6)}`;
          const workspace = await prisma.workspace.create({
            data: {
              name: `${user.name ?? user.email}'s Workspace`,
              slug,
              ownerId: newUser.id,
            },
          });

          // Add as workspace member
          await prisma.workspaceMember.create({
            data: { workspaceId: workspace.id, userId: newUser.id, role: 'ADMIN', joinedAt: new Date() },
          });

          // Create default notification prefs
          await prisma.notificationPreference.create({
            data: { userId: newUser.id, workspaceId: workspace.id },
          });
        } else if (!existing.avatarUrl && user.image) {
          await prisma.user.update({
            where: { id: existing.id },
            data: { avatarUrl: user.image },
          });
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;

        // Skip DB query in Edge Runtime (Middleware) to prevent Prisma crash
        if (process.env.NEXT_RUNTIME === 'edge') {
          return session;
        }

        // Attach active workspace to session
        const workspace = await prisma.workspace.findFirst({
          where: { ownerId: token.id as string },
          select: {
            id: true,
            name: true,
            slug: true,
            planName: true,
            planStatus: true,
            maxUrls: true,
            maxAiSummariesMonth: true,
            checkFreqOptions: true,
            featureFlags: true,
          },
        });

        (session as { workspace?: typeof workspace }).workspace = workspace;
      }
      return session;
    },
  },
});

export const getCurrentUser = async () => {
  const session = await auth();
  return session?.user;
};
