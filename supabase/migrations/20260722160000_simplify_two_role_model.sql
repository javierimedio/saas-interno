-- Simplificación del modelo de permisos: la organización opera con dos roles únicamente.
-- admin (Javier Imedio): acceso completo a la organización.
-- employee (todos los demás): acceso de solo lectura a sus propios datos, nunca a los de otros.
-- El rol 'manager' deja de tener semántica propia en RLS (se mantiene en el enum por
-- compatibilidad hacia atrás, pero ninguna policy lo trata de forma especial).

-- departments: alta/edición pasan a ser exclusivas de admin.
drop policy if exists departments_insert on departments;
create policy departments_insert on departments for insert
with check (current_membership(organization_id) = 'admin');

drop policy if exists departments_update on departments;
create policy departments_update on departments for update
using (current_membership(organization_id) = 'admin')
with check (current_membership(organization_id) = 'admin');

-- people: admin ve/gestiona todo; el empleado solo ve su propia ficha.
drop policy if exists people_select on people;
create policy people_select on people for select
using (
    current_membership(organization_id) = 'admin'
    or user_id = auth.uid()
);

drop policy if exists people_insert on people;
create policy people_insert on people for insert
with check (current_membership(organization_id) = 'admin');

drop policy if exists people_update on people;
create policy people_update on people for update
using (current_membership(organization_id) = 'admin')
with check (current_membership(organization_id) = 'admin');

-- people_private_notes: solo admin las crea (ya eran invisibles para el resto).
drop policy if exists private_notes_insert on people_private_notes;
create policy private_notes_insert on people_private_notes for insert
with check (author_id = auth.uid() and current_membership(organization_id) = 'admin');

-- salary_records: admin ve todo; el empleado ve solo su propio historial.
drop policy if exists salary_records_select on salary_records;
create policy salary_records_select on salary_records for select
using (
    current_membership(organization_id) = 'admin'
    or person_id in (select id from people where user_id = auth.uid())
);

drop policy if exists salary_records_insert on salary_records;
create policy salary_records_insert on salary_records for insert
with check (current_membership(organization_id) = 'admin');

-- documents: mismo alcance que people/salary_records.
drop policy if exists documents_select on documents;
create policy documents_select on documents for select
using (
    current_membership(organization_id) = 'admin'
    or person_id in (select id from people where user_id = auth.uid())
);

drop policy if exists documents_insert on documents;
create policy documents_insert on documents for insert
with check (current_membership(organization_id) = 'admin');

drop policy if exists documents_delete on documents;
create policy documents_delete on documents for delete
using (current_membership(organization_id) = 'admin');

-- audit_log: solo admin.
drop policy if exists audit_log_select on audit_log;
create policy audit_log_select on audit_log for select
using (current_membership(organization_id) = 'admin');

-- one_on_ones: admin gestiona todo; el empleado solo ve los suyos (sin editar).
drop policy if exists one_on_ones_select on one_on_ones;
create policy one_on_ones_select on one_on_ones for select
using (
    current_membership(organization_id) = 'admin'
    or person_id in (select id from people where user_id = auth.uid())
);

drop policy if exists one_on_ones_insert on one_on_ones;
create policy one_on_ones_insert on one_on_ones for insert
with check (current_membership(organization_id) = 'admin');

drop policy if exists one_on_ones_update on one_on_ones;
create policy one_on_ones_update on one_on_ones for update
using (current_membership(organization_id) = 'admin')
with check (current_membership(organization_id) = 'admin');

drop policy if exists agenda_items_insert on one_on_one_agenda_items;
create policy agenda_items_insert on one_on_one_agenda_items for insert
with check (one_on_one_id in (select id from one_on_ones where current_membership(organization_id) = 'admin'));

drop policy if exists agenda_items_update on one_on_one_agenda_items;
create policy agenda_items_update on one_on_one_agenda_items for update
using (one_on_one_id in (select id from one_on_ones where current_membership(organization_id) = 'admin'))
with check (one_on_one_id in (select id from one_on_ones where current_membership(organization_id) = 'admin'));

