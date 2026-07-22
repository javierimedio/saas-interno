-- Funciones auxiliares de RLS (docs/03-modelo-datos.md §3.10)
create or replace function current_membership(p_org uuid)
returns membership_role
language sql stable security definer
set search_path = public as $$
    select role from memberships
    where organization_id = p_org and user_id = auth.uid()
$$;

-- Resuelve la fila de `people` del usuario actual dentro de una organización. Marcada
-- security definer para no disparar de nuevo la política RLS de `people` al evaluarse
-- desde dentro de la propia política (evita recursión infinita en people_select/update).
create or replace function current_person_id(p_org uuid)
returns uuid
language sql stable security definer
set search_path = public as $$
    select id from people where organization_id = p_org and user_id = auth.uid()
$$;

-- Auditoría automática (docs/03-modelo-datos.md §3.11): cualquier cambio en tablas sensibles
-- queda registrado sin depender de que el código de aplicación recuerde escribirlo.
create or replace function log_audit_event()
returns trigger
language plpgsql security definer
set search_path = public as $$
begin
    insert into audit_log (organization_id, actor_id, entity_type, entity_id, action, diff)
    values (
        coalesce(new.organization_id, old.organization_id),
        auth.uid(),
        TG_TABLE_NAME,
        coalesce(new.id, old.id),
        (case TG_OP
            when 'INSERT' then 'create'
            when 'UPDATE' then 'update'
            when 'DELETE' then 'delete'
        end)::audit_action,
        case TG_OP
            when 'DELETE' then jsonb_build_object('before', to_jsonb(old))
            else jsonb_build_object('before', to_jsonb(old), 'after', to_jsonb(new))
        end
    );
    return coalesce(new, old);
end;
$$;

create trigger trg_audit_people
after insert or update or delete on people
for each row execute function log_audit_event();

create trigger trg_audit_salary_records
after insert on salary_records
for each row execute function log_audit_event();

create trigger trg_audit_memberships
after insert or update or delete on memberships
for each row execute function log_audit_event();

-- Mantiene updated_at al día en people.
create or replace function set_updated_at()
returns trigger
language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger trg_people_updated_at
before update on people
for each row execute function set_updated_at();

-- Arranque de organización (docs/00-resumen-ejecutivo.md, docs/02-arquitectura.md §2.7):
-- el primer inicio de sesión de un usuario sin membership crea su organización y su
-- membership de admin de forma atómica, sin necesitar políticas de INSERT abiertas
-- sobre organizations/memberships.
create or replace function bootstrap_organization(p_org_name text)
returns uuid
language plpgsql security definer
set search_path = public as $$
declare
    v_org_id uuid;
    v_slug text;
begin
    if exists (select 1 from memberships where user_id = auth.uid()) then
        raise exception 'El usuario ya pertenece a una organización';
    end if;

    v_slug := lower(regexp_replace(p_org_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(gen_random_uuid()::text, 1, 8);

    insert into organizations (name, slug) values (p_org_name, v_slug)
    returning id into v_org_id;

    insert into memberships (organization_id, user_id, role)
    values (v_org_id, auth.uid(), 'admin');

    return v_org_id;
end;
$$;

-- Alta atómica de persona + primer registro salarial (docs/01-analisis-funcional.md §1.4.2:
-- "el alta no permite guardar sin un salario inicial"). Se hace en una función para no depender
-- de una transacción multi-sentencia desde el cliente de Supabase.
create or replace function create_person_with_initial_salary(
    p_organization_id uuid,
    p_first_name text,
    p_last_name text,
    p_email text,
    p_phone text,
    p_position_title text,
    p_department_id uuid,
    p_manager_id uuid,
    p_hire_date date,
    p_contract_type contract_type,
    p_gross_annual_salary numeric,
    p_currency char(3)
)
returns people
language plpgsql security invoker
set search_path = public as $$
declare
    v_person people;
begin
    insert into people (
        organization_id, first_name, last_name, email, phone,
        position_title, department_id, manager_id, hire_date, contract_type
    ) values (
        p_organization_id, p_first_name, p_last_name, p_email, p_phone,
        p_position_title, p_department_id, p_manager_id, p_hire_date, p_contract_type
    )
    returning * into v_person;

    insert into salary_records (
        organization_id, person_id, effective_date, gross_annual_salary, currency, reason, created_by
    ) values (
        p_organization_id, v_person.id, p_hire_date, p_gross_annual_salary, coalesce(p_currency, 'EUR'), 'hire', auth.uid()
    );

    return v_person;
end;
$$;
