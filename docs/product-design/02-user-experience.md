# 2. Experiencia de usuario

## 2.1 Principios de interacción

Inspiración declarada: Linear (velocidad, teclado), Notion (páginas como unidad de información, no formularios), Raycast (todo alcanzable sin ratón), Vercel (densidad limpia, sin decoración).

1. **Todo es alcanzable con el teclado.** Paleta de comandos (`Cmd+K` / `Ctrl+K`) desde cualquier pantalla; atajos de una tecla para las acciones más frecuentes dentro de una vista (`c` crear acción, `1` ir a 1:1 de hoy).
2. **Página, no formulario.** La ficha de persona, un 1:1, un objetivo: se leen como una página (scroll vertical, secciones ancladas), no se navegan como un formulario con pestañas que hay que "encontrar".
3. **Densidad con aire.** Mucha información por pantalla (Linear/Vercel), pero con jerarquía tipográfica clara y espaciado consistente — nunca la sensación de tabla de Excel ni de ERP con 12 columnas apretadas.
4. **Progresividad.** Lo esencial siempre visible; el detalle a un clic o un scroll, nunca oculto detrás de una navegación de tres niveles.
5. **Cero modales para lectura.** Los modales se reservan para confirmaciones y creación rápida (crear acción, añadir revisión salarial); consultar información siempre es una página o un panel lateral, nunca un modal que tapa el contexto.
6. **Estados como parte del diseño, no como texto.** Un chip de color dice más rápido que una palabra: la forma (pill, franja de color, icono) transmite estado antes de que se lea el texto.

## 2.2 Presupuesto de clics

Tareas más frecuentes y su coste máximo aceptable, medido desde el Dashboard (`Hoy`):

| Tarea | Clics máx. | Cómo se logra |
|---|---|---|
| Ver el estado completo de una persona | 1 | Insight card del dashboard enlaza directo a la ficha; o `Cmd+K` → nombre → Enter |
| Preparar el próximo 1:1 de alguien | 1 | Botón "Preparar" en la tarjeta de "próximos 1:1" del dashboard |
| Crear una acción durante un 1:1 en vivo | 1 | Campo de creación rápida siempre visible en la vista "en vivo", sin abrir modal |
| Marcar un punto de agenda como tratado | 1 | Checkbox inline en la agenda, sin guardar explícito |
| Ver acciones vencidas de todo el equipo | 1 | Insight card del dashboard, o atajo `g a` (go to actions) filtra por vencidas |
| Añadir una revisión salarial | 2 | Ficha de persona → sección Compensación (ancla, no navegación) → botón "+ Añadir revisión" abre modal mínimo |
| Buscar cualquier persona/1:1/acción | 2 | `Cmd+K`, escribir, Enter |
| Generar el PDF de un 1:1 cerrado | 1 | Botón en la propia vista de cierre del 1:1 |

Este presupuesto es una restricción de diseño, no una aspiración: si una función nueva no cabe en su presupuesto, se rediseña el flujo, no se documenta como excepción.

## 2.3 Paleta de comandos — alcance

`Cmd+K` no es solo un buscador de personas. Cubre:
- **Navegar**: ir a cualquier persona, 1:1, acción, objetivo por nombre/título.
- **Crear**: "Nueva acción", "Nuevo objetivo", "Programar 1:1", "Añadir revisión salarial" — cada uno abre el formulario mínimo correspondiente.
- **Actuar**: "Preparar 1:1 de Laura", "Marcar acción X como completada" sin salir de donde estás.
- **Preguntar a la IA**: "Resume el estado de Mario", "¿Quién no ha tenido 1:1 en más de 60 días?" — una entrada de lenguaje natural que despacha a las mismas consultas/insights del dashboard (detalle en `08-ai-experience.md`).

## 2.4 Plantillas dinámicas del 1:1

El formulario del 1:1 no es fijo por dos motivos: (1) un 1:1 de Ventas y uno de IT no hablan de las mismas cosas, y (2) fijar la estructura en código es exactamente el problema que tenía la plantilla Word — cambiarla exigía editar un documento a mano para todo el mundo.

**Modelo**: una plantilla es una lista ordenada de **bloques**, asignable por departamento. Un bloque es un tipo con una intención fija pero contenido configurable:

| Tipo de bloque | Qué resuelve | Configurable |
|---|---|---|
| `agenda_abierta` | Lista de puntos libres (siempre presente por defecto) | Título de la sección |
| `seguimiento_objetivos` | Trae automáticamente los objetivos activos de la persona | Si se muestra o no |
| `seguimiento_acciones` | Trae automáticamente las acciones abiertas | Si se muestra o no |
| `pregunta_guiada` | Una pregunta fija que el manager debe responder cada vez (p. ej. "¿Riesgo de bajas por carga de trabajo?" en un equipo de Producción con turnos) | Texto de la pregunta, departamento(s) al que aplica |
| `checklist_especifica` | Lista de comprobación propia del departamento (p. ej. "Cumplimiento de normas de seguridad" en Producción) | Ítems de la checklist |
| `valoracion` | Escala de valoración de la reunión (siempre presente) | Etiquetas de la escala |
| `nota_ia` | Espacio para la preparación/resumen de IA (siempre presente) | — |

**Reglas de diseño**:
- Añadir o quitar un bloque de una plantilla **no reescribe reuniones pasadas** — cada 1:1 guarda una referencia a la versión de plantilla usada en ese momento (coherente con el principio "nada se sobrescribe" de la Fase 1).
- Un departamento sin plantilla propia usa la plantilla por defecto (agenda abierta + objetivos + acciones + valoración + nota IA) — no hace falta configurar nada para empezar a usar la app.
- Los bloques son un catálogo cerrado (la tabla de arriba), no un constructor de formularios libre — evita que esto derive en un configurador tipo ERP.
- La gestión de plantillas vive en Ajustes (`06-navigation.md` §Plantillas), un manager normal nunca necesita tocarla en el uso diario.

## 2.5 Estados de una interacción

Toda acción del usuario (guardar, crear, mover una tarjeta) sigue el mismo contrato visual, definido con detalle en `05-design-system.md`:

1. **Optimista cuando es seguro** (mover una tarjeta del kanban, marcar un checkbox) — el cambio se ve al instante, se revierte con un toast si falla el Server Action.
2. **Con confirmación cuando es difícil de deshacer** (cerrar un 1:1, dar de baja a una persona) — un solo paso de confirmación, nunca un asistente de varios pasos.
3. **Nunca un spinner de página completa** para una escritura — solo el control implicado (botón) entra en estado de carga.

## 2.6 Responsive

Uso principal en escritorio (es una herramienta de gestión, no una app de consumo), pero debe ser perfectamente usable desde el móvil para consultas rápidas antes de un 1:1 presencial:
- **Escritorio (&gt;1024px)**: layout de dos columnas en la ficha de persona (timeline + panel lateral), sidebar de navegación siempre visible.
- **Tablet (768–1024px)**: panel lateral de la ficha pasa a apilarse debajo del timeline; sidebar colapsa a iconos.
- **Móvil (&lt;768px)**: navegación inferior de 4 accesos (Hoy, Personas, 1:1, Más), la ficha de persona es una sola columna con la barra de "vitals" convertida en carrusel horizontal. El detalle responsive por pantalla se especifica en `07-wireframes-v2.md`.
