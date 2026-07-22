# Iteración 1 — Personas

Estado: **completa**. Autenticación, layout principal, listado con búsqueda/filtros/paginación,
ficha de empleado (página única con secciones ancladas), alta con salario inicial, edición,
baja lógica, histórico (auditoría + salario), documentos, notas privadas, RLS, tests.

## Documentos de diseño que aplican

`docs/01-analisis-funcional.md` §1.4.2, `docs/02-arquitectura.md`, `docs/03-modelo-datos.md`
§3.3-3.4, `docs/04-estructura-carpetas.md`, `docs/product-design/03-employee-profile.md`.

## Decisiones tomadas durante la implementación

1. **Historial de esta iteración = `audit_log` + `salary_records` + `documents`.** La
   taxonomía completa de eventos de `docs/product-design/03-employee-profile.md` §3.3
   (1:1, acciones, objetivos, formación…) depende de verticales que aún no existen. Se
   construye ahora el mecanismo de Cronología (`build-person-timeline.ts`, agrupación por
   mes, componente `PersonTimeline`) con los tipos de evento disponibles; añadir un tipo
   nuevo cuando exista su fuente de datos es extender `PersonTimelineEventType` y el mapeo
   correspondiente, no rediseñar el componente.
2. **Bug de RLS encontrado y corregido durante el desarrollo — recursión infinita.** Las
   políticas `people_select`/`people_update` originales resolvían "¿soy el manager de esta
   fila?" con una subconsulta inline sobre la propia tabla `people`. Postgres necesita
   revalidar `people_select` para evaluar esa subconsulta, que a su vez vuelve a evaluar la
   misma política → recursión infinita. Solución: función `current_person_id()` marcada
   `security definer` (mismo patrón que `current_membership()`), que resuelve la fila sin
   volver a disparar RLS. Se corrigió en `salary_records_select`, `documents_select` y la
   política de Storage, que tenían el mismo patrón.
3. **Bug de mapeo de enum en el trigger de auditoría.** `TG_OP` da `'INSERT'/'UPDATE'/'DELETE'`
   pero el enum `audit_action` usa `'create'/'update'/'delete'` — `lower(TG_OP)::audit_action`
   fallaba para altas. Corregido con un `case` explícito.
4. **`create_person_with_initial_salary` es `security invoker`, no `definer`.** Solo
   garantiza atomicidad (alta + primer registro salarial en una transacción); las políticas
   RLS de `people` y `salary_records` se siguen aplicando con el rol de quien llama.
5. **Alta de organización vía `bootstrap_organization()` (security definer).** El primer
   registro de un usuario crea su organización y su membership `admin` en una sola función,
   sin necesitar políticas de INSERT abiertas en `organizations`/`memberships`.
6. **Zod + react-hook-form con `z.coerce`/`.transform()`.** `@hookform/resolvers` v5 exige que,
   si el esquema tiene un tipo de entrada distinto al de salida (coerción de número, transform
   de `''`→`undefined`), el formulario declare los tres genéricos de `useForm` (`TFieldValues`,
   `TContext`, `TTransformedValues` = `z.input`/`z.output`). Se eliminaron los `.transform()`
   innecesarios (los campos vacíos se normalizan a `null` en el repositorio, no en el esquema)
   y se aplicó el patrón de tres genéricos donde de verdad hace falta coerción (salario).
7. **shadcn/ui escrito a mano.** El registro `ui.shadcn.com` está bloqueado por la política de
   red de este entorno (proxy devuelve 403). Los componentes en `src/components/ui/` siguen
   el código fuente estándar de shadcn/ui (Radix + `class-variance-authority` + Tailwind v4),
   no son una reinvención — deberían poder sustituirse por `npx shadcn add <componente>` sin
   fricción en un entorno con acceso de red normal.
8. **`database.types.ts` escrito a mano.** `supabase gen types typescript` (incluso con
   `--db-url` contra un Postgres accesible) lanza un contenedor `postgres-meta`, y el pull de
   imágenes Docker también está bloqueado en este sandbox. El archivo se ha escrito reflejando
   exactamente el esquema de `supabase/migrations/`, con la misma forma que generaría el CLI.
   Ejecuta `npm run db:types` para regenerarlo en un entorno con Supabase real.

