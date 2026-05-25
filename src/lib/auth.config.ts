import { prisma } from "@/lib/prisma";
import type { DefaultSession, NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      isVerified: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    isVerified: boolean;
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        if (!user.isActive) {
          throw new Error("Account has been deactivated");
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          isVerified: user.isVerified,
        };
      },
    }),

    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? "user";
        token.isVerified = (user as any).isVerified ?? false;
      }
      if (trigger === "update" && session) {
        token.role = session.role ?? token.role;
        token.isVerified = session.isVerified ?? token.isVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isVerified = token.isVerified;
      }
      return session;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");

      // Allow auth pages
      if (
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/signup") ||
        nextUrl.pathname.startsWith("/forgot-password") ||
        nextUrl.pathname.startsWith("/reset-password") ||
        nextUrl.pathname.startsWith("/verify")
      ) {
        return true;
      }

      // Protected routes
      if (isOnDashboard || isOnAdmin) {
        if (!isLoggedIn) {
          const loginUrl = new URL("/login", nextUrl);
          loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
          return Response.redirect(loginUrl);
        }

        // Admin-only routes
        if (isOnAdmin && auth?.user?.role !== "admin") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }

        return true;
      }

      return true;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  trustHost: true,
};