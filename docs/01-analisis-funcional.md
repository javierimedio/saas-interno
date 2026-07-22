# 1. Análisis funcional

## 1.1 Diagnóstico del sistema actual

El Excel + Word no falla por ser "viejo"; falla porque el modelo de datos que puede representar una hoja de cálculo es incompatible con lo que realmente necesitas gestionar:

| Síntoma en el Excel actual | Causa raíz | Consecuencia |
|---|---|---|
| Fórmulas que rompen al añadir una fila | No hay un esquema — cada celda es libre | Miedo a tocar el archivo, "helpers ocultos" como parche |
| El histórico salarial se pierde o se sobrescribe | Una celda solo puede tener un valor a la vez | No hay trazabilidad para decisiones futuras |
| La plantilla Word del 1:1 se rellena a mano | Documento y datos están desacoplados | El contenido de la reunión no alimenta el resto del sistema |
| Las acciones "viven" en una pestaña aparte | No hay relación real entre tablas | Se te olvidan acciones vencidas porque nadie te avisa |
| El dashboard es una foto fija que hay que refrescar | No hay cálculo en tiempo real | Decisiones tomadas con datos desactualizados |
| Solo puedes usarlo tú | El archivo vive en tu disco/OneDrive personal | No escala a más managers ni a la empresa |

**Conclusión de diseño**: no vamos a construir "un Excel con inputs bonitos". Vamos a construir un sistema donde las entidades (persona, reunión, acción, objetivo, salario) tienen relaciones reales, historial inmutable donde importa, y donde el dashboard es una consulta, no una copia.

## 1.2 Filosofía del producto

- **El 1:1 es un flujo, no un documento.** Preparar → reunir → registrar → generar acciones → cerrar. La plantilla Word desaparece porque cada paso de ese flujo ya está en la app.
- **Nada se sobrescribe si importa para auditoría.** Salario y estado del empleado son *ledgers* (histórico append-only), no campos editables.
- **Las acciones tienen vida propia.** Dejan de ser una lista y pasan a ser un flujo de trabajo con estado, prioridad y fecha límite, visibles desde el dashboard, la ficha de la persona y el propio 1:1 que las originó.
- **El dashboard es en tiempo real porque es una vista, no una copia.** Se calcula sobre las mismas tablas que todo lo demás.
- **La IA está en los puntos de decisión, no como un chat aparte.** Prepara la agenda antes de la reunión, resume después, detecta riesgos comparando con reuniones anteriores.
- **Multiusuario desde el primer día del esquema, aunque la UI sea de un solo usuario al principio.** Añadir el segundo manager no debe requerir migrar datos.
- **Menos pantallas, más contexto.** Inspiración Linear/Notion/Raycast: paleta de comandos, vistas densas pero limpias, cero "modo ERP" con 15 pestañas por fila.

## 1.3 Actores

| Rol | Descripción v1 | Alcance futuro |
|---|---|---|
| **Admin** | Configura la organización, departamentos, invita managers, ve todo | Gestión de política de la empresa, exportaciones globales |
| **Manager** | Gestiona a su equipo directo: personas, 1:1, acciones, objetivos, salarios | Rol que usarás tú desde el día 1 |
| **Empleado** (futuro) | Ve sus propios objetivos, acciones asignadas, y puede aportar comentarios a su 1:1 antes de la reunión | No se construye UI en v1, pero el modelo de datos y RLS ya lo contemplan |

En la Fase 1 tu usuario tendrá **ambos roles Admin + Manager** dentro de una única organización ("Marketing" o el nombre de la empresa).

## 1.4 Módulos funcionales

### 1.4.1 Dashboard

Centro de mando, no un informe. Debe responder en una sola pantalla: *¿qué necesita mi atención hoy?*

- **Personas activas** — conteo + variación respecto al mes anterior.
- **Próximos 1:1** — lista de los siguientes 5 en el tiempo, con acceso directo a "preparar reunión".
- **1:1 pendientes** — reuniones ya vencidas por fecha que no se marcaron como completadas (deuda de seguimiento).
- **Acciones abiertas / vencidas** — separadas visualmente (una acción vencida es una señal distinta de una simplemente abierta).
- **Cumplimiento de reuniones** — % de 1:1 completados vs. planificados en el periodo (mes/trimestre), por persona y agregado.
- **Objetivos** — distribución por estado (`on_track`, `at_risk`, `off_track`, `completed`) del periodo activo.
- **KPIs de equipo** — configurables: antigüedad media, ratio de rotación, próximas revisiones salariales pendientes.

