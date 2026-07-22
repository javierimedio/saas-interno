#!/usr/bin/env bash
# Levanta un Postgres nativo (sin Docker) con un esquema `auth`/`storage` mínimo y aplica
# las migraciones reales del proyecto, para poder ejecutar los tests de integración de RLS
# sin depender del stack completo de Supabase local (que requiere pull de imágenes Docker).
#
# Uso: ./scripts/setup-test-db.sh
# Requiere: un servidor PostgreSQL 16 accesible por el usuario del sistema "postgres"
# (por ejemplo, instalado vía `apt-get install postgresql-16`).
set -euo pipefail

DB_NAME="nexo_test"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

run_as_postgres() {
  su postgres -c "psql -v ON_ERROR_STOP=1 $*"
}

echo "==> Recreando base de datos ${DB_NAME}"
run_as_postgres <<SQL
select pg_terminate_backend(pid) from pg_stat_activity where datname='${DB_NAME}' and pid <> pg_backend_pid();
drop database if exists ${DB_NAME};
create database ${DB_NAME};
do \$\$
begin
  if not exists (select from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select from pg_roles where rolname = 'service_role') then
    create role service_role nologin bypassrls;
  end if;
  if not exists (select from pg_roles where rolname = 'app_user') then
    create role app_user login password 'devpassword' in role authenticated;
  end if;
end
\$\$;
SQL

echo "==> Aplicando stub de auth/storage"
su postgres -c "psql -v ON_ERROR_STOP=1 -d ${DB_NAME}" < "${REPO_ROOT}/tests/integration/fixtures/auth_stub.sql"

echo "==> Aplicando migraciones de supabase/migrations"
for f in "${REPO_ROOT}"/supabase/migrations/*.sql; do
  echo "   - $(basename "$f")"
  su postgres -c "psql -v ON_ERROR_STOP=1 -d ${DB_NAME}" < "$f"
done

echo "==> Grants adicionales sobre el esquema auth"
run_as_postgres -d "${DB_NAME}" <<SQL
grant select, insert, update, delete on all tables in schema auth to authenticated;
grant execute on all functions in schema auth to authenticated;
SQL

echo "==> Listo. Cadena de conexión para los tests:"
echo "    TEST_DATABASE_URL=postgresql://app_user:devpassword@localhost:5432/${DB_NAME}"
