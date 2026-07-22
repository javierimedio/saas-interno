# Nexo — People Ops para managers

> Nombre de trabajo: **Nexo**. Es un placeholder para poder referirnos al producto durante el diseño; se puede renombrar sin coste antes de escribir la primera línea de código.

Este documento es el índice de la fase de diseño. Antes de programar nada, entregamos siete documentos que deben aprobarse (o corregirse) en conjunto:

| # | Documento | Contenido |
|---|-----------|-----------|
| 1 | [`01-analisis-funcional.md`](./01-analisis-funcional.md) | Qué problema resolvemos, principios de diseño, módulos y reglas de negocio |
| 2 | [`02-arquitectura.md`](./02-arquitectura.md) | Capas, stack, decisiones técnicas y su justificación |
| 3 | [`03-modelo-datos.md`](./03-modelo-datos.md) | Esquema PostgreSQL completo: tablas, relaciones, índices, RLS |
| 4 | [`04-estructura-carpetas.md`](./04-estructura-carpetas.md) | Organización del repositorio Next.js (feature-based) |
| 5 | [`05-flujo-navegacion.md`](./05-flujo-navegacion.md) | Sitemap y flujos de usuario críticos |
| 6 | [`06-roadmap.md`](./06-roadmap.md) | Fases de construcción, alcance y criterios de salida de cada una |
| 7 | [Wireframes](https://claude.ai/code/artifact/c36beaab-03d5-4c5f-98d0-a5ac85237abe) | Artifact visual de baja fidelidad con las 8 pantallas clave, para validar layout antes de maquetar en shadcn/ui |

## Cómo leer esto

No es una traducción del Excel a formularios web. Cada módulo se ha rediseñado partiendo de la pregunta *"¿cómo se haría esto si no hubiera existido nunca una hoja de cálculo?"* — el resultado son flujos de trabajo (preparar reunión → reunión en vivo → acciones → seguimiento) en vez de una fila más en una tabla.

## Decisión de alcance para la v1

Un solo usuario (tú, como responsable de Marketing) gestionando su equipo directo. La arquitectura multi-tenant, RLS y roles (Admin/Manager/Empleado) se construyen **desde el primer commit**, no se añaden después — es mucho más barato modelarlo ahora que migrar datos y políticas más adelante. Esto no significa construir pantallas para roles que no existen todavía; significa que el esquema de datos y las políticas de seguridad ya soportan multiusuario aunque la UI de invitar managers llegue en la Fase 4.

## Preguntas abiertas antes de aprobar el diseño

Estas decisiones cambian el modelo de datos o el roadmap, así que conviene cerrarlas antes de picar código:

1. **Dominio de correo / SSO**: ¿los managers futuros usarán Google Workspace corporativo? Si sí, activamos OAuth de Google en Supabase Auth desde la Fase 1 en vez de solo email/password.
2. **Moneda**: ¿todo el equipo cobra en EUR o hay contratos en otras divisas (remoto internacional)? Afecta a `salary_records`.
3. **Jerarquía de managers**: ¿tu equipo tiene subresponsables (managers de managers) o es un único nivel responsable→empleado? Afecta a cómo se resuelve la visibilidad en RLS.
4. **Autoservicio del empleado**: ¿los empleados verán *algo* de la app en la Fase 2-3 (p. ej. sus propios objetivos) o el rol "Empleado" queda para cuando la empresa lo adopte más ampliamente?
5. **Proveedor de IA**: ¿Anthropic (Claude) como proveedor por defecto? El diseño es agnóstico de proveedor, pero hay que fijar uno para las estimaciones de coste.
6. **Notificaciones**: ¿basta con notificaciones dentro de la app, o desde el principio quieres también email (o Slack) para recordatorios de 1:1 y acciones vencidas?

Cuando estas respuestas y los siete documentos estén aprobados, empezamos a construir por fases (ver `06-roadmap.md`).
