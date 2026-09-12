# Database scripts

## Local Postgres

```bash
pnpm postgres:start
pnpm postgres:ensure-dbs
pnpm db:migrate
```

Env: `PG_DATABASE_URL`. Local Docker also uses `PG_HOST`, `PG_PORT`, `PG_USER`, `PG_PASSWORD`, `PG_DATABASE`, and `PG_CONTAINER_NAME` (see `.env.local`).

## SQLite / Turso → Postgres data copy

Schema must already be migrated on the target. This script is **data-only** (Auth.js tables).

```bash
pnpm exec tsx scripts/db/migrate-sqlite-to-postgres.ts \
  --source "$TURSO_DATABASE_URL" \
  --source-token "$TURSO_AUTH_TOKEN" \
  --target "$PG_DATABASE_URL" \
  --truncate
```

Local dump files also work:

```bash
pnpm exec tsx scripts/db/migrate-sqlite-to-postgres.ts \
  --source .migration-dumps/auth.sqlite \
  --target "$PG_DATABASE_URL" \
  --truncate
```

`--truncate` clears target tables before insert. Omit it to fail on conflicts.

Run with `softkave-forerunner`:

```bash
npx softkave-forerunner@latest run-env --cmd \
  "npx tsx scripts/db/migrate-sqlite-to-postgres.ts --source \$TURSO_DATABASE_URL --target \$PG_DATABASE_URL --truncate"
```
