import { tenureInMonths, workingHoursLabel } from './person.rules'
import type { PersonRow } from '../infrastructure/people.repository'
import type { SalaryRecordRow } from '../infrastructure/salary-records.repository'
import type { WorkingHoursRecordRow } from '../infrastructure/working-hours-records.repository'

export type PersonListRow = {
  person: PersonRow
  departmentName?: string
  managerName?: string
  latestSalary?: SalaryRecordRow
  latestWorkingHours?: WorkingHoursRecordRow
  tenureMonths: number
}

/** Enriquece cada persona con los datos derivados que necesita el listado (sin filtrar ni ordenar). */
export function buildPeopleListRows(
  people: PersonRow[],
  latestSalaryByPerson: Map<string, SalaryRecordRow>,
  latestWorkingHoursByPerson: Map<string, WorkingHoursRecordRow>,
  departmentNameById: Map<string, string>,
  managerNameById: Map<string, string>,
  referenceDate: Date,
): PersonListRow[] {
  return people.map((person) => ({
    person,
    departmentName: person.department_id ? departmentNameById.get(person.department_id) : undefined,
    managerName: person.manager_id ? managerNameById.get(person.manager_id) : undefined,
    latestSalary: latestSalaryByPerson.get(person.id),
    latestWorkingHours: latestWorkingHoursByPerson.get(person.id),
    tenureMonths: tenureInMonths(person.hire_date, referenceDate, person.termination_date),
  }))
}

export type PeopleListQuery = {
  q?: string
  departmentId?: string
  status?: string
  managerId?: string
  minSalary?: number
  maxSalary?: number
  jornada?: 'completa' | 'reducida'
  minTenureYears?: number
  maxTenureYears?: number
}

function matchesQuery(row: PersonListRow, q: string): boolean {
  const term = q.trim().toLowerCase()
  const haystack = [row.person.first_name, row.person.last_name, row.person.email, row.person.position_title, row.person.employee_code ?? '']
    .join(' ')
    .toLowerCase()
  return haystack.includes(term)
}

/** Aplica todos los filtros del listado de personas (búsqueda + los ya existentes + los nuevos). */
export function filterPeopleListRows(rows: PersonListRow[], query: PeopleListQuery): PersonListRow[] {
  return rows.filter((row) => {
    if (query.q && !matchesQuery(row, query.q)) return false
    if (query.departmentId && row.person.department_id !== query.departmentId) return false
    if (query.status && row.person.employment_status !== query.status) return false
    if (query.managerId && row.person.manager_id !== query.managerId) return false

    if (query.minSalary != null && (!row.latestSalary || Number(row.latestSalary.gross_annual_salary) < query.minSalary)) {
      return false
    }
    if (query.maxSalary != null && (!row.latestSalary || Number(row.latestSalary.gross_annual_salary) > query.maxSalary)) {
      return false
    }

    if (query.jornada) {
      if (!row.latestWorkingHours) return false
      const wanted = query.jornada === 'completa' ? 'Jornada completa' : 'Jornada reducida'
      if (workingHoursLabel(row.latestWorkingHours.weekly_hours) !== wanted) return false
    }

    if (query.minTenureYears != null && row.tenureMonths < query.minTenureYears * 12) return false
    if (query.maxTenureYears != null && row.tenureMonths > query.maxTenureYears * 12) return false

    return true
  })
}

export const PEOPLE_SORT_FIELDS = ['name', 'salary', 'lastReview', 'workingHours', 'tenure', 'department', 'manager'] as const
export type PeopleSortField = (typeof PEOPLE_SORT_FIELDS)[number]
export type PeopleSortDir = 'asc' | 'desc'

function compareNullableNumber(a: number | null, b: number | null): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  return a - b
}

function compareNullableDate(a: string | null, b: string | null): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  return new Date(a).getTime() - new Date(b).getTime()
}

/** Ordena el listado; las filas sin el dato pedido (sin salario, sin jornada...) van siempre al final. */
export function sortPeopleListRows(rows: PersonListRow[], sortBy: PeopleSortField, sortDir: PeopleSortDir): PersonListRow[] {
  const sorted = [...rows].sort((a, b) => {
    let cmp = 0
    switch (sortBy) {
      case 'salary':
        cmp = compareNullableNumber(
          a.latestSalary ? Number(a.latestSalary.gross_annual_salary) : null,
          b.latestSalary ? Number(b.latestSalary.gross_annual_salary) : null,
        )
        break
      case 'lastReview':
        cmp = compareNullableDate(a.latestSalary?.effective_date ?? null, b.latestSalary?.effective_date ?? null)
        break
      case 'workingHours':
        cmp = compareNullableNumber(
          a.latestWorkingHours ? a.latestWorkingHours.weekly_hours : null,
          b.latestWorkingHours ? b.latestWorkingHours.weekly_hours : null,
        )
        break
      case 'tenure':
        cmp = a.tenureMonths - b.tenureMonths
        break
      case 'department':
        cmp = (a.departmentName ?? '').localeCompare(b.departmentName ?? '')
        break
      case 'manager':
        cmp = (a.managerName ?? '').localeCompare(b.managerName ?? '')
        break
      case 'name':
      default:
        cmp = `${a.person.first_name} ${a.person.last_name}`.localeCompare(`${b.person.first_name} ${b.person.last_name}`)
    }
    return sortDir === 'desc' ? -cmp : cmp
  })
  return sorted
}
