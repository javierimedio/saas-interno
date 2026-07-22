-- Organización y membresías (docs/03-modelo-datos.md §3.3, docs/02-arquitectura.md §2.7)
create table organizations (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    created_at timestamptz not null default now()
);

create table memberships (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    role membership_role not null,
    created_at timestamptz not null default now(),
    unique (organization_id, user_id)
);
create index idx_memberships_user on memberships(user_id);
create index idx_memberships_org on memberships(organization_id);

create table departments (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    name text not null,
    parent_department_id uuid references departments(id) on delete set null,
    created_at timestamptz not null default now(),
    unique (organization_id, name)
);
create index idx_departments_org on departments(organization_id);
