# 5. Design System

Base técnica: shadcn/ui + Tailwind (según el stack obligatorio). Este documento fija las decisiones de diseño *sobre* esa base — tokens, componentes específicos del dominio (timeline, insight card, kanban card) y las reglas de estados que shadcn no decide por sí solo.

## 5.1 Tokens

### Color

Paleta validada ya en los wireframes de la Fase 1, adoptada aquí como fuente formal de tokens (claro / oscuro):

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--bg` | `#F5F6F8` | `#15181C` | Fondo de página |
| `--surface` | `#FFFFFF` | `#1C2025` | Tarjetas, paneles |
| `--surface-sunken` | `#FBFBFC` | `#191C20` | Barras, cabeceras de tabla |
| `--text` | `#1B1F23` | `#ECEEF1` | Texto principal |
| `--text-muted` | `#5B6470` | `#96A0AA` | Texto secundario |
| `--text-faint` | `#939BA5` | `#656F79` | Metadatos, timestamps |
| `--border` | `#E2E5EA` | `#2B3036` | Separadores |
| `--accent` | `#1F6F78` (teal) | `#4FB4B8` | Acción primaria, foco |
| `--accent-soft` | `#DCEAE6` | `rgba(79,180,184,.14)` | Fondos de estado activo/seleccionado |

Semántica — **independiente del acento**, nunca se reutiliza para decoración:

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--success` | `#2E7D4F` | `#5FBE86` | Completado, on-track, mejora |
| `--warning` | `#A8720B` | `#E0AF3E` | Requiere atención pronto |
| `--danger` | `#C0392B` | `#E5675A` | Vencido, riesgo, bloqueado |

### Tipografía

- Familia: stack del sistema (`ui-sans-serif`, sin fuente web incrustada) — coherente con una herramienta de uso intensivo donde la velocidad de carga importa más que una personalidad tipográfica fuerte.
- Escala: `11 / 12.5 / 14 / 15 / 18 / 21 / 26px`, pesos `400` (cuerpo), `600` (énfasis), `650` (títulos de sección/cifras clave).
- Datos numéricos siempre con `font-variant-numeric: tabular-nums` (cifras del dashboard, tablas, ledger salarial).
- Metadatos e identificadores (fechas cortas, IDs, rutas) en `ui-monospace`.

### Espaciado y forma

- Escala de espaciado en base 4px (`4/8/12/16/20/24/32/48`).
- Radio de esquina: `6px` en controles pequeños (chips, botones), `9-10px` en tarjetas y paneles — nunca `rounded-full` salvo en avatares y pills de estado.
- Sombra única (`--shadow`) reservada a tarjetas flotantes (menús, popovers, modales) — las tarjetas de contenido en línea usan borde, no sombra, para evitar la estética "todo flota" que cansa en pantallas densas.

## 5.2 Componentes

Para cada componente: propósito, anatomía, estados obligatorios.

### Botón
- Variantes: primario (`--accent`, fondo sólido), secundario/ghost (borde, sin fondo), destructivo (`--danger`, reservado a acciones irreversibles con confirmación).
- Estados: default, hover (oscurece 6%), focus (anillo de foco visible, 2px, offset), disabled (opacidad 40%, cursor not-allowed), loading (spinner de 14px sustituye el icono, texto permanece).
- Nunca deshabilitado sin explicación visible cerca (tooltip o texto auxiliar) — un botón gris sin motivo es la fuente número uno de confusión en herramientas internas.

### Input / Select / Textarea
- Borde `--border-strong` en reposo, `--accent` en foco con anillo suave.
- Estado de error: borde `--danger` + mensaje de error específico debajo (ver §5.4), nunca solo el borde en rojo.
- Autocompletado de personas (usado en selects de responsable/asignado): avatar + nombre + puesto, con búsqueda difusa.

### Card
- Contenedor base de casi todo (insight card, kpi, kanban card, resumen IA). Borde `--border`, fondo `--surface`, radio `9-10px`, padding `12-20px` según densidad.
- Variante "acento lateral" (franja de 3px a la izquierda) para comunicar severidad/prioridad sin depender solo del texto — usada en insight cards y tarjetas de kanban.

### Pill / Badge de estado
- Fondo `-soft` + texto del color semántico correspondiente (nunca texto blanco sobre color saturado — cansa en listas largas).
- Un único pill por estado, nunca dos pills compitiendo por la misma información (p. ej. no mostrar "activo" y un punto verde redundante a la vez).

