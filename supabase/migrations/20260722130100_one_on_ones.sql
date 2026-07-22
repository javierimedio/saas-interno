create table one_on_ones (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    person_id uuid not null references people(id) on delete cascade,
    manager_id uuid not null references people(id) on delete cascade,
    scheduled_at timestamptz not null,
    actual_started_at timestamptz,
    actual_ended_at timestamptz,
    status one_on_one_status not null default 'scheduled',
    mode meeting_mode not null default 'video',
    manager_comments text,
    employee_comments text,
    overall_rating smallint check (overall_rating between 1 and 5),
    next_meeting_suggested_at timestamptz,
    created_by uuid not null references auth.users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
create index idx_one_on_ones_person on one_on_ones(person_id, scheduled_at desc);
create index idx_one_on_ones_manager on one_on_ones(manager_id, scheduled_at desc);
create index idx_one_on_ones_org_status on one_on_ones(organization_id, status, scheduled_at);

create trigger trg_one_on_ones_updated_at
before update on one_on_ones
for each row execute function set_updated_at();

create trigger trg_audit_one_on_ones
after insert or update or delete on one_on_ones
for each row execute function log_audit_event();

create table one_on_one_agenda_items (
    id uuid primary key default gen_random_uuid(),
    one_on_one_id uuid not null references one_on_ones(id) on delete cascade,
    topic text not null,
    source text not null default 'manual',
    position int not null default 0,
    discussed boolean not null default false,
    notes text,
    created_at timestamptz not null default now()
);
create index idx_agenda_items_meeting on one_on_one_agenda_items(one_on_one_id, position);

create table one_on_one_agreements (
    id uuid primary key default gen_random_uuid(),
    one_on_one_id uuid not null references one_on_ones(id) on delete cascade,
    description text not null,
    created_by uuid not null references auth.users(id),
    created_at timestamptz not null default now()
);
create index idx_agreements_meeting on one_on_one_agreements(one_on_one_id, created_at);
