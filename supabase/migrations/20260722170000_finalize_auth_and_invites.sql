-- Autenticación definitiva (docs/06-roadmap.md): cierra el ciclo de alta de usuarios.
--
-- 1. link_or_bootstrap_membership(): sustituye a bootstrap_organization() como punto de
--    entrada del primer login. Si el email del usuario coincide con una persona ya dada de
--    alta por un admin (people.email) que todavía no tiene user_id, la vincula como
--    "employee" de esa organización en lugar de crearle una organización propia — es el
--    mecanismo de invitación: el admin da de alta a la persona con su email real desde
--    Personas, y el primer login del empleado hace el resto. Si no hay ninguna persona
--    pendiente con ese email, se comporta como bootstrap_organization() (crea organización
--    nueva, rol admin) para no romper el alta de nuevos clientes/organizaciones.
create or replace function link_or_bootstrap_membership(p_email text, p_org_name text)
returns uuid
language plpgsql security definer
set search_path = public as $$
declare
    v_person people%rowtype;
    v_org_id uuid;
    v_slug text;
begin
    if exists (select 1 from memberships where user_id = auth.uid()) then
        raise exception 'El usuario ya pertenece a una organización';
    end if;

    select * into v_person
    from people
    where lower(email) = lower(p_email) and user_id is null
    limit 1;

    if found then
        update people set user_id = auth.uid() where id = v_person.id;
        insert into memberships (organization_id, user_id, role)
        values (v_person.organization_id, auth.uid(), 'employee');
        return v_person.organization_id;
    end if;

    v_slug := lower(regexp_replace(p_org_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(gen_random_uuid()::text, 1, 8);

    insert into organizations (name, slug) values (p_org_name, v_slug)
    returning id into v_org_id;

    insert into memberships (organization_id, user_id, role)
    values (v_org_id, auth.uid(), 'admin');

    return v_org_id;
end;
$$;

-- 2. salary_records.created_by se relajó temporalmente a NULL en producción para poder
--    importar el histórico salarial anterior a la existencia de usuarios reales. Con el
--    sistema de autenticación cerrado, se atribuyen esas filas heredadas al admin de su
--    organización (quien autorizó la importación) y se restaura la integridad NOT NULL.
update salary_records sr
set created_by = (
    select m.user_id
    from memberships m
    where m.organization_id = sr.organization_id and m.role = 'admin'
    order by m.created_at asc
    limit 1
)
where sr.created_by is null;

alter table salary_records alter column created_by set not null;
