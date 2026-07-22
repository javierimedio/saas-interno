-- Corrige recursión infinita en memberships_select: la política consultaba `memberships`
-- dentro de su propia política de SELECT sobre `memberships` (mismo patrón de bug que
-- people_select, ver supabase/migrations/20260722130300_one_on_one_rls.sql y
-- docs/dev/01-personas.md). current_membership() es security definer y no vuelve a
-- disparar RLS al consultar memberships internamente, así que resuelve el caso sin recursión.
--
-- Este bug afectaba a requireCurrentSession() en cada carga de página autenticada
-- (src/shared/infrastructure/supabase/current-session.ts), causando un bucle de redirección
-- /hoy ⇄ /login en producción.
drop policy if exists memberships_select on memberships;

create policy memberships_select on memberships for select
using (
    user_id = auth.uid()
    or current_membership(organization_id) = 'admin'
);
