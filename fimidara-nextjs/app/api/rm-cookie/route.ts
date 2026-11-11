import { kUserConstants } from "@/lib/definitions/user.ts";
import { wrapRoute } from "@/lib/server/wrapRoute.ts";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export const POST = wrapRoute(async (request: NextRequest) => {
  // Match set-cookie options so the browser actually clears the cookie.
  (await cookies()).set(kUserConstants.httpOnlyJWTCookieName, "", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
});
