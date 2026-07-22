import { describe, expect, it } from 'vitest'

import { buildPersonTimeline, groupTimelineByMonth } from '@/features/people/application/build-person-timeline'
import type { AuditLogRow } from '@/features/people/infrastructure/audit-log.repository'
import type { SalaryRecordRow } from '@/features/people/infrastructure/salary-records.repository'
import type { DocumentRow } from '@/features/people/infrastructure/documents.repository'

function auditRow(overrides: Partial<AuditLogRow>): AuditLogRow {
  return {
    id: 'audit-1',
    organization_id: 'org-1',
    actor_id: 'user-1',
    entity_type: 'people',
    entity_id: 'person-1',
    action: 'create',
    diff: {},
    created_at: '2026-01-01T10:00:00Z',
    ...overrides,
  }
}

function salaryRow(overrides: Partial<SalaryRecordRow>): SalaryRecordRow {
  return {
    id: 'salary-1',
    organization_id: 'org-1',
    person_id: 'person-1',
    effective_date: '2026-03-01',
    gross_annual_salary: 35000,
    currency: 'EUR',
    variable_comp: null,
    reason: 'review',
    notes: null,
    created_by: 'user-1',
    created_at: '2026-03-01T10:00:00Z',
    ...overrides,
  }
}

function documentRow(overrides: Partial<DocumentRow>): DocumentRow {
  return {
    id: 'doc-1',
    organization_id: 'org-1',
    person_id: 'person-1',
    uploaded_by: 'user-1',
    storage_path: 'org-1/person-1/file.pdf',
    file_name: 'contrato.pdf',
    mime_type: 'application/pdf',
    size_bytes: 1000,
    category: 'contract',
    created_at: '2026-02-01T10:00:00Z',
    ...overrides,
  }
}

describe('buildPersonTimeline', () => {
  it('convierte el alta (audit action=create) en un evento "hire"', () => {
    const events = buildPersonTimeline([auditRow({ action: 'create' })], [], [])
    expect(events).toHaveLength(1)
    expect(events[0].type).toBe('hire')
  })

  it('detecta un cambio de estado a baja como evento "status_change"', () => {
    const events = buildPersonTimeline(
      [
        auditRow({
          action: 'update',
          diff: { before: { employment_status: 'active' }, after: { employment_status: 'offboarded' } },
        }),
      ],
      [],
      [],
    )
    expect(events[0].type).toBe('status_change')
    expect(events[0].title).toContain('Baja')
  })

  it('trata un update sin cambio de estado como "field_change"', () => {
    const events = buildPersonTimeline(
      [
        auditRow({
          action: 'update',
          diff: { before: { position_title: 'Analista' }, after: { position_title: 'Growth Lead' } },
        }),
      ],
      [],
      [],
    )
    expect(events[0].type).toBe('field_change')
    expect(events[0].detail).toContain('puesto')
  })

  it('ordena todos los eventos de más reciente a más antiguo', () => {
    const events = buildPersonTimeline(
      [auditRow({ action: 'create', created_at: '2023-01-01T10:00:00Z' })],
      [salaryRow({ created_at: '2025-03-01T10:00:00Z' })],
      [documentRow({ created_at: '2024-02-01T10:00:00Z' })],
    )
    expect(events.map((e) => e.type)).toEqual(['salary_change', 'document_added', 'hire'])
  })
})

describe('groupTimelineByMonth', () => {
  it('agrupa eventos consecutivos del mismo mes', () => {
    const events = buildPersonTimeline(
      [],
      [
        salaryRow({ id: 's1', created_at: '2026-07-05T10:00:00Z' }),
        salaryRow({ id: 's2', created_at: '2026-07-01T10:00:00Z' }),
        salaryRow({ id: 's3', created_at: '2026-03-01T10:00:00Z' }),
      ],
      [],
    )
    const groups = groupTimelineByMonth(events)
    expect(groups).toHaveLength(2)
    expect(groups[0].events).toHaveLength(2)
    expect(groups[1].events).toHaveLength(1)
  })
})
