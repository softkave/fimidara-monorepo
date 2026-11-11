import { auth } from "@/auth";
import { kUserConstants } from "@/lib/definitions/user.ts";
import { isJwtExpired } from "@/lib/utils/jwt.ts";
import { cookies } from "next/headers";

export async function useServerUserLoggedIn() {
  const jwtToken = (await cookies()).get(
    kUserConstants.httpOnlyJWTCookieName
  )?.value;

  // Cookie maxAge outlives the JWT; treat expired tokens as logged out so
  // `/login` and `/` do not bounce a stale session into `/workspaces`.
  if (jwtToken && !isJwtExpired(jwtToken)) {
    return true;
  }

  const session = await auth();
  if (session) {
    return true;
  }

  return false;
}
