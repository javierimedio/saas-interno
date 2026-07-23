import { describe, expect, it } from 'vitest'

import { buildPeopleListRows, filterPeopleListRows, sortPeopleListRows } from '@/features/people/domain/people-list.rules'

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

function workingHoursRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: 'w1',
    organization_id: 'org1',
    person_id: 'p1',
    effective_date: '2024-01-01',
    weekly_hours: 40,
    working_percentage: null,
    reason: 'Jornada inicial',
    notes: null,
    created_by: null,
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  } as never
}

const now = new Date('2026-07-23')

describe('buildPeopleListRows', () => {
  it('enriquece cada persona con departamento, responsable, salario, jornada y antigüedad', () => {
    const people = [person({ id: 'p1', department_id: 'd1', manager_id: 'm1', hire_date: '2024-01-01' })]
    const latestSalary = new Map([['p1', salaryRecord({ person_id: 'p1', gross_annual_salary: 28000 })]])
    const latestHours = new Map([['p1', workingHoursRecord({ person_id: 'p1', weekly_hours: 30 })]])
    const departmentNameById = new Map([['d1', 'Diseño gráfico']])
    const managerNameById = new Map([['m1', 'Laura Martín']])

    const [row] = buildPeopleListRows(people, latestSalary as never, latestHours as never, departmentNameById, managerNameById, now)

    expect(row.departmentName).toBe('Diseño gráfico')
    expect(row.managerName).toBe('Laura Martín')
    expect(row.latestSalary?.gross_annual_salary).toBe(28000)
    expect(row.latestWorkingHours?.weekly_hours).toBe(30)
    expect(row.tenureMonths).toBe(30) // 2024-01-01 -> 2026-07-23 = 2a 6m
  })
})

describe('filterPeopleListRows', () => {
  const rows = buildPeopleListRows(
    [
      person({ id: 'p1', first_name: 'Ana', department_id: 'd1', manager_id: 'm1', hire_date: '2020-01-01' }),
      person({ id: 'p2', first_name: 'Bea', department_id: 'd2', manager_id: 'm2', hire_date: '2025-01-01' }),
    ],
    new Map([
      ['p1', salaryRecord({ person_id: 'p1', gross_annual_salary: 25000 })],
      ['p2', salaryRecord({ person_id: 'p2', gross_annual_salary: 45000 })],
    ]) as never,
    new Map([
      ['p1', workingHoursRecord({ person_id: 'p1', weekly_hours: 40 })],
      ['p2', workingHoursRecord({ person_id: 'p2', weekly_hours: 25 })],
    ]) as never,
    new Map([
      ['d1', 'Diseño gráfico'],
      ['d2', 'Marketing'],
    ]),
    new Map(),
    now,
  )

  it('filtra por búsqueda de texto', () => {
    expect(filterPeopleListRows(rows, { q: 'bea' }).map((r) => r.person.id)).toEqual(['p2'])
  })

  it('filtra por departamento', () => {
    expect(filterPeopleListRows(rows, { departmentId: 'd2' }).map((r) => r.person.id)).toEqual(['p2'])
  })

  it('filtra por rango salarial', () => {
    expect(filterPeopleListRows(rows, { minSalary: 30000 }).map((r) => r.person.id)).toEqual(['p2'])
    expect(filterPeopleListRows(rows, { maxSalary: 30000 }).map((r) => r.person.id)).toEqual(['p1'])
  })

  it('filtra por tipo de jornada', () => {
    expect(filterPeopleListRows(rows, { jornada: 'completa' }).map((r) => r.person.id)).toEqual(['p1'])
    expect(filterPeopleListRows(rows, { jornada: 'reducida' }).map((r) => r.person.id)).toEqual(['p2'])
  })

  it('filtra por antigüedad mínima en años', () => {
    expect(filterPeopleListRows(rows, { minTenureYears: 5 }).map((r) => r.person.id)).toEqual(['p1'])
  })
})

describe('sortPeopleListRows', () => {
  const rows = buildPeopleListRows(
    [person({ id: 'p1', first_name: 'Bea' }), person({ id: 'p2', first_name: 'Ana' })],
    new Map([
      ['p1', salaryRecord({ person_id: 'p1', gross_annual_salary: 45000 })],
      ['p2', salaryRecord({ person_id: 'p2', gross_annual_salary: 25000 })],
    ]) as never,
    new Map(),
    new Map(),
    new Map(),
    now,
  )

  it('ordena por nombre ascendente por defecto', () => {
    expect(sortPeopleListRows(rows, 'name', 'asc').map((r) => r.person.id)).toEqual(['p2', 'p1'])
  })

  it('ordena por salario descendente', () => {
    expect(sortPeopleListRows(rows, 'salary', 'desc').map((r) => r.person.id)).toEqual(['p1', 'p2'])
  })
})
