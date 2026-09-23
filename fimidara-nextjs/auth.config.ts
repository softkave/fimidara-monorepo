import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

/**
 * Edge-compatible Auth.js config (no DB adapter / pg).
 * Used by middleware; full config with adapter lives in auth.ts.
 */
export default {
  providers: [
    Google({
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    error: "/error",
  },
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig;