## Cómo se validó (importante: límites del entorno)

Este sandbox no tiene acceso a los registros de contenedores que usa `supabase start`
(Docker Hub / `public.ecr.aws` devuelven 403 vía el proxy de red configurado), así que no ha
sido posible levantar el stack completo de Supabase local (Postgres + GoTrue + Storage API +
Studio) para una prueba end-to-end con sesión de Auth real.

En su lugar:

- Se instaló Postgres 16 nativo (sin Docker) y se aplicaron las migraciones reales de
  `supabase/migrations/` tal cual, con un esquema `auth`/`storage` mínimo que imita lo que
  Supabase provee (`tests/integration/fixtures/auth_stub.sql`, reproducible con
  `npm run db:setup-test`).
- Contra ese Postgres real se ejecutó un smoke test manual y después la suite de integración
  (`tests/integration/people-rls.test.ts`, 3 tests) que verifica con SQL real: aislamiento
  entre organizaciones, alta con salario inicial, `salary_records` append-only (`UPDATE`/
  `DELETE` rechazados por permisos), y que un manager solo ve a su propio equipo. Estos tests
  encontraron los dos bugs de RLS/auditoría descritos arriba — no se detectaron leyendo el SQL.
- `npm run build` compila y tipa correctamente (Next.js 15, TypeScript estricto) y genera las
  rutas esperadas (`/login`, `/people`, `/people/new`, `/people/[personId]`,
  `/people/[personId]/edit`).
- Se arrancó el build de producción (`npm run start`) y se verificó por HTTP: `/login` renderiza
  el formulario completo (campos y textos correctos), y el middleware redirige correctamente
  `/` y `/people` a `/login?next=...` cuando no hay sesión.
- **No verificado**: el flujo real de registro/login contra Supabase Auth, la subida de
  documentos a Storage, y el recorrido completo en navegador de alta → ficha → edición → baja
  con datos reales. Esto requiere un proyecto Supabase accesible (local con Docker funcional,
  o en la nube) — recomendamos ejecutarlo antes de dar la iteración por verificada en el
  entorno real de desarrollo.

## Archivos principales

```
supabase/migrations/20260722*.sql          Esquema, RLS, funciones, storage (Personas)
src/shared/infrastructure/supabase/        Clientes (server, middleware), tipos, sesión actual
src/shared/domain/result.ts                Result<T, E> para casos de uso
src/features/auth/                         Login/registro + bootstrap de organización
src/features/people/
  domain/                                  Esquemas Zod, reglas puras, taxonomía de timeline
  application/                             Server Actions (alta, edición, baja, salario, notas, documentos)
  infrastructure/                          Repositorios tipados sobre Supabase
  ui/                                      Componentes de la feature
src/app/(auth)/login/                      Página de login
src/app/(app)/people/                      Listado, alta, ficha, edición
src/components/ui/                         Componentes shadcn/ui (escritos a mano)
src/components/layout/                    Sidebar y topbar
tests/unit/                                Reglas de dominio y esquemas Zod
tests/integration/                         RLS contra Postgres real
scripts/setup-test-db.sh                   Prepara la base de datos de pruebas
```

## Mejoras posibles (no bloqueantes para cerrar esta iteración)

- Extraer los formularios de creación/edición de persona a un único componente genérico si,
  al construir Objetivos/Desarrollo, aparece un tercer formulario con la misma necesidad de
  campos comunes — por ahora la duplicación entre `person-create-form` y `person-edit-form`
  es deliberada (formularios genuinamente distintos, ver nota de diseño en el propio código).
- `deleteDocument` borra primero la fila de base de datos y después el objeto de Storage; si
  falla el segundo paso queda un objeto huérfano en Storage (sin referencia en `documents`,
  nunca al revés). Aceptable para v1; una Edge Function de limpieza periódica lo resolvería.
- Añadir CI (GitHub Actions) que ejecute `npm run lint`, `npm run build` y `npm test` en cada
  PR — no se ha configurado en esta iteración porque no estaba en el alcance pedido.
