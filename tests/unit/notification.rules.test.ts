import { describe, expect, it } from 'vitest'

import { buildNotifications } from '@/features/notifications/domain/notification.rules'

function person(overrides: Record<string, unknown> = {}) {
  return {
    id: 'p1',
    organization_id: 'org1',
    user_id: null,
    first_name: 'Ana',
    last_name: 'García',
    email: 'ana@test.local',
    phone: null,
    avatar_url: null,
    position_title: 'Growth Marketer',
    department_id: null,
    manager_id: null,
    hire_date: '2023-01-01',
    termination_date: null,
    employment_status: 'active',
    contract_type: 'indefinido',
    employee_code: null,
    birth_date: null,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    ...overrides,
  } as never
}

function salaryRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 's1',
    organization_id: 'org1',
    person_id: 'p1',
    effective_date: '2024-01-01',
    gross_annual_salary: 30000,
    currency: 'EUR',
    reason: 'hire',
    notes: null,
    created_by: null,
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  } as never
}

function action(overrides: Record<string, unknown> = {}) {
  return {
    id: 'a1',
    organization_id: 'org1',
    person_id: 'p1',
    assignee_id: 'p1',
    one_on_one_id: null,
    title: 'Revisar objetivos',
    description: null,
    status: 'pending',
    priority: 'medium',
    due_date: '2026-07-23',
    blocked_reason: null,
    completed_at: null,
    created_by: null,
    created_at: '2026-07-01T00:00:00Z',
    updated_at: '2026-07-01T00:00:00Z',
    ...overrides,
  } as never
}

function meeting(overrides: Record<string, unknown> = {}) {
  return {
    id: 'm1',
    organization_id: 'org1',
    person_id: 'p1',
    manager_id: null,
    scheduled_at: '2026-07-23T10:00:00Z',
    actual_started_at: null,
    actual_ended_at: null,
    status: 'scheduled',
    mode: 'video',
    manager_comments: null,
    employee_comments: null,
    overall_rating: null,
    next_meeting_suggested_at: null,
    created_by: null,
    created_at: '2026-07-01T00:00:00Z',
    updated_at: '2026-07-01T00:00:00Z',
    ...overrides,
  } as never
}

describe('buildNotifications', () => {
  it('genera una notificación de cumpleaños dentro de la ventana de 7 días', () => {
    const now = new Date('2026-07-23')
    const people = [person({ id: 'p1', birth_date: '1990-07-25' })]
    const result = buildNotifications({ people, salaryRecords: [], actions: [], meetingsTodayTomorrow: [] }, now)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ type: 'birthday', href: '/people/p1' })
  })

  it('no genera notificación de cumpleaños fuera de la ventana', () => {
    const now = new Date('2026-07-23')
    const people = [person({ id: 'p1', birth_date: '1990-12-25' })]
    const result = buildNotifications({ people, salaryRecords: [], actions: [], meetingsTodayTomorrow: [] }, now)
    expect(result).toHaveLength(0)
  })

  it('distingue un 1:1 de hoy de uno de mañana', () => {
    const now = new Date('2026-07-23T08:00:00Z')
    const people = [person({ id: 'p1' })]
    const meetings = [
      meeting({ id: 'm-today', scheduled_at: '2026-07-23T10:00:00Z' }),
      meeting({ id: 'm-tomorrow', scheduled_at: '2026-07-24T10:00:00Z' }),
      meeting({ id: 'm-later', scheduled_at: '2026-07-30T10:00:00Z' }),
    ]
    const result = buildNotifications({ people, salaryRecords: [], actions: [], meetingsTodayTomorrow: meetings }, now)
    const types = result.filter((n) => n.id.startsWith('one_on_one:')).map((n) => n.type)
    expect(types).toEqual(['one_on_one_today', 'one_on_one_tomorrow'])
  })

  it('separa acciones vencidas de acciones próximas a vencer', () => {
    const now = new Date('2026-07-23')
    const people = [person({ id: 'p1' })]
    const actions = [
      action({ id: 'overdue', due_date: '2026-07-20' }),
      action({ id: 'soon', due_date: '2026-07-25' }),
      action({ id: 'done', due_date: '2026-07-01', status: 'completed' }),
    ]
    const result = buildNotifications({ people, salaryRecords: [], actions, meetingsTodayTomorrow: [] }, now)
    expect(result.find((n) => n.id === 'action_overdue:overdue')?.type).toBe('action_overdue')
    expect(result.find((n) => n.id === 'action_due_soon:soon')?.type).toBe('action_due_soon')
    expect(result.some((n) => n.id.includes('done'))).toBe(false)
  })

  it('avisa de incorporaciones futuras dentro de los próximos 14 días', () => {
    const now = new Date('2026-07-23')
    const people = [person({ id: 'p1', hire_date: '2026-07-30' }), person({ id: 'p2', hire_date: '2026-09-01' })]
    const result = buildNotifications({ people, salaryRecords: [], actions: [], meetingsTodayTomorrow: [] }, now)
    expect(result.map((n) => n.id)).toEqual(['future_hire:p1'])
  })

  it('avisa de revisiones salariales próximas o vencidas', () => {
    const now = new Date('2026-07-23')
    const people = [person({ id: 'p1' })]
    const salaryRecords = [salaryRecord({ person_id: 'p1', effective_date: '2024-01-01' })]
    const result = buildNotifications({ people, salaryRecords, actions: [], meetingsTodayTomorrow: [] }, now)
    expect(result[0]).toMatchObject({ type: 'salary_review', id: 'salary_review:p1' })
  })

  it('ordena todas las notificaciones por fecha ascendente', () => {
    const now = new Date('2026-07-23')
    const people = [person({ id: 'p1', birth_date: '1990-07-25' })]
    const actions = [action({ id: 'overdue', due_date: '2026-07-20' })]
    const result = buildNotifications({ people, salaryRecords: [], actions, meetingsTodayTomorrow: [] }, now)
    const dates = result.map((n) => new Date(n.date).getTime())
    expect(dates).toEqual([...dates].sort((a, b) => a - b))
  })
})
