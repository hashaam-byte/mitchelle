// lib/auth.ts - FIXED VERSION
import { NextAuthOptions, getServerSession as nextAuthGetServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import prisma from './prisma';
import { UserRole } from '@prisma/client';

export { UserRole };

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        isSuperAdmin: { label: 'Super Admin', type: 'checkbox' },
        superAdminKey: { label: 'Super Admin Key', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        // Super Admin Login
        if (credentials.isSuperAdmin === 'true') {
          if (
            credentials.email === process.env.SUPER_ADMIN_EMAIL &&
            credentials.superAdminKey === process.env.SUPER_ADMIN_SECRET_KEY &&
            credentials.password === process.env.SUPER_ADMIN_PASSWORD
          ) {
            let superAdmin = await prisma.user.findUnique({
              where: { email: process.env.SUPER_ADMIN_EMAIL },
            });

            if (!superAdmin) {
              superAdmin = await prisma.user.create({
                data: {
                  email: process.env.SUPER_ADMIN_EMAIL!,
                  fullName: 'Super Admin',
                  password: await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD!, 10),
                  role: UserRole.SUPER_ADMIN,
                },
              });
            }

            return {
              id: superAdmin.id,
              email: superAdmin.email,
              name: superAdmin.fullName,
              role: superAdmin.role,
            };
          }

          throw new Error('Invalid super admin credentials');
        }

        // Regular User Login
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('No user found with this email');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// FIXED Helper functions - Use getServerSession from next-auth directly
export async function getCurrentUser() {
  const session = await nextAuthGetServerSession(authOptions);
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
    throw new Error('Admin access required');
  }
  return user;
}

export async function requireSuperAdmin() {
  const user = await requireAuth();
  if (user.role !== UserRole.SUPER_ADMIN) {
    throw new Error('Super admin access required');
  }
  return user;
}

