# 1. Visión de producto

## 1.1 El cambio de enfoque

La primera fase de diseño (`docs/01-analisis-funcional.md` a `docs/06-roadmap.md`) construyó una arquitectura sólida, pero organizada alrededor del proceso: *"una app para gestionar One2One, con personas, acciones y objetivos alrededor"*. Es un error sutil y es importante corregirlo ahora, no después de construir sobre el modelo equivocado.

| Antes (v1) | Ahora (v2) |
|---|---|
| El 1:1 es el objeto principal; la persona es un campo del 1:1 | La **persona** es el objeto principal; el 1:1 es el proceso que más la alimenta |
| La ficha de persona es una colección de pestañas con datos | La ficha de persona es una **línea temporal completa de su vida en la empresa** |
| El dashboard muestra indicadores | El dashboard **actúa como un asistente** que te dice qué hacer hoy |
| La IA resume reuniones | La IA está **tejida en cada pantalla** como una capa de interpretación, no una función aislada |
| Objetivos es un módulo | **Desarrollo** es el módulo: objetivos, competencias, formación, plan de carrera, feedback y evaluaciones, relacionados entre sí |

Esto no invalida la arquitectura ni el modelo de datos de la primera fase — los amplía. La sección 9 (`09-future-roadmap.md`) detalla exactamente qué documentos de la Fase 1 quedan pendientes de actualizar y no se tocan todavía, para no reescribir dos veces.

## 1.2 La idea central

> **Todo lo que ocurre en la empresa es un capítulo en la historia de una persona.**

Un 1:1, una acción, un cambio de salario, un curso, una vacación, un cambio de puesto: no son entidades sueltas que "también" se relacionan con una persona. Son **eventos de su timeline**. El producto entero puede describirse como: *un sistema de eventos, agrupados por persona, interpretados por IA, con el 1:1 como el proceso que genera más eventos de valor*.

Esto cambia decisiones de diseño concretas:
- La ficha de persona no es una pantalla con "datos" — es una narrativa cronológica con un resumen ejecutivo delante.
- El dashboard no pregunta "¿qué números quieres ver?" — pregunta "¿qué necesita tu atención hoy, y por qué?".
- La IA no es una función de "generar resumen" — es una lectora permanente de esa narrativa, en cada punto donde tomar una decisión se beneficia de contexto.

## 1.3 Qué NO es este producto

- No es un ERP de RRHH con 40 pantallas y permisos granulares para todo.
- No es un configurador de formularios genérico (los "bloques configurables" del 1:1 por departamento tienen límites deliberados — ver `06-navigation.md` §Plantillas).
- No es un chatbot de IA con la app alrededor — la IA no tiene una pantalla propia, vive dentro de las pantallas del producto.
- No es una base de datos de personas con un calendario pegado — el calendario, el feed de actividad y el dashboard son **lentes distintas sobre los mismos eventos**, no módulos independientes con su propia lógica.

## 1.4 Principios de producto (v2)

1. **Persona primero.** Cualquier pantalla nueva se justifica preguntando "¿a qué persona ayuda a entender o decidir mejor?". Si la respuesta es "a ninguna en particular", es una vista agregada (dashboard, calendario, feed), no un módulo de primer nivel.
2. **Timeline primero, formularios después.** Cuando haya duda entre mostrar un dato como campo estático o como evento cronológico, gana el evento cronológico — conserva contexto ("por qué cambió", "cuándo", "qué pasó justo antes").
3. **La IA interpreta, no decide.** Cada salida de IA es editable, descartable y visiblemente etiquetada como generada — nunca sustituye el juicio del manager, especialmente en señales de riesgo sobre una persona.
4. **Accionable antes que informativo.** Un número sin una acción asociada es ruido. "3 acciones vencidas" sin un botón para resolverlas es peor que no mostrarlo.
5. **El menor número de clics posible.** Cada flujo frecuente (preparar un 1:1, crear una acción, consultar el estado de una persona) tiene un presupuesto de clics explícito — ver `02-user-experience.md`.
6. **Configurable sin ser un ERP.** Las plantillias por departamento cambian el contenido de la reunión, nunca la estructura de datos ni el modelo de permisos.
7. **Nada se pierde.** Si algo pasó (una revisión salarial, un cambio de puesto, una valoración), queda en el timeline para siempre — ese es, literalmente, el sustituto del histórico que hoy vive disperso en pestañas de Excel.

## 1.5 Cómo sabremos que funciona

Métricas de producto que sustituyen a "cuántas features tiene":

- **Tiempo hasta entender el estado de una persona**: objetivo &lt;30 segundos desde que abres su ficha (ver `03-employee-profile.md`).
- **% de 1:1 que se preparan usando la agenda sugerida** en vez de agenda en blanco — mide si la IA aporta valor real, no decorativo.
- **Días desde el último 1:1 por persona**: debería tender a bajar con el uso del dashboard accionable, no mantenerse igual que con el Excel.
- **Clics para las 10 tareas más frecuentes**: no debe subir nunca en una nueva versión sin una justificación explícita.

## 1.6 Documentos de esta fase

| Documento | Resuelve |
|---|---|
| `02-user-experience.md` | Principios de interacción, presupuesto de clics, plantillas dinámicas del 1:1 |
| `03-employee-profile.md` | La ficha de persona y su timeline — el corazón del producto |
| `04-dashboard.md` | El dashboard como asistente accionable + feed de actividad global |
| `05-design-system.md` | Componentes, tokens, estados vacíos/carga/error — todo documentado |
| `06-navigation.md` | Sitemap completo, calendario, ajustes y plantillas por departamento |
| `07-wireframes-v2.md` | Wireframes de alta fidelidad de las pantallas rediseñadas |
| `08-ai-experience.md` | La IA como capa nativa en cada superficie del producto |
| `09-future-roadmap.md` | Qué cambia en el roadmap y en los documentos de la Fase 1 por este rediseño |

No se retoma el roadmap de construcción (`docs/06-roadmap.md`) hasta que estos ocho documentos estén aprobados.