drop policy if exists agenda_items_delete on one_on_one_agenda_items;
create policy agenda_items_delete on one_on_one_agenda_items for delete
using (one_on_one_id in (select id from one_on_ones where current_membership(organization_id) = 'admin'));

drop policy if exists agreements_insert on one_on_one_agreements;
create policy agreements_insert on one_on_one_agreements for insert
with check (one_on_one_id in (select id from one_on_ones where current_membership(organization_id) = 'admin'));

-- actions: admin gestiona todo; el empleado ve las suyas (como afectado o asignatario).
drop policy if exists actions_select on actions;
create policy actions_select on actions for select
using (
    current_membership(organization_id) = 'admin'
    or person_id in (select id from people where user_id = auth.uid())
    or assignee_id in (select id from people where user_id = auth.uid())
);

drop policy if exists actions_insert on actions;
create policy actions_insert on actions for insert
with check (current_membership(organization_id) = 'admin');

drop policy if exists actions_update on actions;
create policy actions_update on actions for update
using (current_membership(organization_id) = 'admin')
with check (current_membership(organization_id) = 'admin');

-- goals: admin gestiona todo; el empleado ve los suyos.
drop policy if exists goals_select on goals;
create policy goals_select on goals for select
using (
    current_membership(organization_id) = 'admin'
    or person_id in (select id from people where user_id = auth.uid())
);

drop policy if exists goals_insert on goals;
create policy goals_insert on goals for insert
with check (current_membership(organization_id) = 'admin');

drop policy if exists goals_update on goals;
create policy goals_update on goals for update
using (current_membership(organization_id) = 'admin')
with check (current_membership(organization_id) = 'admin');

drop policy if exists goal_checkins_insert on goal_checkins;
create policy goal_checkins_insert on goal_checkins for insert
with check (goal_id in (select id from goals where current_membership(organization_id) = 'admin'));

-- competencies / person_competencies.
drop policy if exists competencies_insert on competencies;
create policy competencies_insert on competencies for insert
with check (current_membership(organization_id) = 'admin');

drop policy if exists person_competencies_select on person_competencies;
create policy person_competencies_select on person_competencies for select
using (
    current_membership(organization_id) = 'admin'
    or person_id in (select id from people where user_id = auth.uid())
);

drop policy if exists person_competencies_insert on person_competencies;
create policy person_competencies_insert on person_competencies for insert
with check (current_membership(organization_id) = 'admin');

-- trainings.
drop policy if exists trainings_select on trainings;
create policy trainings_select on trainings for select
using (
    current_membership(organization_id) = 'admin'
    or person_id in (select id from people where user_id = auth.uid())
);

drop policy if exists trainings_insert on trainings;
create policy trainings_insert on trainings for insert
with check (current_membership(organization_id) = 'admin');

drop policy if exists trainings_update on trainings;
create policy trainings_update on trainings for update
using (current_membership(organization_id) = 'admin')
with check (current_membership(organization_id) = 'admin');

-- career_plans / career_plan_milestones.
drop policy if exists career_plans_select on career_plans;
create policy career_plans_select on career_plans for select
using (
    current_membership(organization_id) = 'admin'
    or person_id in (select id from people where user_id = auth.uid())
);

drop policy if exists career_plans_insert on career_plans;
create policy career_plans_insert on career_plans for insert
with check (current_membership(organization_id) = 'admin');

drop policy if exists career_plans_update on career_plans;
create policy career_plans_update on career_plans for update
using (current_membership(organization_id) = 'admin')
with check (current_membership(organization_id) = 'admin');

drop policy if exists career_milestones_insert on career_plan_milestones;
create policy career_milestones_insert on career_plan_milestones for insert
with check (career_plan_id in (select id from career_plans where current_membership(organization_id) = 'admin'));

