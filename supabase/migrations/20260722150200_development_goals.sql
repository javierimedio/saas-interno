-- Objetivos (docs/03-modelo-datos.md §3.5)
create table goals (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    person_id uuid not null references people(id) on delete cascade,
    title text not null,
    description text,
    category text,
    year int not null,
    start_date date not null,
    end_date date not null,
    status goal_status not null default 'on_track',
    weight numeric(4,2) default 1.0,
    created_by uuid not null references auth.users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint chk_goal_dates check (end_date >= start_date)
);
create index idx_goals_person_year on goals(person_id, year);
create index idx_goals_org_status on goals(organization_id, status);

create trigger trg_goals_updated_at before update on goals for each row execute function set_updated_at();
create trigger trg_audit_goals after insert or update or delete on goals for each row execute function log_audit_event();

create table goal_checkins (
    id uuid primary key default gen_random_uuid(),
    goal_id uuid not null references goals(id) on delete cascade,
    checkin_date date not null default current_date,
    progress_percent numeric(5,2) not null check (progress_percent between 0 and 100),
    comment text,
    created_by uuid not null references auth.users(id),
    created_at timestamptz not null default now()
);
create index idx_goal_checkins_goal on goal_checkins(goal_id, checkin_date desc);

alter table goals enable row level security;
alter table goal_checkins enable row level security;

create policy goals_select on goals for select
using (
    current_membership(organization_id) = 'admin'
    or person_id in (select id from people where manager_id = current_person_id(organization_id))
    or person_id in (select id from people where user_id = auth.uid())
);

create policy goals_insert on goals for insert
with check (current_membership(organization_id) in ('admin', 'manager'));

create policy goals_update on goals for update
using (
    current_membership(organization_id) = 'admin'
    or person_id in (select id from people where manager_id = current_person_id(organization_id))
)
with check (
    current_membership(organization_id) = 'admin'
    or person_id in (select id from people where manager_id = current_person_id(organization_id))
);

create policy goal_checkins_select on goal_checkins for select
using (goal_id in (select id from goals));

create policy goal_checkins_insert on goal_checkins for insert
with check (goal_id in (select id from goals where current_membership(organization_id) in ('admin', 'manager')));
