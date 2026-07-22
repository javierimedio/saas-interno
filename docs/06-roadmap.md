# 6. Roadmap por fases

Cada fase tiene un criterio de salida objetivo: no se pasa a la siguiente hasta que el anterior está en uso real, no solo "construido". El objetivo es que dejes de abrir el Excel lo antes posible, aunque sea con un alcance reducido.

## Fase 0 — Fundaciones (sin funcionalidad visible todavía)

**Objetivo**: que exista un esqueleto seguro sobre el que construir todo lo demás.

- Repositorio Next.js 15 + TypeScript + Tailwind + shadcn/ui.
- Proyecto Supabase, primera migración con el esquema completo de `03-modelo-datos.md` (sí, completo desde el principio — es más barato migrar un esquema vacío que uno con datos).
- RLS activo en todas las tablas desde el primer commit de esquema.
- Auth (email/password) + creación de tu organización + tu membership como `admin`+`manager`.
- CI (lint, typecheck) + despliegue en Vercel conectado al repo.

**Criterio de salida**: puedes iniciar sesión y ver un dashboard vacío en producción, con RLS verificado (un segundo usuario de prueba no ve tus datos).

## Fase 1 — MVP de reemplazo del Excel

**Objetivo**: dejar de abrir el Excel para lo básico.

- Módulo **Personas** completo (alta, ficha, listado, baja) con salario inicial obligatorio en el alta.
- Módulo **One2One**: programar, preparar (agenda manual, sin IA todavía), vista en vivo, cierre. Sin PDF todavía.
- Módulo **Acciones**: creación, kanban, estados, prioridad, fecha límite.
- **Dashboard** básico: personas activas, próximos 1:1, acciones abiertas/vencidas.

**Criterio de salida**: un ciclo completo de 1:1 real con tu equipo se hace en la app, de principio a fin, sin tocar Word.

## Fase 2 — Objetivos, revisiones salariales e informes

**Objetivo**: eliminar las fórmulas y el histórico manual del Excel.

- Módulo **Objetivos** con checkpoints históricos y estados cualitativos.
- Módulo **Revisiones salariales** append-only, con timeline en la ficha de persona.
- **Informes**: PDF del 1:1, resumen, histórico anual, informe completo del empleado.
- Notas privadas por persona.
- Documentos (Supabase Storage) en la ficha de persona.

**Criterio de salida**: puedes generar el informe anual de una persona sin abrir ningún Excel ni Word, y el histórico salarial es consultable sin depender de tu memoria de "qué celda pisé".

## Fase 3 — IA

**Objetivo**: que la IA reduzca el tiempo de preparación y seguimiento, no que sea una demo.

- Interfaz `AIProvider` + adaptador Anthropic.
- Resumen automático al cerrar un 1:1.
- Agenda sugerida en la preparación (acciones abiertas + objetivos pendientes + resumen anterior).
- Detección de riesgo (cruce de valoración, acciones vencidas repetidas, evolución de objetivos).
- Comparación con reuniones anteriores y narrativa de evolución del empleado.
- Registro de todo uso de IA en `ai_interactions` con coste (tokens).

**Criterio de salida**: al abrir "preparar reunión" para cualquier persona, la agenda sugerida ya aporta valor real (no genérico) sin edición manual previa.

## Fase 4 — Multiusuario y roles

**Objetivo**: que otro manager pueda usar la app sin que tú tengas que tocar el esquema.

- UI de invitación de miembros (`/settings/members`), asignación de rol Admin/Manager.
- Verificación exhaustiva de RLS con más de un manager real en la misma organización (aislamiento de equipos).
- Notificaciones (in-app como mínimo; email/Slack si la pregunta abierta correspondiente se resuelve que sí).
- Decisión de SSO (Google Workspace) si aplica, según respuesta a la pregunta abierta.

**Criterio de salida**: un segundo manager gestiona su propio equipo en la misma organización sin ver datos del tuyo, y viceversa.

## Fase 5 — Escala a empresa completa

**Objetivo**: preparar el salto de "herramienta de un departamento" a "herramienta de la empresa".

- Rol **Empleado** con UI de autoservicio (sus objetivos, sus acciones asignadas, comentarios previos a su propio 1:1).
- Jerarquía de managers (manager de managers) si la pregunta abierta correspondiente lo requiere.
- Posibles integraciones (calendario, Slack) evaluadas según necesidad real detectada en las fases anteriores.
- Revisión de rendimiento con volumen de empresa completa (cientos de personas) y ajuste de índices si hace falta.

**Criterio de salida**: la organización puede añadir un nuevo departamento con su propio manager sin intervención de desarrollo.

---

No se empieza a picar código de ninguna fase hasta que los documentos 1-6 y las preguntas abiertas de `00-resumen-ejecutivo.md` estén aprobados.
