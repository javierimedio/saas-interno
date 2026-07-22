-- Personas (docs/03-modelo-datos.md §3.3)
create table people (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    user_id uuid references auth.users(id) on delete set null,
    first_name text not null,
    last_name text not null,
    email text not null,
    phone text,
    avatar_url text,
    position_title text not null,
    department_id uuid references departments(id) on delete set null,
    manager_id uuid references people(id) on delete set null,
    hire_date date not null,
    termination_date date,
    employment_status employment_status not null default 'active',
    contract_type contract_type not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint chk_termination_after_hire check (termination_date is null or termination_date >= hire_date),
    constraint chk_not_own_manager check (manager_id is null or manager_id <> id)
);
create index idx_people_org on people(organization_id);
create index idx_people_manager on people(organization_id, manager_id);
create index idx_people_department on people(organization_id, department_id);
create index idx_people_status on people(organization_id, employment_status);
create unique index idx_people_org_email on people(organization_id, email);

create table people_private_notes (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    person_id uuid not null references people(id) on delete cascade,
    author_id uuid not null references auth.users(id),
    note text not null,
    visibility note_visibility not null default 'manager_only',
    created_at timestamptz not null default now()
);
create index idx_private_notes_person on people_private_notes(person_id);
