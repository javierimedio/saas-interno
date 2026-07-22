-- RLS (docs/03-modelo-datos.md §3.10). Activada en todas las tablas de dominio desde la
-- primera migración: no hay una fase futura de "añadir seguridad".

alter table organizations enable row level security;
alter table memberships enable row level security;
alter table departments enable row level security;
alter table people enable row level security;
alter table people_private_notes enable row level security;
alter table salary_records enable row level security;
alter table documents enable row level security;
alter table audit_log enable row level security;

-- organizations: solo visible para quien tiene membership en ella. Sin insert/update/delete
-- directos desde el cliente — se crean vía bootstrap_organization() (security definer).
create policy organizations_select on organizations for select
using (id in (select organization_id from memberships where user_id = auth.uid()));

-- memberships: cada usuario ve las membresías de su(s) organización(es).
create policy memberships_select on memberships for select
using (organization_id in (select organization_id from memberships where user_id = auth.uid()));

-- departments: visibles y gestionables por cualquier miembro de la organización (admin/manager).
create policy departments_select on departments for select
using (current_membership(organization_id) is not null);

create policy departments_insert on departments for insert
with check (current_membership(organization_id) in ('admin', 'manager'));

create policy departments_update on departments for update
using (current_membership(organization_id) in ('admin', 'manager'))
with check (current_membership(organization_id) in ('admin', 'manager'));

-- people: admin ve todo en su organización; manager ve/edita su propio equipo;
-- la propia persona (si tiene user_id) ve su fila, cuando exista autoservicio.
create policy people_select on people for select
using (
    current_membership(organization_id) = 'admin'
    or manager_id = current_person_id(organization_id)
    or user_id = auth.uid()
);

create policy people_insert on people for insert
with check (current_membership(organization_id) in ('admin', 'manager'));

create policy people_update on people for update
using (
    current_membership(organization_id) = 'admin'
    or manager_id = current_person_id(organization_id)
)
with check (
    current_membership(organization_id) = 'admin'
    or manager_id = current_person_id(organization_id)
);
-- Sin policy de delete: las bajas son un update de employment_status (baja lógica).

-- people_private_notes: solo el autor o un admin, nunca otro manager ni la propia persona.
create policy private_notes_select on people_private_notes for select
using (author_id = auth.uid() or current_membership(organization_id) = 'admin');

create policy private_notes_insert on people_private_notes for insert
with check (
    author_id = auth.uid()
    and current_membership(organization_id) in ('admin', 'manager')
);

-- salary_records: mismo alcance de lectura que people; solo insert (nunca update/delete).
create policy salary_records_select on salary_records for select
using (
    current_membership(organization_id) = 'admin'
    or person_id in (select id from people where manager_id = current_person_id(organization_id))
);

create policy salary_records_insert on salary_records for insert
with check (current_membership(organization_id) in ('admin', 'manager'));

-- documents: mismo alcance que people.
create policy documents_select on documents for select
using (
    current_membership(organization_id) = 'admin'
    or person_id in (select id from people where manager_id = current_person_id(organization_id))
);

create policy documents_insert on documents for insert
with check (current_membership(organization_id) in ('admin', 'manager'));

create policy documents_delete on documents for delete
using (current_membership(organization_id) in ('admin', 'manager'));

-- audit_log: solo lectura para admin/manager de la organización; la escritura pasa
-- exclusivamente por el trigger security definer, nunca por insert directo del cliente.
create policy audit_log_select on audit_log for select
using (current_membership(organization_id) in ('admin', 'manager'));
