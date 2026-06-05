# fimidara server node

[fimidara.com](https://fimidara.com)

fimidara is a file storage service primarily intended for developers. It's a simple, secure, and scalable file storage service that is easy to integrate into your application.

```bash
pnpm dev
```

## Auth DB migration (SQLite/Turso → Postgres)

This app’s NextAuth tables (`user`, `account`, `session`, `verificationToken`, `authenticator`) now use **Postgres** via `DATABASE_URL`.

### 1) Apply Postgres schema migrations

Make sure `DATABASE_URL` is set, then run:

```bash
pnpm db:migrate
```

### 2) Copy existing auth data from Turso/SQLite into Postgres

Set these env vars:

- `DATABASE_URL` (target Postgres)
- `TURSO_DATABASE_URL` (source Turso)
- `TURSO_AUTH_TOKEN` (source Turso)

Then run:

```bash
pnpm db:migrate-auth-sqlite-to-postgres
```

The script is **safe to re-run**: it upserts records into Postgres in dependency order.
