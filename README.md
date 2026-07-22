# Nexo

Plataforma de gestión de personas y One2One para equipos internos. Ver `docs/` para el diseño
completo (análisis funcional, arquitectura, modelo de datos, product design).

Estado actual: **Iteración 1 — Personas**, completa. Ver `docs/dev/01-personas.md` para el
detalle técnico de esta iteración.

## Stack

Next.js 15 (App Router) · TypeScript · TailwindCSS · shadcn/ui · Supabase (PostgreSQL, Auth,
Storage) · Zod · React Hook Form · Vitest.

## Puesta en marcha

### 1. Proyecto Supabase

Necesitas un proyecto Supabase (local con Docker, o en la nube) con las migraciones de
`supabase/migrations/` aplicadas:

```bash
npx supabase start        # levanta Postgres + Auth + Storage local (requiere Docker)
npx supabase db reset      # aplica las migraciones
npx supabase status        # imprime la URL y las claves para .env.local
```

> Si tu entorno no tiene acceso a los registros de Docker (por ejemplo, un sandbox con red
> restringida), puedes validar el esquema y las políticas RLS contra un Postgres nativo sin
> Supabase local con `./scripts/setup-test-db.sh` — ver `docs/dev/01-personas.md` para el
> detalle de esta alternativa y sus límites (no incluye Auth/Storage reales).

### 2. Variables de entorno

```bash
cp .env.example .env.local
# rellena NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY con los valores de `supabase status`
```

### 3. Dependencias y arranque

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). El primer usuario que se registre desde
`/login` crea su propia organización automáticamente.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (incluye type-check) |
| `npm run lint` | ESLint |
| `npm test` | Tests unitarios + de integración (Vitest) |
| `npm run db:setup-test` | Prepara una base de datos de pruebas nativa para los tests de integración de RLS |
| `npm run db:types` | Regenera `database.types.ts` desde un proyecto Supabase real |

## Estructura

Ver `docs/04-estructura-carpetas.md` para el detalle de la organización feature-based
(`src/features/<feature>/{domain,application,infrastructure,ui}`).
