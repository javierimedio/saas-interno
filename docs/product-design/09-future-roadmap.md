# 9. Impacto en el roadmap y en la documentación de la Fase 1

Este rediseño no descarta la Fase 1 (`docs/01-analisis-funcional.md` a `docs/06-roadmap.md`) — la corrige de sitio y la amplía. Este documento deja explícito qué cambia, para aplicarlo en una pasada concreta **cuando todo el Product Design esté aprobado**, sin reescribir nada por adelantado ni tocar dos veces el mismo documento.

## 9.1 Qué documentos de la Fase 1 quedan pendientes de actualizar

| Documento | Cambio pendiente |
|---|---|
| `docs/01-analisis-funcional.md` | Reescribir la sección de módulos alrededor de Persona/Cronología en vez de One2One/Acciones como módulos separados; renombrar "Objetivos" a "Desarrollo" con su alcance ampliado |
| `docs/03-modelo-datos.md` | Añadir las tablas nuevas listadas en §9.2; añadir versión de plantilla a `one_on_ones`; añadir tipo de evento genérico si se opta por una vista materializada de timeline en vez de agregación en consulta |
| `docs/04-estructura-carpetas.md` | Nuevas features: `development` (sustituye/amplía `goals`), `calendar`, `templates`, `timeline` (posible módulo compartido si la agregación cronológica se extrae como servicio propio) |
| `docs/05-flujo-navegacion.md` | Sustituir el sitemap por el de `06-navigation.md` de esta fase |
| `docs/06-roadmap.md` | Reordenar fases según §9.3 de este documento |

No se tocan estos documentos ahora para evitar una segunda ronda de revisión antes de que el Product Design esté cerrado.

## 9.2 Extensiones necesarias al modelo de datos

Necesarias para que la Cronología (`03-employee-profile.md`), el Calendario (`06-navigation.md`) y Desarrollo (ver más abajo) sean reales y no solo maquetas:

| Tabla nueva | Propósito | Notas de diseño |
|---|---|---|
| `job_changes` | Histórico de cambios de puesto/departamento/manager | Append-only, igual que `salary_records` |
| `time_off` | Periodos de vacaciones/ausencia | Rango de fechas, tipo (vacaciones/baja médica/otro) |
| `holidays` | Festivos por organización/región | Fecha + ámbito (nacional/local) |
| `trainings` | Formación/cursos realizados o en curso | Título, proveedor, fecha, estado, certificado (enlaza a `documents`) |
| `feedback_entries` | Feedback puntual recibido (no ligado necesariamente a un 1:1) | Autor, texto, visibilidad |
| `evaluations` | Evaluaciones de desempeño formales | Periodo, resultado, evaluador |
| `competencies` + `person_competencies` | Catálogo de competencias y nivel por persona | Histórico de nivel, no solo el valor actual (mismo patrón que objetivos) |
| `career_plans` | Plan de carrera (puesto objetivo, hitos) | Ligado a `person_id`, con hitos como eventos de cronología al completarse |
| `one_on_one_templates` + `one_on_one_template_blocks` | Catálogo de plantillas y bloques por departamento | `one_on_ones` referencia la versión de plantilla usada |
| `reminders` | Recordatorios manuales del calendario | `person_id` opcional, fecha, texto |

Todas siguen las mismas convenciones ya fijadas en la Fase 1: `organization_id` en toda tabla, RLS desde la primera migración, histórico append-only donde el negocio lo exige (cambios de puesto y salario nunca se sobrescriben).

## 9.3 Cómo cambia el roadmap por fases

El roadmap de `docs/06-roadmap.md` asumía que Objetivos/Salario/Informes llegaban en la Fase 2 y la IA en la Fase 3. Con el rediseño, la Cronología y el Dashboard accionable son el producto — no pueden esperar a fases posteriores sin construir, de nuevo, "una app de 1:1 con una persona al lado".

| Fase | Cambio respecto al roadmap anterior |
|---|---|
| Fase 0 — Fundaciones | Sin cambios; se añade el esquema de §9.2 a la migración inicial en vez de dejarlo para después |
| Fase 1 — MVP | Ahora incluye la **ficha de persona completa con Cronología** (aunque con menos tipos de evento al principio: alta, 1:1, acciones, salario) y el **Dashboard accionable con insights de regla** desde el primer entregable — no un dashboard de KPIs seguido de un rediseño posterior |
| Fase 2 | Se renombra de "Objetivos, revisiones salariales e informes" a **"Desarrollo"**: objetivos, competencias, formación, plan de carrera, feedback, evaluaciones — como módulo relacionado, no como tablas sueltas. Incluye job_changes y su aparición en la Cronología |
| Fase 3 — IA | Sin cambio de posición, pero de alcance ampliado según `08-ai-experience.md`: además del resumen de 1:1, entran el Resumen ejecutivo de persona, los insights de patrón del dashboard y el panel "Tu liderazgo" |
| Fase 3.5 (nueva) | **Calendario** y **feed de actividad global** — dependen de que ya existan suficientes tipos de evento (Fase 2) para ser útiles, y del catálogo de insights (Fase 3) para el feed |
| Fase 4 — Multiusuario | Sin cambio de objetivo; se añade la gestión de **plantillas de 1:1 por departamento** aquí, porque solo aporta valor real cuando hay más de un equipo/departamento activo |
| Fase 5 — Escala a empresa completa | Sin cambios |

## 9.4 Qué se aprueba en esta fase

Checklist para cerrar el Product Design antes de retomar la construcción:

1. ¿La ficha de persona como página única con secciones ancladas (no pestañas de ruta) resuelve "entender el estado en 30 segundos", o prefieres otra distribución?
2. ¿El catálogo de bloques de plantilla de 1:1 (`02-user-experience.md` §2.4) cubre los departamentos que imaginas a futuro, o falta algún tipo de bloque?
3. ¿El catálogo de insights del dashboard (`04-dashboard.md` §4.3) es el correcto para empezar, o hay señales que hoy miras en el Excel y no están recogidas?
4. ¿Los riesgos de IA sobre una persona deben ser visibles solo para ti (manager/admin) incluso cuando más adelante haya más managers viendo el mismo equipo, o debe poder restringirse aún más (ej. solo el manager directo, nunca otro admin)?
5. ¿El orden de fases de §9.3 tiene sentido, o prefieres adelantar/retrasar Calendario, Desarrollo o el feed de actividad?

Cuando estas respuestas y los ocho documentos de `docs/product-design/` estén aprobados, se aplican los cambios de §9.1-§9.2 sobre los documentos de la Fase 1 y se retoma la construcción desde la Fase 0.
