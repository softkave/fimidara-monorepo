/**
 * Copy Auth.js data from a SQLite / Turso (libSQL) source into a Postgres target.
 *
 * Usage:
 *   npx tsx scripts/db/migrate-sqlite-to-postgres.ts \
 *     --source "$TURSO_DATABASE_URL" \
 *     --source-token "$TURSO_AUTH_TOKEN" \
 *     --target "$PG_DATABASE_URL" \
 *     [--truncate]
 *
 * Local file sources are also supported:
 *   --source file:/abs/path/to/db.sqlite
 *   --source /abs/path/to/db.sqlite
 *
 * Run Postgres schema migrations first. This script is data-only.
 */

import { createClient, type Client } from "@libsql/client";
import path from "node:path";
import pg from "pg";
import { getPgPoolConfig } from "../../db/pgSsl";

const { Pool: PgPool } = pg;

type ColumnKind = "text" | "integer" | "boolean" | "timestamp";

type ColumnSpec = {
  name: string;
  kind: ColumnKind;
};

type TableSpec = {
  name: string;
  columns: ColumnSpec[];
};

const AUTH_TABLES: TableSpec[] = [
  {
    name: "user",
    columns: [
      { name: "id", kind: "text" },
      { name: "name", kind: "text" },
      { name: "email", kind: "text" },
      { name: "emailVerified", kind: "timestamp" },
      { name: "image", kind: "text" },
    ],
  },
  {
    name: "account",
    columns: [
      { name: "userId", kind: "text" },
      { name: "type", kind: "text" },
      { name: "provider", kind: "text" },
      { name: "providerAccountId", kind: "text" },
      { name: "refresh_token", kind: "text" },
      { name: "access_token", kind: "text" },
      { name: "expires_at", kind: "integer" },
      { name: "token_type", kind: "text" },
      { name: "scope", kind: "text" },
      { name: "id_token", kind: "text" },
      { name: "session_state", kind: "text" },
    ],
  },
  {
    name: "session",
    columns: [
      { name: "sessionToken", kind: "text" },
      { name: "userId", kind: "text" },
      { name: "expires", kind: "timestamp" },
    ],
  },
  {
    name: "verificationToken",
    columns: [
      { name: "identifier", kind: "text" },
      { name: "token", kind: "text" },
      { name: "expires", kind: "timestamp" },
    ],
  },
  {
    name: "authenticator",
    columns: [
      { name: "credentialID", kind: "text" },
      { name: "userId", kind: "text" },
      { name: "providerAccountId", kind: "text" },
      { name: "credentialPublicKey", kind: "text" },
      { name: "counter", kind: "integer" },
      { name: "credentialDeviceType", kind: "text" },
      { name: "credentialBackedUp", kind: "boolean" },
      { name: "transports", kind: "text" },
    ],
  },
];

function parseArgs(argv: string[]) {
  const args: {
    source?: string;
    sourceToken?: string;
    target?: string;
    truncate: boolean;
  } = { truncate: false };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];
    switch (arg) {
      case "--source":
        args.source = next;
        i++;
        break;
      case "--source-token":
        args.sourceToken = next;
        i++;
        break;
      case "--target":
        args.target = next;
        i++;
        break;
      case "--truncate":
        args.truncate = true;
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!args.source || !args.target) {
    throw new Error(
      "Required: --source <sqlite-url-or-path> --target <postgres-url>"
    );
  }

  return args as {
    source: string;
    sourceToken?: string;
    target: string;
    truncate: boolean;
  };
}

function normalizeSqliteSource(source: string): string {
  if (source.startsWith("libsql://") || source.startsWith("file:")) {
    return source;
  }
  const absolute = path.isAbsolute(source)
    ? source
    : path.resolve(process.cwd(), source);
  return `file:${absolute}`;
}

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

function castValue(kind: ColumnKind, value: unknown): unknown {
  if (value === null || value === undefined) {
    return null;
  }

  switch (kind) {
    case "timestamp": {
      if (value instanceof Date) return value;
      if (typeof value === "number") {
        return new Date(value);
      }
      if (typeof value === "string" && /^\d+$/.test(value)) {
        return new Date(Number(value));
      }
      return new Date(String(value));
    }
    case "boolean": {
      if (typeof value === "boolean") return value;
      if (typeof value === "number") return value !== 0;
      if (typeof value === "string") {
        return value === "1" || value.toLowerCase() === "true";
      }
      return Boolean(value);
    }
    case "integer":
      return typeof value === "string" ? Number(value) : value;
    case "text":
    default:
      return value;
  }
}

async function tableExists(source: Client, tableName: string): Promise<boolean> {
  const result = await source.execute({
    sql: `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
    args: [tableName],
  });
  return result.rows.length > 0;
}

async function copyTable(params: {
  source: Client;
  pool: pg.Pool;
  table: TableSpec;
  truncate: boolean;
}) {
  const { source, pool, table, truncate } = params;
  const exists = await tableExists(source, table.name);
  if (!exists) {
    console.log(`Skipping missing source table: ${table.name}`);
    return;
  }

  const selectCols = table.columns.map((c) => quoteIdent(c.name)).join(", ");
  const result = await source.execute(
    `SELECT ${selectCols} FROM ${quoteIdent(table.name)}`
  );
  console.log(`Read ${result.rows.length} rows from ${table.name}`);

  if (truncate) {
    await pool.query(`TRUNCATE TABLE ${quoteIdent(table.name)} CASCADE`);
  }

  if (result.rows.length === 0) {
    return;
  }

  const insertCols = table.columns.map((c) => quoteIdent(c.name)).join(", ");
  const placeholders = table.columns.map((_, i) => `$${i + 1}`).join(", ");
  const insertSql = `INSERT INTO ${quoteIdent(table.name)} (${insertCols}) VALUES (${placeholders})`;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const row of result.rows) {
      const values = table.columns.map((col) => {
        const raw =
          row[col.name] !== undefined
            ? row[col.name]
            : (row as Record<string, unknown>)[col.name];
        return castValue(col.kind, raw);
      });
      await client.query(insertSql, values);
    }
    await client.query("COMMIT");
    console.log(`Inserted ${result.rows.length} rows into ${table.name}`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const sourceUrl = normalizeSqliteSource(args.source);

  const source = createClient({
    url: sourceUrl,
    authToken: args.sourceToken,
  });

  const pool = new PgPool(getPgPoolConfig(args.target));

  try {
    console.log(`Migrating auth tables from ${sourceUrl} → ${args.target}`);
    for (const table of AUTH_TABLES) {
      await copyTable({
        source,
        pool,
        table,
        truncate: args.truncate,
      });
    }
    console.log("Done.");
  } finally {
    source.close();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
