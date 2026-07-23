import type { AuditLogRow } from '../infrastructure/audit-log.repository'
import type { SalaryRecordRow } from '../infrastructure/salary-records.repository'
import type { DocumentRow } from '../infrastructure/documents.repository'
import type { PersonTimelineEvent } from '../domain/timeline-event'
import type { OneOnOneRow } from '@/features/one-on-ones/infrastructure/one-on-ones.repository'
import type { ActionRow } from '@/features/actions/infrastructure/actions.repository'

const FIELD_LABELS: Record<string, string> = {
  position_title: 'puesto',
  department_id: 'departamento',
  manager_id: 'responsable',
  contract_type: 'tipo de contrato',
  first_name: 'nombre',
  last_name: 'apellidos',
  email: 'email',
  phone: 'teléfono',
}

const SALARY_REASON_LABELS: Record<string, string> = {
  hire: 'Salario inicial',
  review: 'Revisión salarial',
  promotion: 'Cambio salarial por promoción',
  market_adjustment: 'Ajuste de mercado',
  correction: 'Corrección de una revisión anterior',
}

function auditEventFromPeopleRow(row: AuditLogRow): PersonTimelineEvent {
  if (row.action === 'create') {
    return { id: row.id, type: 'hire', occurredAt: row.created_at, title: 'Alta en la empresa' }
  }

  const diff = row.diff as { before?: Record<string, unknown>; after?: Record<string, unknown> } | null
  const before = diff?.before ?? {}
  const after = diff?.after ?? {}

  if (before.employment_status !== after.employment_status && after.employment_status) {
    const label = after.employment_status === 'offboarded' ? 'Baja registrada' : 'Cambio de estado laboral'
    return { id: row.id, type: 'status_change', occurredAt: row.created_at, title: label }
  }

  const changedFields = Object.keys(FIELD_LABELS).filter((key) => before[key] !== after[key] && key in after)
  const detail = changedFields.length > 0 ? `Cambios en: ${changedFields.map((f) => FIELD_LABELS[f]).join(', ')}` : undefined

  return { id: row.id, type: 'field_change', occurredAt: row.created_at, title: 'Datos actualizados', detail }
}

function eventFromSalaryRecord(row: SalaryRecordRow): PersonTimelineEvent {
  return {
    id: row.id,
    type: 'salary_change',
    occurredAt: row.created_at,
    title: SALARY_REASON_LABELS[row.reason] ?? 'Revisión salarial',
    detail: `${row.gross_annual_salary.toLocaleString('es-ES')} ${row.currency} / año`,
  }
}

function eventFromDocument(row: DocumentRow): PersonTimelineEvent {
  return {
    id: row.id,
    type: 'document_added',
    occurredAt: row.created_at,
    title: 'Documento añadido',
    detail: row.file_name,
  }
}

function eventFromMeeting(row: OneOnOneRow): PersonTimelineEvent | null {
  if (row.status !== 'completed' || !row.actual_ended_at) return null
  return {
    id: row.id,
    type: 'one_on_one',
    occurredAt: row.actual_ended_at,
    title: 'One2One realizado',
    detail: row.overall_rating ? `Valoración ${row.overall_rating}/5` : undefined,
  }
}

function eventsFromAction(row: ActionRow): PersonTimelineEvent[] {
  const events: PersonTimelineEvent[] = [
    { id: `${row.id}-created`, type: 'action_created', occurredAt: row.created_at, title: `Acción creada: ${row.title}` },
  ]
  if (row.status === 'completed' && row.completed_at) {
    events.push({
      id: `${row.id}-completed`,
      type: 'action_completed',
      occurredAt: row.completed_at,
      title: `Acción completada: ${row.title}`,
    })
  }
  return events
}

export function buildPersonTimeline(
  auditRows: AuditLogRow[],
  salaryRows: SalaryRecordRow[],
  documentRows: DocumentRow[],
  meetingRows: OneOnOneRow[] = [],
  actionRows: ActionRow[] = [],
): PersonTimelineEvent[] {
  const events = [
    ...auditRows.map(auditEventFromPeopleRow),
    ...salaryRows.map(eventFromSalaryRecord),
    ...documentRows.map(eventFromDocument),
    ...meetingRows.map(eventFromMeeting).filter((e): e is PersonTimelineEvent => e !== null),
    ...actionRows.flatMap(eventsFromAction),
  ]

  return events.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
}

const MONTH_FORMATTER = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' })

export function groupTimelineByMonth(events: PersonTimelineEvent[]): { label: string; events: PersonTimelineEvent[] }[] {
  const groups: { label: string; events: PersonTimelineEvent[] }[] = []

  for (const event of events) {
    const label = capitalize(MONTH_FORMATTER.format(new Date(event.occurredAt)))
    const lastGroup = groups[groups.length - 1]
    if (lastGroup && lastGroup.label === label) {
      lastGroup.events.push(event)
    } else {
      groups.push({ label, events: [event] })
    }
  }

  return groups
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
