# 8. Experiencia de IA

## 8.1 Principio rector

La IA no tiene pantalla propia. No hay un "asistente" al que preguntarle aparte de la app — hay una capa de interpretación presente en cada superficie donde interpretar datos ayuda a decidir mejor. La arquitectura desacoplada (`docs/02-arquitectura.md` §2.3, interfaz `AIProvider`) ya lo permite; este documento especifica **dónde aparece, qué dice y cómo se comporta** en cada superficie.

Contrato común a toda salida de IA en el producto:
1. **Etiquetada siempre** ("Generado por IA · actualizado hace 3 h").
2. **Editable siempre** que se muestre como texto persistente (resumen, recomendación).
3. **Descartable** cuando se muestra como sugerencia puntual (insight, próxima acción sugerida).
4. **Nunca es la única fuente de una decisión sensible** — señales de riesgo son un punto de partida para el juicio del manager, no una etiqueta objetiva sobre la persona.
5. **Registrada** en `ai_interactions` (prompt, respuesta, modelo, tokens) — todo uso de IA es auditable y su coste es visible.
6. **Con salida de emergencia**: si el proveedor de IA falla o no hay historial suficiente, la superficie muestra el estado vacío correspondiente (`05-design-system.md` §5.3), nunca un error crudo ni un hueco en blanco.

## 8.2 Persona (ficha de empleado)

Ya especificado en `03-employee-profile.md` §3.2 — el Resumen ejecutivo con sus cinco bloques (resumen, evolución, fortalezas, riesgos, recomendaciones). Detalles de comportamiento:

- **Recalculado automáticamente** tras cada 1:1 cerrado (evento que dispara la generación, vía Edge Function asíncrona — no bloquea el cierre de la reunión para el manager).
- **Riesgos** es el único bloque con visibilidad restringida (manager directo + Admin) — nunca visible si en el futuro la persona tiene acceso de autoservicio.
- Las **recomendaciones** son accionables: cada una tiene un botón "Convertir en acción" que crea una fila en `actions` con el texto ya redactado, editable antes de guardar.

## 8.3 Dashboard

- Insights de patrón (rachas, tendencias, riesgo) listados en `04-dashboard.md` §4.3 — recalculados con una cadencia diaria (batch, Edge Function programada), no en cada carga de la página, para mantener coste y latencia predecibles.
- Los insights de regla (fechas, conteos) **no usan IA** — son consultas SQL directas; la IA se reserva para lo que una consulta no puede expresar (interpretación de series, comparación cualitativa).

## 8.4 One2One

Cuatro momentos, todos ya introducidos en `docs/05-flujo-navegacion.md` §5.2, especificados aquí con detalle de contenido:

| Momento | Qué genera la IA | Input |
|---|---|---|
| Preparación | Agenda sugerida + puntos de atención | Acciones abiertas, objetivos con checkpoint pendiente, resumen del 1:1 anterior |
| Durante (opcional) | Nada automático — la IA no escribe mientras el manager toma notas, para no distraer | — |
| Cierre | Resumen automático de lo tratado | Notas de la reunión, agenda marcada como tratada |
| Cierre | Próximos temas sugeridos para el siguiente 1:1 | Puntos de agenda no tratados, compromisos abiertos |
| Cierre | Compromisos detectados | Notas libres del manager — la IA extrae frases con forma de compromiso ("quedamos en...") y las propone como acciones, no las crea directamente |
| Cierre | Evolución respecto a reuniones anteriores | Serie de valoraciones y resúmenes anteriores de esta misma persona |

Todo lo generado en el cierre queda en el campo `ai_summary` del propio 1:1 (modelo de datos ya definido) — es texto editable antes de que el 1:1 se marque como cerrado definitivamente.

## 8.5 Acciones

- **Acciones estancadas**: una acción "en progreso" o "bloqueada" sin comentarios ni cambios de estado en más de N días se marca como estancada — combina una regla simple (antigüedad del último cambio) con una lectura de IA del último comentario para sugerir *por qué* podría estar parada (p. ej. "Parece esperar una respuesta de otra persona, no del asignado").
- **Posibles bloqueos**: al crear una acción, si existen acciones similares ya bloqueadas en el pasado (mismo tipo/persona), la IA sugiere de forma no intrusiva ("Una acción parecida se bloqueó por falta de tiempo — ¿fijamos una fecha más realista?").

## 8.6 Manager — panel "Tu liderazgo"

Superficie nueva de este rediseño: la IA también observa el patrón del propio manager, no solo el de cada empleado.

- **Recomendaciones de liderazgo**: p. ej. "Sueles posponer los 1:1 con el equipo de Producción — llevan de media 12 días de retraso sobre lo programado".
- **Equilibrio seguimiento/desarrollo**: proporción entre 1:1 centrados en seguimiento operativo (acciones, bloqueos) frente a desarrollo (objetivos, carrera, formación) a lo largo del tiempo, con una observación si un equipo lleva mucho tiempo solo en modo operativo.
- Vive como widget descartable en el Dashboard (`04-dashboard.md` §4.6) — nunca invasivo, nunca obligatorio de leer.
- Mismo contrato de confianza que el resto: editable en el sentido de que se puede marcar "no es útil" y ajustar su frecuencia, nunca prescriptivo en tono ("deberías...") sino descriptivo ("sueles...").

## 8.7 Coste y control

- Cada capacidad de IA tiene una cadencia definida (§8.2-§8.6) para evitar llamadas redundantes: on-demand (preparación de 1:1, resumen al cierre — disparadas por una acción explícita del usuario) vs. batch diario (insights de patrón, panel de liderazgo).
- `ai_interactions.tokens_used` permite construir, en una fase posterior, un panel de coste de IA por organización — no se construye en v1 pero el dato ya se registra desde el primer uso.
- El adaptador (`AIProvider`) es sustituible sin tocar ninguna de las superficies descritas — un cambio de proveedor es una decisión de infraestructura, no de producto.
