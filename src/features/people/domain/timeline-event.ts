/**
 * docs/product-design/03-employee-profile.md §3.3: taxonomía de eventos de la Cronología.
 * Esta iteración solo alimenta los tipos que ya tienen datos reales (alta, cambios
 * auditados, revisiones salariales, documentos) — 1:1/acciones/objetivos se añaden cuando
 * existan sus propias verticales (docs/product-design/09-future-roadmap.md §9.1).
 */
export type PersonTimelineEventType =
  | 'hire'
  | 'status_change'
  | 'field_change'
  | 'salary_change'
  | 'working_hours_change'
  | 'document_added'
  | 'one_on_one'
  | 'action_created'
  | 'action_completed'

export type PersonTimelineEvent = {
  id: string
  type: PersonTimelineEventType
  occurredAt: string
  title: string
  detail?: string
}
