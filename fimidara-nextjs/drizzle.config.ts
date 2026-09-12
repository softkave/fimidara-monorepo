import assert from "assert";
import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { getDrizzlePgCredentials } from "./db/pgSsl";

const pgDatabaseUrl = process.env.PG_DATABASE_URL;
assert.ok(pgDatabaseUrl, "PG_DATABASE_URL is required");

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: getDrizzlePgCredentials(pgDatabaseUrl),
});
