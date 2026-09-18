#!/usr/bin/env bash
# Bring a fresh checkout (or a fresh ephemeral container) to a runnable state.
# Idempotent: safe to re-run, skips whatever is already in place.
set -euo pipefail

cd "$(dirname "$0")/.."

PG_VERSION=16
PG_CLUSTER=main
DB_NAME=peak
DB_USER=peak
DB_PASS=peak

echo "==> Installing dependencies"
pnpm install --frozen-lockfile

echo "==> Postgres"
if command -v pg_ctlcluster >/dev/null 2>&1; then
  if ! pg_isready -q 2>/dev/null; then
    pg_ctlcluster "$PG_VERSION" "$PG_CLUSTER" start || true
    # The cluster reports ready a moment after pg_ctlcluster returns.
    for _ in $(seq 1 20); do pg_isready -q 2>/dev/null && break; sleep 0.5; done
  fi

  if pg_isready -q 2>/dev/null; then
    # `psql -tAc` prints 1 only when the row exists, so an empty result means create.
    if [ -z "$(su postgres -c "psql -tAc \"select 1 from pg_roles where rolname='$DB_USER'\"")" ]; then
      su postgres -c "psql -qc \"create role $DB_USER with login password '$DB_PASS' superuser\""
      echo "    created role $DB_USER"
    fi
    if [ -z "$(su postgres -c "psql -tAc \"select 1 from pg_database where datname='$DB_NAME'\"")" ]; then
      su postgres -c "psql -qc \"create database $DB_NAME owner $DB_USER\""
      echo "    created database $DB_NAME"
    fi
    echo "    ready on 127.0.0.1:5432"
  else
    echo "    WARNING: postgres did not come up; skipping database setup" >&2
  fi
else
  echo "    WARNING: no local postgres found; set DATABASE_URL to a reachable server" >&2
fi

echo "==> Environment"
if [ ! -f .env.local ]; then
  sed "s|^BETTER_AUTH_SECRET=.*|BETTER_AUTH_SECRET=$(openssl rand -base64 32)|" \
    .env.example > .env.local
  chmod 600 .env.local
  echo "    created .env.local from .env.example with a generated dev secret"
else
  echo "    .env.local already present, leaving it alone"
fi

echo "==> Database schema"
pnpm db:migrate

echo
echo "Ready. Run 'pnpm dev' and open http://localhost:3000"
