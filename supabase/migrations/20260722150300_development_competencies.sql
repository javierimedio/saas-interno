create table competencies (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    name text not null,
    description text,
    created_at timestamptz not null default now(),
    unique (organization_id, name)
);
create index idx_competencies_org on competencies(organization_id);

create table person_competencies (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    person_id uuid not null references people(id) on delete cascade,
    competency_id uuid not null references competencies(id) on delete cascade,
    level smallint not null check (level between 1 and 5),
    assessed_at date not null default current_date,
    assessed_by uuid not null references auth.users(id),
    notes text,
    created_at timestamptz not null default now()
);
create index idx_person_competencies_person on person_competencies(person_id, competency_id, assessed_at desc);

alter table competencies enable row level security;
alter table person_competencies enable row level security;

create policy competencies_select on competencies for select
using (current_membership(organization_id) is not null);

create policy competencies_insert on competencies for insert
with check (current_membership(organization_id) in ('admin', 'manager'));

create policy person_competencies_select on person_competencies for select
using (
    current_membership(organization_id) = 'admin'
    or person_id in (select id from people where manager_id = current_person_id(organization_id))
    or person_id in (select id from people where user_id = auth.uid())
);

create policy person_competencies_insert on person_competencies for insert
with check (current_membership(organization_id) in ('admin', 'manager'));