### Avatar
- Iniciales sobre `--accent-soft` cuando no hay foto. Tamaños fijos: `20px` (inline en filas/tarjetas), `26px` (listas), `44px` (cabecera de ficha).

### Tabla
- Cabecera en mayúsculas pequeñas, `--text-faint`, sin fondo saturado.
- Fila con hover sutil (`--surface-sunken`), nunca zebra-striping (añade ruido visual sin aportar jerarquía).
- Contenedor con `overflow-x: auto` propio — la página nunca scrollea en horizontal por una tabla ancha.

### Timeline (componente de dominio)
- Nodo = icono + color por tipo de evento (tabla de taxonomía en `03-employee-profile.md`), conectado por una línea vertical fina (`--border`).
- Agrupación por mes con separador tipográfico (`eyebrow` + línea), no una tarjeta contenedora por grupo (evita anidar tarjetas dentro de tarjetas).
- Evento expandible inline: clic revela contenido adicional con una transición de altura suave (200ms), sin recargar ni navegar.
- Denso por defecto (una línea por evento); expandido muestra el detalle completo.

### Kanban card (Acciones)
- Franja de color por prioridad (baja/media/alta/urgente), título, avatar del asignado, fecha límite — en rojo y negrita si está vencida.
- Arrastre con estado optimista; si el Server Action falla, la tarjeta vuelve a su columna con un toast de error explicando el motivo.

### Insight card
- Especificada en detalle en `04-dashboard.md` §4.2 — se documenta aquí como componente reutilizable: franja de severidad, frase, 1 acción primaria, acción secundaria de posponer/descartar.

### Command palette (`Cmd+K`)
- Overlay centrado, campo de búsqueda con foco automático, resultados agrupados por tipo (Personas / Acciones / Comandos / Preguntar a la IA).
- Navegación completa por teclado (flechas + Enter), cierre con `Esc`.

### Modal
- Reservado a: confirmaciones irreversibles y formularios de creación rápida de 1-3 campos (crear acción, añadir revisión salarial). Nunca para navegar contenido existente (eso es una página o una sección anclada).
- Cierre con `Esc` y clic fuera, salvo cuando hay cambios sin guardar (entonces pide confirmación de descarte).

### Panel lateral (drawer)
- Usado para detalle rápido sin perder el contexto de la lista (p. ej. previsualizar una persona desde el listado sin navegar). Se cierra con `Esc` o clic fuera; nunca oculta más del 40% del ancho en escritorio.

### Filtros
- Chips de un clic para los filtros más comunes (estado, departamento, tipo de evento) antes que un panel de filtros avanzados — el panel avanzado existe pero es secundario, no la primera opción visible.

## 5.3 Estados vacíos

Cada estado vacío tiene tres partes: qué falta, por qué es normal (si aplica), y una acción para resolverlo. Nunca un simple "No hay datos".

| Contexto | Texto | Acción |
|---|---|---|
| Persona sin 1:1 todavía | "Aún no hay 1:1 con esta persona" | Programar el primero |
| Cronología vacía (alta reciente) | "La historia de {nombre} empieza aquí" | — |
| Sin acciones abiertas | "Sin acciones pendientes — buen momento para revisar objetivos" | Ver objetivos |
| Resumen de IA sin historial suficiente | "Aún no hay suficiente historial para un resumen fiable" | Recordatorio de cuándo aparecerá (tras el primer 1:1) |
| Dashboard sin insights | "Todo al día — no hay nada que requiera tu atención ahora mismo" | — |

## 5.4 Errores

- **En línea, junto al campo**, nunca solo en un toast genérico para errores de validación de formulario.
- Redactados desde lo que el usuario hizo, no desde la implementación: "La fecha límite no puede ser anterior a hoy", nunca "Error 422: constraint violation".
- Errores de servidor (Server Action falla): toast con el motivo si se conoce ("No se pudo guardar: sesión caducada, vuelve a iniciar sesión") y una acción de reintentar cuando aplica.

## 5.5 Carga

- **Skeleton screens** (bloques grises con la forma del contenido final) para cargas de página/sección — nunca un spinner centrado a pantalla completa.
- **Spinner inline pequeño** solo dentro de un control que está procesando una acción puntual (botón "Guardando…").
- Ninguna carga bloquea la interacción con el resto de la página salvo que sea estrictamente necesario (p. ej. nunca bloquear el sidebar mientras carga el contenido de una sección).
