import { createClient } from "@libsql/client";
import assert from "assert";
import "dotenv/config";
import { sql } from "drizzle-orm";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import {
  accounts,
  authenticators,
  db as pgDb,
  sessions,
  users,
  verificationTokens,
} from "../db/schema";
import {
  sqliteAccounts,
  sqliteAuthenticators,
  sqliteSessions,
  sqliteUsers,
  sqliteVerificationTokens,
} from "./auth-sqlite-schema";

type Env = {
  TURSO_DATABASE_URL: string;
  TURSO_AUTH_TOKEN: string;
  DATABASE_URL: string;
};

function getEnv(): Env {
  const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
  const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;
  const DATABASE_URL = process.env.DATABASE_URL;

  assert.ok(TURSO_DATABASE_URL, "TURSO_DATABASE_URL is required");
  assert.ok(TURSO_AUTH_TOKEN, "TURSO_AUTH_TOKEN is required");
  assert.ok(DATABASE_URL, "DATABASE_URL is required");

  return { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, DATABASE_URL };
}

function msToDate(value: number | Date | null | undefined): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return value;
  return new Date(value);
}

async function main() {
  const env = getEnv();

  const sqliteClient = createClient({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  });
  const sqliteDb = drizzleLibsql(sqliteClient);

  const srcUsers = await sqliteDb.select().from(sqliteUsers);
  const srcAccounts = await sqliteDb.select().from(sqliteAccounts);
  const srcSessions = await sqliteDb.select().from(sqliteSessions);
  const srcVerificationTokens = await sqliteDb
    .select()
    .from(sqliteVerificationTokens);
  const srcAuthenticators = await sqliteDb.select().from(sqliteAuthenticators);

  await pgDb.transaction(async (tx) => {
    // Ensure all tables exist before attempting inserts; this yields a clearer
    // failure mode if Postgres migrations haven't been applied.
    await tx.execute(sql`select 1`);

    if (srcUsers.length) {
      await tx
        .insert(users)
        .values(
          srcUsers.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            emailVerified: msToDate(u.emailVerified),
            image: u.image,
          }))
        )
        .onConflictDoUpdate({
          target: users.id,
          set: {
            name: sql`excluded.name`,
            email: sql`excluded.email`,
            emailVerified: sql`excluded."emailVerified"`,
            image: sql`excluded.image`,
          },
        });
    }

    if (srcAccounts.length) {
      await tx
        .insert(accounts)
        .values(srcAccounts)
        .onConflictDoUpdate({
          target: [accounts.provider, accounts.providerAccountId],
          set: {
            userId: sql`excluded."userId"`,
            type: sql`excluded.type`,
            refresh_token: sql`excluded.refresh_token`,
            access_token: sql`excluded.access_token`,
            expires_at: sql`excluded.expires_at`,
            token_type: sql`excluded.token_type`,
            scope: sql`excluded.scope`,
            id_token: sql`excluded.id_token`,
            session_state: sql`excluded.session_state`,
          },
        });
    }

    if (srcSessions.length) {
      await tx
        .insert(sessions)
        .values(
          srcSessions.map((s) => ({
            sessionToken: s.sessionToken,
            userId: s.userId,
            expires: msToDate(s.expires) ?? new Date(0),
          }))
        )
        .onConflictDoUpdate({
          target: sessions.sessionToken,
          set: {
            userId: sql`excluded."userId"`,
            expires: sql`excluded.expires`,
          },
        });
    }

    if (srcVerificationTokens.length) {
      await tx
        .insert(verificationTokens)
        .values(
          srcVerificationTokens.map((t) => ({
            identifier: t.identifier,
            token: t.token,
            expires: msToDate(t.expires) ?? new Date(0),
          }))
        )
        .onConflictDoUpdate({
          target: [verificationTokens.identifier, verificationTokens.token],
          set: { expires: sql`excluded.expires` },
        });
    }

    if (srcAuthenticators.length) {
      await tx
        .insert(authenticators)
        .values(
          srcAuthenticators.map((a) => ({
            credentialID: a.credentialID,
            userId: a.userId,
            providerAccountId: a.providerAccountId,
            credentialPublicKey: a.credentialPublicKey,
            counter: a.counter,
            credentialDeviceType: a.credentialDeviceType,
            credentialBackedUp: a.credentialBackedUp,
            transports: a.transports,
          }))
        )
        .onConflictDoUpdate({
          target: [authenticators.userId, authenticators.credentialID],
          set: {
            providerAccountId: sql`excluded."providerAccountId"`,
            credentialPublicKey: sql`excluded."credentialPublicKey"`,
            counter: sql`excluded.counter`,
            credentialDeviceType: sql`excluded."credentialDeviceType"`,
            credentialBackedUp: sql`excluded."credentialBackedUp"`,
            transports: sql`excluded.transports`,
          },
        });
    }
  });

  // Close the libsql client (pg pool is managed by node-postgres globally in db/schema.ts).
  sqliteClient.close();
}

main().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
