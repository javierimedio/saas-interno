-- Stub local de auth.users / auth.uid() para poder aplicar y probar las migraciones
-- reales contra un Postgres nativo, sin el stack completo de Supabase (GoTrue, etc.).
-- Esto NO se commitea en supabase/migrations/: en un proyecto Supabase real (local con
-- Docker o en la nube) el esquema auth ya existe y se gestiona por la plataforma.
create schema if not exists extensions;
create schema if not exists auth;

create table if not exists auth.users (
    id uuid primary key default gen_random_uuid(),
    email text
);

create or replace function auth.uid()
returns uuid
language sql stable as $$
    select nullif(current_setting('app.current_user_id', true), '')::uuid
$$;

create schema if not exists storage;
create table if not exists storage.buckets (
    id text primary key,
    name text not null,
    public boolean not null default false
);
create table if not exists storage.objects (
    id uuid primary key default gen_random_uuid(),
    bucket_id text references storage.buckets(id),
    name text,
    owner uuid
);
create or replace function storage.foldername(name text)
returns text[]
language sql immutable as $$
    select string_to_array(name, '/')
$$;

grant usage on schema public to authenticated, anon, service_role;
grant usage on schema auth to authenticated, anon, service_role;
grant usage on schema storage to authenticated, anon, service_role;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant usage, select on sequences to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select, insert, update, delete on all tables in schema storage to authenticated;
grant execute on all functions in schema public to authenticated;
