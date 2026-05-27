import assert from "assert";
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const dbURL = process.env.DATABASE_URL;
assert.ok(dbURL, "DATABASE_URL is required");

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbURL,
  },
});
