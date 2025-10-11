// src/types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      department?: string | null;
      language?: string | null;
      role?: string | null;
      companyId?: string | null;
      requires2FA?: boolean;
      twoFactorAuthenticated?: boolean;
      needsVerification?: boolean;
    } & DefaultSession["user"];
    csrfToken?: string;
  }

  interface User {
    department?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: string;
    requires2FA: boolean;
    twoFactorAuthenticated: boolean;
    csrfToken?: string;
  }
}
