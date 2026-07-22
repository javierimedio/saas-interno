alter table one_on_ones enable row level security;
alter table one_on_one_agenda_items enable row level security;
alter table one_on_one_agreements enable row level security;
alter table actions enable row level security;

-- one_on_ones: admin ve todo en su organización; manager ve las reuniones que conduce;
-- la propia persona (autoservicio futuro) ve las suyas.
create policy one_on_ones_select on one_on_ones for select
using (
    current_membership(organization_id) = 'admin'
    or manager_id = current_person_id(organization_id)
    or person_id in (select id from people where user_id = auth.uid())
);

create policy one_on_ones_insert on one_on_ones for insert
with check (
    current_membership(organization_id) in ('admin', 'manager')
    and (current_membership(organization_id) = 'admin' or manager_id = current_person_id(organization_id))
);

create policy one_on_ones_update on one_on_ones for update
using (current_membership(organization_id) = 'admin' or manager_id = current_person_id(organization_id))
with check (current_membership(organization_id) = 'admin' or manager_id = current_person_id(organization_id));
-- Sin policy de delete: cancelar es un cambio de estado, no un borrado.

-- one_on_one_agenda_items / one_on_one_agreements: heredan el alcance de la reunión —
-- la subconsulta sobre one_on_ones ya aplica su propia RLS (no es autorreferencial, no hay
-- riesgo de la recursión vista en people_select).
create policy agenda_items_select on one_on_one_agenda_items for select
using (one_on_one_id in (select id from one_on_ones));

create policy agenda_items_insert on one_on_one_agenda_items for insert
with check (one_on_one_id in (select id from one_on_ones where current_membership(organization_id) = 'admin' or manager_id = current_person_id(organization_id)));

create policy agenda_items_update on one_on_one_agenda_items for update
using (one_on_one_id in (select id from one_on_ones where current_membership(organization_id) = 'admin' or manager_id = current_person_id(organization_id)))
with check (one_on_one_id in (select id from one_on_ones where current_membership(organization_id) = 'admin' or manager_id = current_person_id(organization_id)));

create policy agenda_items_delete on one_on_one_agenda_items for delete
using (one_on_one_id in (select id from one_on_ones where current_membership(organization_id) = 'admin' or manager_id = current_person_id(organization_id)));

create policy agreements_select on one_on_one_agreements for select
using (one_on_one_id in (select id from one_on_ones));

create policy agreements_insert on one_on_one_agreements for insert
with check (one_on_one_id in (select id from one_on_ones where current_membership(organization_id) = 'admin' or manager_id = current_person_id(organization_id)));

-- actions: mismo patrón que people — admin ve todo; manager ve las de su equipo (persona
-- afectada o asignatario dentro de su equipo) o las que él mismo creó.
create policy actions_select on actions for select
using (
    current_membership(organization_id) = 'admin'
    or person_id in (select id from people where manager_id = current_person_id(organization_id))
    or assignee_id in (select id from people where manager_id = current_person_id(organization_id))
    or created_by = auth.uid()
);

create policy actions_insert on actions for insert
with check (current_membership(organization_id) in ('admin', 'manager'));

create policy actions_update on actions for update
using (
    current_membership(organization_id) = 'admin'
    or person_id in (select id from people where manager_id = current_person_id(organization_id))
    or assignee_id in (select id from people where manager_id = current_person_id(organization_id))
    or created_by = auth.uid()
)
with check (
    current_membership(organization_id) = 'admin'
    or person_id in (select id from people where manager_id = current_person_id(organization_id))
    or assignee_id in (select id from people where manager_id = current_person_id(organization_id))
    or created_by = auth.uid()
);
