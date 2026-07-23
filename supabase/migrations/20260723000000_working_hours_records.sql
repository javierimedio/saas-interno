-- Histórico de jornada laboral (docs/03-modelo-datos.md §3.4): misma filosofía que
-- salary_records — nunca se pierde el dato anterior, cada cambio de jornada es un
-- registro nuevo con su fecha de efecto. La jornada vigente es siempre el último
-- registro por effective_date.
create table working_hours_records (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    person_id uuid not null references people(id) on delete cascade,
    effective_date date not null,
    weekly_hours numeric(5,2) not null check (weekly_hours > 0),
    working_percentage numeric(5,2) check (working_percentage > 0 and working_percentage <= 100),
    reason text not null,
    notes text,
    created_by uuid not null references auth.users(id),
    created_at timestamptz not null default now()
);
create index idx_working_hours_person_date on working_hours_records(person_id, effective_date desc);

-- Append-only real, igual que salary_records: nunca se actualiza ni se borra.
revoke update, delete on working_hours_records from authenticated;

alter table working_hours_records enable row level security;

-- Mismo alcance que salary_records tras la simplificación a dos roles (20260722160000):
-- admin ve todo; el empleado ve solo su propio histórico.
create policy working_hours_records_select on working_hours_records for select
using (
    current_membership(organization_id) = 'admin'
    or person_id in (select id from people where user_id = auth.uid())
);

create policy working_hours_records_insert on working_hours_records for insert
with check (current_membership(organization_id) = 'admin');
