import { DrizzleAdapter } from "@auth/drizzle-adapter";
import assert from "assert";
import { FimidaraEndpoints } from "fimidara-private-js-sdk";
import NextAuth, { Session } from "next-auth";
import { NextRequest } from "next/server";
import authConfig from "./auth.config";
import { db } from "./db/schema";
import { fimidxNextAuthLogger } from "./lib/common/logger/fimidx-auth-logger.ts";
import { systemConstants } from "./lib/definitions/system.ts";
import { IOAuthUser } from "./lib/definitions/user.ts";

const internalAuthSecret = process.env.INTER_SERVER_AUTH_SECRET;

if (!internalAuthSecret) {
  throw new Error("INTER_SERVER_AUTH_SECRET is not set");
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  logger: fimidxNextAuthLogger,
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  events: {
    createUser: async ({ user }) => {
      assert.ok(user.id, "User ID is not set");
      assert.ok(user.name, "User name is not set");
      assert.ok(user.email, "User email is not set");

      const endpoint = new FimidaraEndpoints({
        serverURL: systemConstants.serverAddr,
      });

      // I think it's safe to assume that the email is verified at the time of
      // creation for the 2 providers we use, Google and GitHub
      const emailVerifiedAt = Date.now();
      await endpoint.users.signupWithOAuth({
        oauthUserId: user.id,
        interServerAuthSecret: internalAuthSecret,
        name: user.name,
        email: user.email,
        emailVerifiedAt,
      });
    },
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        const emailVerified =
          "emailVerified" in user
            ? (user.emailVerified as Date | null | undefined)
            : undefined;
        token.emailVerified = emailVerified?.toISOString() ?? null;
      }
      return token;
    },
    session: async ({ session, token }) => {
      assert.ok(token.sub, "User ID is not set");

      const name = token.name ?? session.user?.name;
      const email = token.email ?? session.user?.email;
      assert.ok(name, "User name is not set");
      assert.ok(email, "User email is not set");

      const endpoint = new FimidaraEndpoints({
        serverURL: systemConstants.serverAddr,
      });

      const emailVerifiedAt = token.emailVerified
        ? new Date(String(token.emailVerified)).valueOf()
        : undefined;

      const res = await endpoint.users.loginWithOAuth({
        oauthUserId: token.sub,
        interServerAuthSecret: internalAuthSecret,
        email,
        name,
        emailVerifiedAt,
      });

      const userData: IOAuthUser = {
        id: token.sub,
        name,
        email,
        emailVerified: token.emailVerified
          ? new Date(String(token.emailVerified))
          : null,
        image: token.picture ?? session.user?.image ?? null,
        ...res,
      };

      return {
        ...session,
        user: userData,
      };
    },
  },
});

export interface NextAuthRequest extends NextRequest {
  auth: Session | null;
}
