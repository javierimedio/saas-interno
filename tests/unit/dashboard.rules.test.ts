import { describe, expect, it } from 'vitest'

import {
  averageSalary,
  averageTenureYears,
  calculateAnnualPayroll,
  cumulativeSalaryIncrease,
  departmentDistribution,
  futureHires,
  groupActionsByUrgency,
  initialSalaryByPerson,
  latestSalaryByPerson,
  latestWorkingHoursByPerson,
  medianSalary,
  nextBirthdayDate,
  recentHires,
  salaryIncreaseByPerson,
  upcomingBirthdays,
  upcomingSalaryReviews,
} from '@/features/dashboard/domain/dashboard.rules'

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

describe('latestSalaryByPerson', () => {
  it('se queda con el registro más reciente por persona', () => {
    const records = [
      salaryRecord({ id: 's1', person_id: 'p1', effective_date: '2023-01-01', gross_annual_salary: 25000 }),
      salaryRecord({ id: 's2', person_id: 'p1', effective_date: '2024-06-01', gross_annual_salary: 30000 }),
    ]
    const map = latestSalaryByPerson(records)
    expect(map.get('p1')?.gross_annual_salary).toBe(30000)
  })
})

describe('calculateAnnualPayroll', () => {
  it('suma el último salario de cada persona activa', () => {
    const people = [person({ id: 'p1' }), person({ id: 'p2' })]
    const latest = new Map([
      ['p1', salaryRecord({ person_id: 'p1', gross_annual_salary: 30000 })],
      ['p2', salaryRecord({ person_id: 'p2', gross_annual_salary: 40000 })],
    ])
    expect(calculateAnnualPayroll(people, latest as never)).toBe(70000)
  })
})

describe('averageTenureYears', () => {
  it('calcula la media en años', () => {
    const now = new Date('2026-01-01')
    const people = [person({ hire_date: '2024-01-01' }), person({ hire_date: '2022-01-01' })]
    expect(averageTenureYears(people, now)).toBeCloseTo(3, 0)
  })
})

describe('nextBirthdayDate', () => {
  it('devuelve este año si el cumpleaños no ha pasado', () => {
    const next = nextBirthdayDate('1990-12-25', new Date('2026-07-23'))
    expect(next.getFullYear()).toBe(2026)
    expect(next.getMonth()).toBe(11)
  })

  it('devuelve el año siguiente si el cumpleaños ya pasó', () => {
    const next = nextBirthdayDate('1990-01-10', new Date('2026-07-23'))
    expect(next.getFullYear()).toBe(2027)
  })
})

describe('upcomingBirthdays', () => {
  it('filtra por ventana de días y ordena por proximidad', () => {
    const now = new Date('2026-07-23')
    const people = [
      person({ id: 'p1', birth_date: '1990-08-01' }), // 9 días
      person({ id: 'p2', birth_date: '1990-12-25' }), // fuera de ventana de 30
      person({ id: 'p3', birth_date: '1990-07-25' }), // 2 días
    ]
    const result = upcomingBirthdays(people, now, 30)
    expect(result.map((b) => b.person.id)).toEqual(['p3', 'p1'])
  })
})

describe('upcomingSalaryReviews', () => {
  it('incluye personas próximas al umbral y las ordena de más a menos urgente', () => {
    const now = new Date('2026-07-23')
    const people = [person({ id: 'p1' }), person({ id: 'p2' })]
    const latest = new Map([
      ['p1', salaryRecord({ person_id: 'p1', effective_date: '2024-01-01' })], // ~30 meses
      ['p2', salaryRecord({ person_id: 'p2', effective_date: '2026-06-01' })], // ~1.7 meses
    ])
    const result = upcomingSalaryReviews(people, latest as never, now, 18, 2)
    expect(result.map((r) => r.person.id)).toEqual(['p1'])
  })
})

describe('groupActionsByUrgency', () => {
  it('clasifica acciones abiertas en vencidas, hoy y esta semana', () => {
    const now = new Date('2026-07-23')
    const actions = [
      { id: 'a1', status: 'pending', due_date: '2026-07-20' },
      { id: 'a2', status: 'pending', due_date: '2026-07-23' },
      { id: 'a3', status: 'pending', due_date: '2026-07-27' },
      { id: 'a4', status: 'completed', due_date: '2026-07-01' },
    ] as never
    const result = groupActionsByUrgency(actions, now)
    expect(result.overdue.map((a) => a.id)).toEqual(['a1'])
    expect(result.dueToday.map((a) => a.id)).toEqual(['a2'])
    expect(result.dueThisWeek.map((a) => a.id)).toEqual(['a3'])
  })
})

