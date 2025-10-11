// lib/auth.ts (updated version with 2FA support)
import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { logSecurityEvent, sanitizeIp } from "./security";
import { User, UserRole } from "@prisma/client";
import { randomBytes } from "crypto";
import { getTranslations } from "next-intl/server";

interface ExtendedUser extends User {
  role: UserRole;
  requires2FA: boolean;
  twoFactorAuthenticated: boolean;
  companyId: string;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes in seconds
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const t = await getTranslations("auth");

        const user = await db.user.findFirst({
          where: {
            email: credentials.email,
          },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            twoFactorEnabled: true,
            twoFactorVerified: true,
            companyId: true,
            isActive: true,
          },
        });

        if (!user || !user.password) {
          // Log failed login attempt
          const ipAddress = sanitizeIp(
            (req?.headers?.["x-forwarded-for"] as string) || null
          );
          await logSecurityEvent(
            undefined,
            undefined,
            "login_failed",
            ipAddress,
            req?.headers?.["user-agent"] || "",
            t("error.userNotFoundOrMissingPassword")
          );
          return null;
        }

        // Check if user is active
        if (!user.isActive) {
          // Log failed login attempt
          const ipAddress = sanitizeIp(
            (req?.headers?.["x-forwarded-for"] as string) || null
          );
          await logSecurityEvent(
            user.id,
            user.companyId || undefined,
            "login_failed",
            ipAddress,
            req?.headers?.["user-agent"] || "",
            t("error.accountDeactivated")
          );
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          // Log failed login attempt
          const ipAddress = sanitizeIp(
            (req?.headers?.["x-forwarded-for"] as string) || null
          );
          await logSecurityEvent(
            user.id,
            user.companyId || undefined,
            "login_failed",
            ipAddress,
            req?.headers?.["user-agent"] || "",
            t("error.wrongPassword")
          );
          return null;
        }

        // If 2FA is enabled, don't fully authorize yet
        if (user.twoFactorEnabled) {
          // Return a special value to indicate 2FA is required
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            requires2FA: true,
            twoFactorAuthenticated: false,
            companyId: user.companyId,
          };
        }

        // For users without 2FA, log successful login
        const ipAddress = sanitizeIp(
          (req?.headers?.["x-forwarded-for"] as string) || null
        );
        await logSecurityEvent(
          user.id,
          user.companyId || undefined,
          "login_success",
          ipAddress,
          req?.headers?.["user-agent"] || "",
          "Login without 2FA"
        );

        // Return user without 2FA flag
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          requires2FA: false,
          twoFactorAuthenticated: false,
          companyId: user.companyId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session?.user) {
        // Update the token when the session is manually updated
        return { ...token, ...session.user };
      }

      if (user) {
        token.id = user.id;
        token.email = user.email as string;
        token.name = user.name as string;
        token.role = (user as ExtendedUser).role;
        token.requires2FA = (user as ExtendedUser).requires2FA;
        token.twoFactorAuthenticated = (
          user as ExtendedUser
        ).twoFactorAuthenticated;
        token.companyId = (user as ExtendedUser).companyId;
        token.csrfToken = randomBytes(32).toString("hex");
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        session.user.requires2FA = token.requires2FA as boolean;
        session.user.twoFactorAuthenticated =
          token.twoFactorAuthenticated as boolean;
        session.user.companyId = token.companyId as string;
        session.csrfToken = token.csrfToken as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle logout redirect
      if (url.includes("signout") || url.includes("logout")) {
        return `${baseUrl}/login`;
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      // Additional event handling can be added here
    },
  },
};

export async function getAuthSession() {
  return getServerSession(authOptions);
}
