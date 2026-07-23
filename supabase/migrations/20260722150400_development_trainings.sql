create table trainings (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    person_id uuid not null references people(id) on delete cascade,
    title text not null,
    provider text,
    status training_status not null default 'planned',
    start_date date,
    end_date date,
    certificate_document_id uuid references documents(id) on delete set null,
    created_by uuid not null references auth.users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index idx_trainings_person on trainings(person_id, start_date desc);
create index idx_trainings_org_status on trainings(organization_id, status);

create trigger trg_trainings_updated_at before update on trainings for each row execute function set_updated_at();

alter table trainings enable row level security;

create policy trainings_select on trainings for select
using (
    current_membership(organization_id) = 'admin'
    or person_id in (select id from people where manager_id = current_person_id(organization_id))
    or person_id in (select id from people where user_id = auth.uid())
);

create policy trainings_insert on trainings for insert
with check (current_membership(organization_id) in ('admin', 'manager'));

create policy trainings_update on trainings for update
using (
    current_membership(organization_id) = 'admin'
    or person_id in (select id from people where manager_id = current_person_id(organization_id))
)
with check (
    current_membership(organization_id) = 'admin'
    or person_id in (select id from people where manager_id = current_person_id(organization_id))
);
