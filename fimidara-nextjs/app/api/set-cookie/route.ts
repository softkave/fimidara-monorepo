import { systemConstants } from "@/lib/definitions/system.ts";
import {
  kUserConstants,
  setCookieRouteZodSchema,
} from "@/lib/definitions/user.ts";
import { wrapRoute } from "@/lib/server/wrapRoute.ts";
import assert from "assert";
import { FimidaraEndpoints } from "fimidara-private-js-sdk";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const POST = wrapRoute(async (request: NextRequest) => {
  const params = setCookieRouteZodSchema.parse(await request.json());

  const endpoint = new FimidaraEndpoints({
    serverURL: systemConstants.serverAddr,
  });
  const res = await endpoint.users.getUserData({
    authToken: params.jwtToken,
  });

  assert.ok(res.user.resourceId === params.userId, "Invalid credentials");

  // Prefer the JWT's own expiry so a stale cookie cannot outlive the token and
  // keep bouncing the user between `/login` and `/workspaces`.
  const maxAgeSeconds = res.jwtTokenExpiresAt
    ? Math.max(
        0,
        Math.floor((res.jwtTokenExpiresAt - Date.now()) / 1000)
      )
    : 60 * 60 * 24; // 1 day fallback

  (await cookies()).set(kUserConstants.httpOnlyJWTCookieName, params.jwtToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: maxAgeSeconds,
  });
});
