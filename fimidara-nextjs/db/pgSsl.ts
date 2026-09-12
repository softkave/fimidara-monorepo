import type { ConnectionOptions } from "tls";
import type { PoolConfig } from "pg";

export function getPgSslOption(url: string): false | ConnectionOptions {
  return url.includes("sslrejectunauthorized=false")
    ? { rejectUnauthorized: false }
    : false;
}

/**
 * Build a node-pg Pool config from a connection URL.
 *
 * Strips `sslmode` / `sslrejectunauthorized` from the URL and sets `ssl`
 * explicitly — otherwise node-pg can honor `sslmode=require` with default
 * `rejectUnauthorized: true` and ignore our query-string hint.
 */
export function getPgPoolConfig(url: string): PoolConfig {
  const parsed = new URL(url);
  parsed.searchParams.delete("sslmode");
  parsed.searchParams.delete("sslrejectunauthorized");
  return {
    connectionString: parsed.toString(),
    ssl: getPgSslOption(url),
  };
}

/** Credentials shape accepted by drizzle-kit `dbCredentials` for postgresql. */
export function getDrizzlePgCredentials(url: string) {
  const parsed = new URL(url);
  const database = parsed.pathname.replace(/^\//, "");
  if (!database) {
    throw new Error(`Postgres URL is missing a database name: ${url}`);
  }

  return {
    host: parsed.hostname,
    port: parsed.port ? parseInt(parsed.port, 10) : 5432,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database,
    ssl: getPgSslOption(url),
  };
}