Todo se computa server-side (Server Components) contra las tablas reales; no hay tabla "dashboard" ni caché manual. Los contadores que deben sentirse "vivos" (acciones vencidas, próximos 1:1) usan Supabase Realtime para actualizarse sin recargar.

### 1.4.2 Personas

Sustituye la fila del Excel maestro por una ficha viva.

Datos por persona:
- Identidad: nombre, email, teléfono, avatar.
- Laboral: puesto, departamento, responsable (manager), fecha de incorporación, estado (activo/baja/excedencia), tipo de contrato.
- Salario: **no es un campo**, es un histórico (ver 1.4.6).
- Notas privadas: visibles solo para el manager/admin que las escribe (nunca para el empleado, ni siquiera en el futuro modo autoservicio).
- Objetivos: lista con estado y % de cumplimiento (ver 1.4.5).
- Documentos: contrato, revisiones firmadas, certificados — Supabase Storage con control de acceso.
- Historial completo: timeline unificado de 1:1, acciones, cambios salariales y cambios de estado — construido a partir del `audit_log` y las tablas relacionadas, no como una tabla aparte que haya que mantener sincronizada.

Reglas de negocio:
- Una persona solo puede tener un manager directo activo a la vez (histórico de cambios de manager se conserva en `audit_log`).
- Dar de baja a una persona no borra nada; cambia `employment_status` y fija `termination_date`. Sigue siendo consultable en informes históricos.

### 1.4.3 One2One

El corazón del producto. Reemplaza la plantilla Word con un flujo de tres momentos sobre el **mismo registro**:

1. **Preparación** (antes de la reunión): agenda sugerida automáticamente a partir de: acciones abiertas de la persona, objetivos con checkpoint pendiente, y (Fase IA) un resumen generado del 1:1 anterior. El manager puede añadir/quitar puntos de agenda manualmente.
2. **En vivo** (durante la reunión): vista de una sola columna para tomar notas rápido, marcar puntos de agenda como tratados, valorar la reunión, y crear acciones sin salir de la pantalla.
3. **Cierre** (después): estado pasa a `completed`, se sugiere la fecha del próximo 1:1, y (Fase IA) se genera un resumen automático y una detección de riesgos.

Campos: fecha, responsable, empleado, estado (`scheduled`/`completed`/`cancelled`/`no_show`), agenda (items individuales, no un bloque de texto), comentarios del manager, comentarios del empleado (para cuando exista autoservicio), valoración, objetivos tratados (relación, no copia), acciones generadas (relación), próxima reunión sugerida.

Todo 1:1 completado es inmutable en sus campos de fondo (fecha real, agenda tratada); se puede añadir un comentario posterior pero no reescribir la historia — igual que no se debería poder "corregir" lo que se dijo en una reunión pasada.

### 1.4.4 Acciones

Ya no es una columna oculta del Excel: es un objeto con ciclo de vida propio, visible desde tres sitios (dashboard, ficha de persona, 1:1 de origen) porque es la misma fila, no una copia.

Campos: responsable (quien la creó/supervisa), empleado (a quien afecta), asignado (quien debe ejecutarla — puede ser el propio empleado o el manager), estado, prioridad, fecha de creación, fecha límite, comentarios (hilo, no un único campo de texto).

Estados: `Pendiente` → `En progreso` → `Completada`, con posibilidad de pasar a `Bloqueada` (requiere motivo) o `Cancelada` en cualquier punto antes de completarse.

Una acción vencida (fecha límite pasada y no completada) se marca visualmente distinta en todas las vistas donde aparece — es la señal de "deuda" que en el Excel dependía de que tú recordaras mirar.

### 1.4.5 Objetivos

Un empleado puede tener varios objetivos simultáneos, agrupados por periodo (trimestre/año), cada uno con:
- Título, descripción, categoría.
- % de cumplimiento — pero **como serie histórica de checkpoints**, no un único número que se pisa cada vez que se actualiza. Esto permite ver la evolución en el 1:1 ("en la reunión anterior estabas al 40%, ahora al 65%").
- Estado cualitativo (`on_track`/`at_risk`/`off_track`/`completed`/`cancelled`), independiente del %, porque un 90% de cumplimiento con fecha límite mañana puede seguir siendo `at_risk`.

