create table career_plans (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    person_id uuid not null references people(id) on delete cascade,
    target_position text not null,
    notes text,
    created_by uuid not null references auth.users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index idx_career_plans_person on career_plans(person_id);

create trigger trg_career_plans_updated_at before update on career_plans for each row execute function set_updated_at();

create table career_plan_milestones (
    id uuid primary key default gen_random_uuid(),
    career_plan_id uuid not null references career_plans(id) on delete cascade,
    title text not null,
    target_date date,
    completed_at timestamptz,
    created_at timestamptz not null default now()
);
create index idx_career_milestones_plan on career_plan_milestones(career_plan_id);

alter table career_plans enable row level security;
alter table career_plan_milestones enable row level security;

create policy career_plans_select on career_plans for select
using (
    current_membership(organization_id) = 'admin'
    or person_id in (select id from people where manager_id = current_person_id(organization_id))
    or person_id in (select id from people where user_id = auth.uid())
);

create policy career_plans_insert on career_plans for insert
with check (current_membership(organization_id) in ('admin', 'manager'));

create policy career_plans_update on career_plans for update
using (
    current_membership(organization_id) = 'admin'
    or person_id in (select id from people where manager_id = current_person_id(organization_id))
)
with check (
    current_membership(organization_id) = 'admin'
    or person_id in (select id from people where manager_id = current_person_id(organization_id))
);

create policy career_milestones_select on career_plan_milestones for select
using (career_plan_id in (select id from career_plans));

create policy career_milestones_insert on career_plan_milestones for insert
with check (career_plan_id in (select id from career_plans where current_membership(organization_id) in ('admin','manager')));

create policy career_milestones_update on career_plan_milestones for update
using (career_plan_id in (select id from career_plans where current_membership(organization_id) in ('admin','manager')))
with check (career_plan_id in (select id from career_plans where current_membership(organization_id) in ('admin','manager')));
