#!/usr/bin/env bash
# Ensure the app database exists in the local Postgres container.
set -euo pipefail

: "${PG_CONTAINER_NAME:?PG_CONTAINER_NAME is required}"
: "${PG_USER:?PG_USER is required}"
: "${PG_PASSWORD:?PG_PASSWORD is required}"

create_db_if_missing() {
  local db_name="$1"
  docker exec -e PGPASSWORD="$PG_PASSWORD" "$PG_CONTAINER_NAME" \
    psql -U "$PG_USER" -d postgres -tc \
    "SELECT 1 FROM pg_database WHERE datname = '${db_name}'" | grep -q 1 \
    || docker exec -e PGPASSWORD="$PG_PASSWORD" "$PG_CONTAINER_NAME" \
      psql -U "$PG_USER" -d postgres -c "CREATE DATABASE \"${db_name}\""
  echo "Database ready: ${db_name}"
}

create_db_if_missing "${PG_DATABASE:-fimidara-dev}"
