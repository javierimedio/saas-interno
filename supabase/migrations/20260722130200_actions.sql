-- Modelo básico de Acciones (docs/03-modelo-datos.md §3.7), suficiente para las acciones
-- generadas durante un One2One. Se amplía (comentarios en hilo, kanban global) en su propia
-- vertical.
create table actions (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    person_id uuid not null references people(id) on delete cascade,
    assignee_id uuid not null references people(id) on delete cascade,
    one_on_one_id uuid references one_on_ones(id) on delete set null,
    title text not null,
    description text,
    status action_status not null default 'pending',
    priority action_priority not null default 'medium',
    due_date date,
    blocked_reason text,
    completed_at timestamptz,
    created_by uuid not null references auth.users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint chk_blocked_reason check (status <> 'blocked' or blocked_reason is not null)
);
create index idx_actions_org_status_due on actions(organization_id, status, due_date);
create index idx_actions_assignee on actions(assignee_id, status);
create index idx_actions_person on actions(person_id);
create index idx_actions_one_on_one on actions(one_on_one_id);

create trigger trg_actions_updated_at
before update on actions
for each row execute function set_updated_at();

create trigger trg_audit_actions
after insert or update or delete on actions
for each row execute function log_audit_event();