drop policy if exists career_milestones_update on career_plan_milestones;
create policy career_milestones_update on career_plan_milestones for update
using (career_plan_id in (select id from career_plans where current_membership(organization_id) = 'admin'))
with check (career_plan_id in (select id from career_plans where current_membership(organization_id) = 'admin'));

-- feedback_entries / evaluations.
drop policy if exists feedback_select on feedback_entries;
create policy feedback_select on feedback_entries for select
using (
    current_membership(organization_id) = 'admin'
    or (visibility = 'shared_with_employee' and person_id in (select id from people where user_id = auth.uid()))
);

drop policy if exists feedback_insert on feedback_entries;
create policy feedback_insert on feedback_entries for insert
with check (author_id = auth.uid() and current_membership(organization_id) = 'admin');

drop policy if exists evaluations_select on evaluations;
create policy evaluations_select on evaluations for select
using (
    current_membership(organization_id) = 'admin'
    or person_id in (select id from people where user_id = auth.uid())
);

drop policy if exists evaluations_insert on evaluations;
create policy evaluations_insert on evaluations for insert
with check (current_membership(organization_id) = 'admin');

-- time_off / holidays.
drop policy if exists time_off_select on time_off;
create policy time_off_select on time_off for select
using (
    current_membership(organization_id) = 'admin'
    or person_id in (select id from people where user_id = auth.uid())
);

drop policy if exists time_off_insert on time_off;
create policy time_off_insert on time_off for insert
with check (current_membership(organization_id) = 'admin');

drop policy if exists time_off_delete on time_off;
create policy time_off_delete on time_off for delete
using (current_membership(organization_id) = 'admin');

drop policy if exists holidays_insert on holidays;
create policy holidays_insert on holidays for insert
with check (current_membership(organization_id) = 'admin');

drop policy if exists holidays_delete on holidays;
create policy holidays_delete on holidays for delete
using (current_membership(organization_id) = 'admin');

-- reports (tabla + bucket): admin ve todo; el empleado solo los suyos.
drop policy if exists reports_select on reports;
create policy reports_select on reports for select
using (
    current_membership(organization_id) = 'admin'
    or (person_id is not null and person_id in (select id from people where user_id = auth.uid()))
);

drop policy if exists reports_insert on reports;
create policy reports_insert on reports for insert
with check (current_membership(organization_id) = 'admin');

drop policy if exists reports_bucket_select on storage.objects;
create policy reports_bucket_select on storage.objects for select
using (
    bucket_id = 'reports'
    and (
        current_membership((storage.foldername(name))[1]::uuid) = 'admin'
        or (storage.foldername(name))[2]::uuid = current_person_id((storage.foldername(name))[1]::uuid)
    )
);

drop policy if exists reports_bucket_insert on storage.objects;
create policy reports_bucket_insert on storage.objects for insert
with check (
    bucket_id = 'reports'
    and current_membership((storage.foldername(name))[1]::uuid) = 'admin'
);

-- documents bucket: admin ve todo; el empleado solo su propia carpeta.
drop policy if exists documents_bucket_select on storage.objects;
create policy documents_bucket_select on storage.objects for select
using (
    bucket_id = 'documents'
    and (
        current_membership((storage.foldername(name))[1]::uuid) = 'admin'
        or (storage.foldername(name))[2]::uuid = current_person_id((storage.foldername(name))[1]::uuid)
    )
);

drop policy if exists documents_bucket_insert on storage.objects;
create policy documents_bucket_insert on storage.objects for insert
with check (
    bucket_id = 'documents'
    and current_membership((storage.foldername(name))[1]::uuid) = 'admin'
);

drop policy if exists documents_bucket_delete on storage.objects;
create policy documents_bucket_delete on storage.objects for delete
using (
    bucket_id = 'documents'
    and current_membership((storage.foldername(name))[1]::uuid) = 'admin'
);