describe('recentHires / futureHires', () => {
  it('separa altas recientes de incorporaciones futuras', () => {
    const now = new Date('2026-07-23')
    const people = [
      person({ id: 'p1', hire_date: '2026-07-10' }), // reciente
      person({ id: 'p2', hire_date: '2026-08-01' }), // futura
      person({ id: 'p3', hire_date: '2020-01-01' }), // antigua
    ]
    expect(recentHires(people, now, 30).map((p) => p.id)).toEqual(['p1'])
    expect(futureHires(people, now).map((p) => p.id)).toEqual(['p2'])
  })
})

describe('departmentDistribution', () => {
  it('cuenta las personas activas por departamento, de mayor a menor', () => {
    const people = [
      person({ id: 'p1', department_id: 'd1' }),
      person({ id: 'p2', department_id: 'd1' }),
      person({ id: 'p3', department_id: 'd2' }),
      person({ id: 'p4', department_id: null }),
    ]
    const departmentNameById = new Map([
      ['d1', 'Diseño gráfico'],
      ['d2', 'Marketing'],
    ])
    expect(departmentDistribution(people, departmentNameById)).toEqual([
      { departmentName: 'Diseño gráfico', count: 2 },
      { departmentName: 'Marketing', count: 1 },
      { departmentName: 'Sin departamento', count: 1 },
    ])
  })
})

describe('initialSalaryByPerson', () => {
  it('se queda con el primer registro por persona (el más antiguo)', () => {
    const records = [
      salaryRecord({ id: 's1', person_id: 'p1', effective_date: '2024-01-01', gross_annual_salary: 20000 }),
      salaryRecord({ id: 's2', person_id: 'p1', effective_date: '2025-01-01', gross_annual_salary: 22000 }),
    ]
    const map = initialSalaryByPerson(records)
    expect(map.get('p1')?.gross_annual_salary).toBe(20000)
  })
})

describe('salaryIncreaseByPerson / cumulativeSalaryIncrease', () => {
  it('calcula el incremento de cada persona respecto a su salario inicial y lo suma', () => {
    const people = [person({ id: 'p1' }), person({ id: 'p2' })]
    const records = [
      salaryRecord({ id: 's1', person_id: 'p1', effective_date: '2024-01-01', gross_annual_salary: 20000 }),
      salaryRecord({ id: 's2', person_id: 'p1', effective_date: '2025-01-01', gross_annual_salary: 22000 }),
      salaryRecord({ id: 's3', person_id: 'p2', effective_date: '2024-01-01', gross_annual_salary: 30000 }),
    ]
    const latest = latestSalaryByPerson(records)
    const initial = initialSalaryByPerson(records)

    const increases = salaryIncreaseByPerson(people, latest, initial)
    expect(increases).toEqual([{ person: people[0], increase: 2000 }])
    expect(cumulativeSalaryIncrease(increases)).toBe(2000)
  })
})

describe('averageSalary / medianSalary', () => {
  it('calcula la media y la mediana del último salario de cada persona activa', () => {
    const people = [person({ id: 'p1' }), person({ id: 'p2' }), person({ id: 'p3' })]
    const latest = new Map([
      ['p1', salaryRecord({ person_id: 'p1', gross_annual_salary: 20000 })],
      ['p2', salaryRecord({ person_id: 'p2', gross_annual_salary: 30000 })],
      ['p3', salaryRecord({ person_id: 'p3', gross_annual_salary: 40000 })],
    ])
    expect(averageSalary(people, latest as never)).toBe(30000)
    expect(medianSalary(people, latest as never)).toBe(30000)
  })

  it('promedia entre los dos centrales cuando hay un número par de salarios', () => {
    const people = [person({ id: 'p1' }), person({ id: 'p2' })]
    const latest = new Map([
      ['p1', salaryRecord({ person_id: 'p1', gross_annual_salary: 20000 })],
      ['p2', salaryRecord({ person_id: 'p2', gross_annual_salary: 30000 })],
    ])
    expect(medianSalary(people, latest as never)).toBe(25000)
  })

  it('devuelve 0 cuando nadie tiene salario registrado', () => {
    const people = [person({ id: 'p1' })]
    expect(averageSalary(people, new Map())).toBe(0)
    expect(medianSalary(people, new Map())).toBe(0)
  })
})

describe('latestWorkingHoursByPerson', () => {
  it('se queda con el registro más reciente por persona', () => {
    const records = [
      { id: 'w1', person_id: 'p1', effective_date: '2018-02-22', weekly_hours: 40 },
      { id: 'w2', person_id: 'p1', effective_date: '2026-09-07', weekly_hours: 30 },
    ] as never
    const map = latestWorkingHoursByPerson(records)
    expect(map.get('p1')?.weekly_hours).toBe(30)
  })
})
