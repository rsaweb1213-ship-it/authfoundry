import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import type { Adapter } from "next-auth/adapters";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  adapter: {
    async createUser(user) {
      return prisma.user.create({ data: user as any });
    },
    async getUser(id) {
      return prisma.user.findUnique({ where: { id } });
    },
    async getUserByEmail(email) {
      return prisma.user.findUnique({ where: { email } });
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: { provider, providerAccountId },
        },
        include: { user: true },
      });
      return account?.user ?? null;
    },
    async updateUser(user) {
      return prisma.user.update({
        where: { id: user.id },
        data: user as any,
      });
    },
    async deleteUser(userId) {
      await prisma.user.delete({ where: { id: userId } });
      return null;
    },
    async linkAccount(account) {
      await prisma.account.create({ data: account as any });
      return null;
    },
    async createSession(session) {
      return prisma.session.create({ data: session as any });
    },
    async getSessionAndUser(sessionToken) {
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (!session) return null;
      const { user, ...sessionData } = session;
      return { session: sessionData as any, user };
    },
    async updateSession(session) {
      return prisma.session.update({
        where: { sessionToken: session.sessionToken! },
        data: session as any,
      });
    },
    async deleteSession(sessionToken) {
      await prisma.session.delete({ where: { sessionToken } });
      return null;
    },
    async createVerificationToken(verificationToken) {
      return prisma.verificationToken.create({
        data: verificationToken as any,
      });
    },
    async useVerificationToken({ identifier, token }) {
      try {
        return await prisma.verificationToken.delete({
          where: {
            identifier_token: { identifier, token },
          },
        });
      } catch {
        return null;
      }
    },
  } as Adapter,
});