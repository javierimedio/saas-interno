create type time_off_type as enum ('vacation', 'sick_leave', 'other');

alter table people add column birth_date date;

create table time_off (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    person_id uuid not null references people(id) on delete cascade,
    start_date date not null,
    end_date date not null,
    type time_off_type not null default 'vacation',
    notes text,
    created_by uuid not null references auth.users(id),
    created_at timestamptz not null default now(),
    constraint chk_time_off_dates check (end_date >= start_date)
);
create index idx_time_off_person on time_off(person_id, start_date);
create index idx_time_off_org_range on time_off(organization_id, start_date, end_date);

create table holidays (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    date date not null,
    name text not null,
    created_at timestamptz not null default now(),
    unique (organization_id, date)
);
create index idx_holidays_org_date on holidays(organization_id, date);

alter table time_off enable row level security;
alter table holidays enable row level security;

create policy time_off_select on time_off for select
using (
    current_membership(organization_id) = 'admin'
    or person_id in (select id from people where manager_id = current_person_id(organization_id))
    or person_id in (select id from people where user_id = auth.uid())
);

create policy time_off_insert on time_off for insert
with check (current_membership(organization_id) in ('admin', 'manager'));

create policy time_off_delete on time_off for delete
using (current_membership(organization_id) in ('admin', 'manager'));

create policy holidays_select on holidays for select
using (current_membership(organization_id) is not null);

create policy holidays_insert on holidays for insert
with check (current_membership(organization_id) in ('admin', 'manager'));

create policy holidays_delete on holidays for delete
using (current_membership(organization_id) in ('admin', 'manager'));
