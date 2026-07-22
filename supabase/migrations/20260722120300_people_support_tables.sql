-- Revisiones salariales, documentos y auditoría (docs/03-modelo-datos.md §3.4, §3.8, §3.9)
create table salary_records (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    person_id uuid not null references people(id) on delete cascade,
    effective_date date not null,
    gross_annual_salary numeric(12,2) not null check (gross_annual_salary >= 0),
    currency char(3) not null default 'EUR',
    variable_comp numeric(12,2) default 0,
    reason salary_change_reason not null,
    notes text,
    created_by uuid not null references auth.users(id),
    created_at timestamptz not null default now()
);
create index idx_salary_person_date on salary_records(person_id, effective_date desc);

create table documents (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    person_id uuid not null references people(id) on delete cascade,
    uploaded_by uuid not null references auth.users(id),
    storage_path text not null,
    file_name text not null,
    mime_type text not null,
    size_bytes bigint not null,
    category document_category not null default 'other',
    created_at timestamptz not null default now()
);
create index idx_documents_person on documents(person_id);

create table audit_log (
    id uuid primary key default gen_random_uuid(),
    organization_id uuid not null references organizations(id) on delete cascade,
    actor_id uuid references auth.users(id),
    entity_type text not null,
    entity_id uuid not null,
    action audit_action not null,
    diff jsonb not null default '{}',
    created_at timestamptz not null default now()
);
create index idx_audit_entity on audit_log(entity_type, entity_id);
create index idx_audit_org_date on audit_log(organization_id, created_at desc);

-- Append-only real: salario y auditoría nunca se actualizan ni se borran (docs/03-modelo-datos.md §3.4, §3.9).
revoke update, delete on salary_records from authenticated;
revoke update, delete on audit_log from authenticated;
