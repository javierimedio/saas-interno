create type report_type as enum ('one_on_one_pdf', 'employee_summary', 'employee_annual', 'employee_full');

create table reports (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    person_id uuid references people(id) on delete cascade,
    one_on_one_id uuid references one_on_ones(id) on delete cascade,
    type report_type not null,
    generated_by uuid not null references auth.users(id),
    storage_path text not null,
    params jsonb not null default '{}',
    generated_at timestamptz not null default now()
);
create index idx_reports_person on reports(person_id);
create index idx_reports_org_date on reports(organization_id, generated_at desc);

alter table reports enable row level security;

create policy reports_select on reports for select
using (
    current_membership(organization_id) = 'admin'
    or (person_id is not null and person_id in (select id from people where manager_id = current_person_id(organization_id)))
    or generated_by = auth.uid()
);

create policy reports_insert on reports for insert
with check (current_membership(organization_id) in ('admin', 'manager'));

insert into storage.buckets (id, name, public)
values ('reports', 'reports', false)
on conflict (id) do nothing;

create policy reports_bucket_select on storage.objects for select
using (
    bucket_id = 'reports'
    and current_membership((storage.foldername(name))[1]::uuid) is not null
);

create policy reports_bucket_insert on storage.objects for insert
with check (
    bucket_id = 'reports'
    and current_membership((storage.foldername(name))[1]::uuid) in ('admin', 'manager')
);
