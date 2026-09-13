import NextAuth from "next-auth";
import authConfig from "./auth.config";

// Edge-safe Auth.js instance (no Drizzle/pg). See auth.ts for the Node adapter.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
