/** Decode a JWT payload without verifying the signature. */
export function decodeJwtPayload(
  token: string
): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2 || !parts[1]) {
      return null;
    }

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json =
      typeof atob === "function"
        ? atob(padded)
        : Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Returns true when the JWT is missing, malformed, or past `exp`. */
export function isJwtExpired(
  token: string | null | undefined,
  skewMs = 5_000
): boolean {
  if (!token) {
    return true;
  }

  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;
  if (typeof exp !== "number") {
    return true;
  }

  return exp * 1000 <= Date.now() + skewMs;
}
