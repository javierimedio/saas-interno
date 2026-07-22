# 4. Estructura de carpetas

Feature-based, con una separación explícita entre dominio, aplicación, infraestructura e IA (ver `02-arquitectura.md`). Nada de código en esta fase — esto describe el esqueleto que se creará al iniciar la Fase 0 del roadmap.

```
saas-interno/
├── docs/                              # Esta documentación de diseño
├── supabase/
│   ├── migrations/                    # Una migración por cambio de esquema, versionada
│   └── config.toml
│
├── src/
│   ├── app/                           # Next.js App Router — solo orquestación de página
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (app)/                     # Layout autenticado con sidebar/nav
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── people/
│   │   │   │   ├── page.tsx           # Listado
│   │   │   │   └── [personId]/page.tsx# Ficha individual
│   │   │   ├── one-on-ones/
│   │   │   │   ├── page.tsx           # Calendario/lista
│   │   │   │   └── [meetingId]/page.tsx
│   │   │   ├── actions/page.tsx       # Kanban
│   │   │   ├── goals/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   └── settings/
│   │   │       ├── organization/page.tsx
│   │   │       └── members/page.tsx
│   │   └── api/
│   │       └── ai/
│   │           ├── summarize/route.ts
│   │           ├── suggest-actions/route.ts
│   │           └── prepare-meeting/route.ts
│   │
│   ├── features/                      # Un módulo por dominio funcional
│   │   ├── people/
│   │   │   ├── domain/                # Tipos, zod schemas, reglas puras
│   │   │   │   ├── person.schema.ts
│   │   │   │   └── person.rules.ts
│   │   │   ├── application/           # Casos de uso / Server Actions
│   │   │   │   ├── create-person.action.ts
│   │   │   │   ├── update-person.action.ts
│   │   │   │   └── offboard-person.action.ts
│   │   │   ├── infrastructure/        # Repositorio Supabase de esta feature
│   │   │   │   └── people.repository.ts
│   │   │   └── ui/                    # Componentes específicos de esta feature
│   │   │       ├── people-table.tsx
│   │   │       ├── person-detail-tabs.tsx
│   │   │       └── person-form.tsx
│   │   │
│   │   ├── one-on-ones/
│   │   │   ├── domain/
│   │   │   │   ├── one-on-one.schema.ts
│   │   │   │   └── agenda.rules.ts     # lógica de agenda sugerida (sin IA)
│   │   │   ├── application/
│   │   │   │   ├── schedule-meeting.action.ts
│   │   │   │   ├── close-meeting.action.ts
│   │   │   │   └── add-agenda-item.action.ts
│   │   │   ├── infrastructure/
│   │   │   │   └── one-on-ones.repository.ts
│   │   │   └── ui/
│   │   │       ├── meeting-prep-view.tsx
│   │   │       ├── meeting-live-view.tsx
│   │   │       └── meeting-timeline.tsx
│   │   │
│   │   ├── actions/
│   │   │   ├── domain/
│   │   │   │   ├── action.schema.ts
│   │   │   │   └── action.rules.ts     # p.ej. isOverdue()
│   │   │   ├── application/
│   │   │   │   ├── create-action.action.ts
│   │   │   │   └── change-action-status.action.ts
│   │   │   ├── infrastructure/
│   │   │   │   └── actions.repository.ts
│   │   │   └── ui/
│   │   │       ├── actions-kanban.tsx  # Client Component, drag & drop
│   │   │       └── action-card.tsx
│   │   │
│   │   ├── goals/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── infrastructure/
│   │   │   └── ui/
│   │   │
│   │   ├── salary-reviews/
│   │   │   ├── domain/
│   │   │   ├── application/            # registrar revisión — nunca update/delete
│   │   │   ├── infrastructure/
│   │   │   └── ui/
│   │   │
│   │   ├── reports/
│   │   │   ├── domain/
│   │   │   ├── application/            # generación de PDF vía servicio
│   │   │   ├── infrastructure/
│   │   │   └── ui/
│   │   │
│   │   ├── dashboard/
│   │   │   ├── application/            # agregaciones de solo lectura
│   │   │   └── ui/
│   │   │
│   │   └── organization/               # departamentos, memberships, roles
│   │       ├── domain/
│   │       ├── application/
│   │       ├── infrastructure/
│   │       └── ui/
│   │
│   ├── ai/                            # Módulo de IA, independiente de features/
│   │   ├── provider.interface.ts      # AIProvider: summarize(), detectRisk(), suggestActions()...
│   │   ├── providers/
│   │   │   └── anthropic.provider.ts
│   │   ├── use-cases/
│   │   │   ├── summarize-one-on-one.ts
│   │   │   ├── detect-risk.ts
│   │   │   ├── suggest-next-actions.ts
│   │   │   └── prepare-next-meeting.ts
│   │   └── ai-interactions.repository.ts
│   │
│   ├── shared/
│   │   ├── domain/                    # tipos comunes (Result, Pagination...)
│   │   ├── infrastructure/
│   │   │   ├── supabase/
│   │   │   │   ├── server-client.ts   # cliente con JWT de sesión (RSC/Server Actions)
│   │   │   │   └── admin-client.ts    # service_role — solo Edge Functions/cron
│   │   │   └── storage/
│   │   └── ui/                        # wrappers de shadcn/ui, layout primitives
│   │
│   └── components/
│       └── ui/                        # shadcn/ui generado (no se edita a mano salvo tokens)
│
├── supabase/functions/                 # Edge Functions
│   ├── daily-reminders/
│   └── nightly-ai-digest/
│
├── tests/
│   ├── unit/                          # dominio, sin red
│   ├── integration/                   # infraestructura contra Supabase local
│   └── e2e/                           # Playwright: flujos críticos
│
└── tailwind.config.ts
```

## Reglas de dependencia entre carpetas

- `domain/` no importa nada de `infrastructure/`, `ui/` ni de Next.js/React.
- `application/` (Server Actions) es el único lugar que orquesta `domain/` + `infrastructure/` + `ai/`.
- `ui/` solo llama a `application/` (Server Actions) o lee vía Server Components que usan `infrastructure/` directamente para lecturas simples.
- `ai/` no depende de ninguna `features/*`; son las features las que dependen de `ai/` cuando necesitan una capacidad de IA (dirección de dependencia inversa a lo que parecería natural, y deliberada: así la IA se puede extraer a un servicio propio en el futuro sin tocar `features/`).
