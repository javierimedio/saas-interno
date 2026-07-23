create table feedback_entries (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    person_id uuid not null references people(id) on delete cascade,
    author_id uuid not null references auth.users(id),
    text text not null,
    visibility feedback_visibility not null default 'manager_only',
    created_at timestamptz not null default now()
);
create index idx_feedback_person on feedback_entries(person_id, created_at desc);

create table evaluations (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    person_id uuid not null references people(id) on delete cascade,
    period text not null,
    result text not null,
    evaluator_id uuid not null references auth.users(id),
    notes text,
    created_at timestamptz not null default now()
);
create index idx_evaluations_person on evaluations(person_id, created_at desc);

alter table feedback_entries enable row level security;
alter table evaluations enable row level security;

create policy feedback_select on feedback_entries for select
using (
    current_membership(organization_id) = 'admin'
    or person_id in (select id from people where manager_id = current_person_id(organization_id))
    or (visibility = 'shared_with_employee' and person_id in (select id from people where user_id = auth.uid()))
);

create policy feedback_insert on feedback_entries for insert
with check (
    author_id = auth.uid()
    and current_membership(organization_id) in ('admin', 'manager')
);

create policy evaluations_select on evaluations for select
using (
    current_membership(organization_id) = 'admin'
    or person_id in (select id from people where manager_id = current_person_id(organization_id))
);

create policy evaluations_insert on evaluations for insert
with check (current_membership(organization_id) in ('admin', 'manager'));
