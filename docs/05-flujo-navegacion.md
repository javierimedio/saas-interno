# 5. Flujo de navegación

## 5.1 Sitemap

```mermaid
flowchart TD
    Login["/login"] --> App["Layout autenticado"]
    App --> Dashboard["/dashboard"]
    App --> People["/people"]
    People --> PersonDetail["/people/:id"]
    App --> Meetings["/one-on-ones"]
    Meetings --> MeetingDetail["/one-on-ones/:id\n(prep · en vivo · cierre)"]
    App --> Actions["/actions (kanban)"]
    App --> Goals["/goals"]
    App --> Reports["/reports"]
    App --> Settings["/settings"]
    Settings --> SettingsOrg["/settings/organization"]
    Settings --> SettingsMembers["/settings/members"]

    PersonDetail -.contiene.-> PD_Meetings["Tab: 1:1 de esta persona"]
    PersonDetail -.contiene.-> PD_Actions["Tab: Acciones"]
    PersonDetail -.contiene.-> PD_Goals["Tab: Objetivos"]
    PersonDetail -.contiene.-> PD_Salary["Tab: Histórico salarial"]
    PersonDetail -.contiene.-> PD_Docs["Tab: Documentos"]
    PersonDetail -.contiene.-> PD_History["Tab: Historial completo"]

    PD_Meetings -.enlaza.-> MeetingDetail
    PD_Actions -.enlaza.-> Actions
    Dashboard -.acceso directo.-> MeetingDetail
    Dashboard -.acceso directo.-> Actions
```

Navegación primaria: sidebar fija (estilo Linear) con Dashboard, Personas, 1:1, Acciones, Objetivos, Informes, Ajustes. Paleta de comandos (`Cmd+K`, estilo Raycast) para saltar a cualquier persona, 1:1 o acción sin pasar por el sidebar — importante porque en un equipo de tamaño mediano navegar por menús es más lento que buscar.

## 5.2 Flujo crítico: ciclo de vida de un 1:1

Este es el flujo que reemplaza por completo la plantilla Word.

```mermaid
sequenceDiagram
    actor M as Manager
    participant App
    participant DB as PostgreSQL
    participant IA as Módulo IA

    M->>App: Programa 1:1 (persona + fecha)
    App->>DB: insert one_on_ones (status=scheduled)

    Note over App,IA: Antes de la reunión
    M->>App: Abre "Preparar reunión"
    App->>DB: lee acciones abiertas, objetivos con checkpoint pendiente
    App->>IA: solicita resumen del 1:1 anterior + riesgos
    IA-->>App: agenda sugerida + puntos de atención
    M->>App: ajusta agenda manualmente

    Note over App: Durante la reunión
    M->>App: abre vista "en vivo"
    App->>DB: actual_started_at = now()
    M->>App: marca puntos tratados, toma notas, valora
    M->>App: crea acciones sobre la marcha
    App->>DB: insert actions (one_on_one_id = esta reunión)

    Note over App,IA: Cierre
    M->>App: cierra la reunión
    App->>DB: status=completed, actual_ended_at=now()
    App->>IA: genera resumen automático
    IA-->>App: ai_summary + próxima fecha sugerida
    App->>DB: update ai_summary, next_meeting_suggested_at
    App-->>M: ofrece "Generar PDF" y "Programar siguiente 1:1"
```

Puntos de diseño relevantes:
- La agenda sugerida se calcula, no se copia de la reunión anterior — así nunca queda desactualizada.
- Crear una acción durante la reunión no es un paso aparte: es un atajo dentro de la misma vista, con `one_on_one_id` ya rellenado.
- El resumen de IA es una propuesta editable, no un texto final — el manager siempre puede corregirlo antes de que quede en el histórico.

## 5.3 Flujo: acción vencida hasta resolución

```mermaid
stateDiagram-v2
    [*] --> Pendiente
    Pendiente --> EnProgreso
    Pendiente --> Bloqueada
    EnProgreso --> Bloqueada
    EnProgreso --> Completada
    Bloqueada --> EnProgreso
    Pendiente --> Cancelada
    EnProgreso --> Cancelada
    Bloqueada --> Cancelada
    Completada --> [*]
    Cancelada --> [*]

    note right of Pendiente
        Si due_date < hoy y el estado
        no es terminal, se muestra
        "vencida" en Dashboard, Kanban
        y ficha de la persona
        (misma fila, no una copia)
    end note
```

## 5.4 Flujo: alta de persona

```mermaid
flowchart LR
    A["Nueva persona"] --> B["Datos básicos + puesto + departamento"]
    B --> C["Asignar responsable"]
    C --> D["Registrar salario inicial\n(salary_records, reason=hire)"]
    D --> E["Persona activa en Dashboard y listados"]
    E -.opcional.-> F["Adjuntar contrato/documentos"]
```

No existe un "campo salario" que rellenar y ya está: el alta siempre crea la primera fila del histórico salarial, reforzando desde el primer uso que el salario es una serie temporal.

## 5.5 Flujo: revisión salarial

```mermaid
flowchart LR
    A["Ficha de persona → Histórico salarial"] --> B["Nueva revisión"]
    B --> C["Fecha de efecto + importe + motivo"]
    C --> D["Se añade fila nueva\n(la anterior permanece intacta)"]
    D --> E["Timeline de la persona refleja el cambio"]
```

No hay botón "editar" sobre una fila existente del histórico — solo "añadir revisión", incluso para corregir un error (motivo `corrección`).
