# 4. Dashboard — un asistente, no un cuadro de mando

## 4.1 El cambio de enfoque

Un KPI ("86% de cumplimiento de 1:1") describe el pasado. Una frase ("Hace 95 días que no hablas con Mario") **pide una decisión**. El dashboard v2 está construido casi enteramente sobre la segunda forma. Los números no desaparecen — dejan de ser lo primero que se lee.

La pantalla "Hoy" tiene dos modos, accesibles con un segmented control arriba (coste: 0 clics adicionales para el modo por defecto):

- **Para ti** (por defecto): insights personalizados sobre tu equipo, ordenados por urgencia.
- **Actividad**: el feed global de la empresa (§4.4).

## 4.2 Anatomía de una insight card

```
┌─────────────────────────────────────────────────────────┐
│ ● [severidad]  Hace 95 días que no hablas con Mario      │
│                Su último 1:1 fue el 14 de abril           │
│                                                            │
│   [ Programar 1:1 ]   [ Ver ficha ]        Posponer  ✕   │
└─────────────────────────────────────────────────────────┘
```

- **Frase en lenguaje natural**, no una etiqueta de campo — escrita para leerse una vez y entenderse.
- **Severidad codificada en forma** (barra lateral de color: rojo/ámbar/neutro/verde), nunca solo en texto.
- **Una acción primaria de un clic** que resuelve o avanza el insight (programar, revisar, aprobar).
- **Posponer / descartar** — un insight que no se actúa no debe insistir para siempre; posponer lo vuelve a mostrar pasado un tiempo razonable (por defecto 7 días), descartar lo oculta para ese ciclo.

## 4.3 Catálogo de insights (v1 del dashboard accionable)

| Insight | Tipo | Ejemplo de frase | Acción primaria |
|---|---|---|---|
| 1:1 sin realizar hace demasiado | Regla | "Hace 95 días que no hablas con Mario" | Programar 1:1 |
| Reuniones de hoy | Regla | "Hoy tienes 3 reuniones: Laura (10:00), Javier (12:00), Sara (16:30)" | Preparar / Ver agenda del día |
| Acciones vencidas | Regla | "Hay 2 acciones vencidas: feedback 360 (Sara), plan de mejora (Marcos)" | Ver acciones |
| Acción bloqueada sin movimiento | Regla + IA | "'Feedback 360' lleva 12 días bloqueada sin comentarios nuevos" | Ver acción / Comentar |
| Racha positiva | IA | "Elena lleva tres 1:1 consecutivos mejorando su valoración" | Ver ficha |
| Racha negativa / riesgo | IA | "La valoración de Mario ha bajado en las últimas dos reuniones" | Ver ficha (solo visible para manager) |
| Revisión salarial pendiente | Regla | "Laura no tiene revisión salarial desde hace 20 meses" | Ir a compensación |
| Objetivo a punto de vencer sin checkpoint reciente | Regla | "El objetivo de Javier vence en 5 días y no tiene checkpoint desde hace 3 semanas" | Ver objetivo |
| Aniversario / cumpleaños próximo | Regla | "Laura cumple años mañana" | — (informativo, baja severidad) |
| Nueva incorporación sin primer 1:1 | Regla | "Marcos lleva 15 días sin su primer 1:1" | Programar 1:1 |

**Reglas vs. IA**: los insights de regla (fechas, umbrales, conteos) son deterministas, baratos y siempre disponibles — se calculan en SQL, no dependen de una llamada a IA. Los insights de patrón ("racha mejorando", "riesgo por tendencia") requieren interpretación de series temporales y sí pasan por el módulo de IA (`08-ai-experience.md`), con menor frecuencia de recálculo (p. ej. una vez al día, no en cada carga de página) para controlar coste y latencia.

## 4.4 Feed de actividad global

Modo "Actividad" del Dashboard: un feed cronológico inverso de toda la organización, agrupado por día — la vista de conjunto que el Excel nunca pudo dar porque nadie tenía tiempo de mirar 40 filas a la vez.

```
Hoy
 · 3 One2One realizados (Laura, Javier, Sara)
 · 2 nuevas acciones creadas
 · 1 revisión salarial registrada (Laura Martín)
 · Mario ha completado el objetivo "Certificación AWS"

Ayer
 · 1 nueva incorporación: Elena Castro
 · Laura cumple años mañana

18 jul
 · 1 acción marcada como bloqueada
```

- Cada línea enlaza a la persona o entidad correspondiente (un clic).
- Filtrable por tipo de evento y por departamento (relevante ya en Fase 4 cuando haya más de un manager).
- Es la misma taxonomía de eventos que alimenta la Cronología de cada persona (`03-employee-profile.md` §3.3) — no es una tabla ni una lógica distinta, es la unión de todas las cronologías individuales ordenada por fecha.

## 4.5 Métricas (siguen existiendo, en segundo plano)

Los KPIs de la Fase 1 (personas activas, cumplimiento de 1:1, distribución de objetivos) no desaparecen: se mueven a una franja compacta y colapsable en la parte superior del modo "Para ti", o a una vista "Métricas" a un clic — siguen siendo útiles para una revisión mensual, pero dejan de competir por atención con lo accionable en el primer vistazo del día.

## 4.6 Panel de manager (adelanto)

El dashboard incluye un widget opcional y descartable "Tu liderazgo esta semana" con 1-2 observaciones sobre el propio manager (p. ej. "Has completado el 100% de tus 1:1 programados este mes" o "Sueles posponer los 1:1 con el equipo de Producción"). Es una superficie más de la capa de IA — se especifica junto con el resto de superficies de IA en `08-ai-experience.md` §8.5, para mantener toda la lógica de IA documentada en un único sitio.