Histórico anual: los objetivos se cierran al final del periodo y quedan consultables en el informe anual de la persona; no se borran ni se reciclan de un año a otro.

### 1.4.6 Revisiones salariales

Ledger append-only: cada revisión es una fila nueva con fecha de efecto, salario bruto anual, motivo (`alta`/`revisión`/`promoción`/`ajuste de mercado`/`corrección`), y quién la registró. **Nunca se actualiza ni se borra una fila existente** — a nivel de base de datos se revocan los permisos de `UPDATE`/`DELETE` sobre esta tabla; una corrección se registra como una nueva fila con motivo `corrección`, dejando explícito en el propio histórico que hubo un error y cuál fue la fórmula correcta.

El "salario actual" de una persona no es un campo: es una consulta (`última fila por fecha de efecto`).

### 1.4.7 Informes

Generación automática, no copiar-pegar en Word:
- **PDF del 1:1** — al cerrar una reunión, un botón genera el PDF con agenda, notas, valoración y acciones, listo para archivar o compartir si algún día hace falta.
- **Resumen** — vista condensada de un periodo (por persona o por equipo).
- **Histórico anual** — objetivos cerrados, revisiones salariales del año, cumplimiento de 1:1.
- **Informe completo del empleado** — el equivalente a "toda la ficha en PDF": útil para procesos de RRHH o offboarding.

Los informes se generan server-side (no captura de pantalla) a partir de los mismos datos que la UI, y quedan registrados en la tabla `reports` con enlace al archivo en Storage — de modo que "qué informe se generó y cuándo" también es auditable.

### 1.4.8 IA (módulo independiente)

Diseñado como un servicio desacoplado que consume las mismas tablas que el resto de la app, conectado vía una interfaz de proveedor (ver `02-arquitectura.md`), no como funciones sueltas repartidas por la UI.

Casos de uso v1 de IA (detallados en el roadmap, Fase 3):
1. **Resumen automático del 1:1** al cerrarlo.
2. **Detección de riesgos** — cruza valoración, tono de comentarios, acciones vencidas repetidas y evolución de objetivos para señalar a una persona como "a vigilar".
3. **Próximas acciones sugeridas** a partir de la agenda tratada.
4. **Evolución del empleado** — narrativa generada comparando checkpoints de objetivos y valoraciones de 1:1 a lo largo del tiempo.
5. **Comparación con reuniones anteriores** — qué cambió, qué se repite.
6. **Preparación automática de la siguiente reunión** — la agenda sugerida del punto 1.4.3 usa este servicio.

Toda llamada a IA queda registrada en `ai_interactions` (prompt, respuesta, modelo, tokens) para poder auditar coste y calidad, y para que el propio histórico de IA sea un dato más de la persona.

### 1.4.9 Notificaciones (transversal, no pedido explícitamente pero necesario)

Sin esto, el sistema vuelve a depender de que tú "te acuerdes de mirar el Excel". Notificaciones in-app (mínimo viable) para: 1:1 de mañana, acción vencida, checkpoint de objetivo pendiente. Email/Slack quedan como pregunta abierta (ver documento 00) para decidir si entran en v1 o en fase posterior.

## 1.5 Requisitos no funcionales

- **Multi-tenant real desde el esquema**: toda tabla de dominio cuelga de una `organization_id`; ver `03-modelo-datos.md`.
- **Seguridad por defecto**: Row Level Security activada en todas las tablas desde la primera migración — no hay una fase futura de "añadir seguridad".
- **Auditoría**: cualquier cambio sobre datos sensibles (salario, estado, manager) queda en `audit_log`.
- **Rendimiento**: consultas del dashboard indexadas para responder en el rango de una tabla de un equipo (decenas de personas hoy, cientos si escala a empresa) sin rediseño.
- **Accesibilidad**: componentes shadcn/ui ya cumplen buena parte de WCAG AA; se revisa contraste y navegación por teclado.
- **i18n**: v1 solo en español; se deja la puerta abierta (textos no hardcodeados en componentes de dominio) sin construir el sistema de traducción todavía.

## 1.6 Explícitamente fuera de alcance en v1

- UI de autoservicio para empleados (el rol existe en el modelo, no en las pantallas).
- Integraciones con Slack/calendario externo.
- Multi-organización real gestionada por ti (una sola organización, la tuya).
- Aprobaciones multinivel de revisiones salariales (queda como fila registrada, sin workflow de aprobación).
