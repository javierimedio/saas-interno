import { isSalaryReviewOverdue } from '@/features/people/domain/person.rules'
import type { PersonRow } from '@/features/people/infrastructure/people.repository'
import type { SalaryRecordRow } from '@/features/people/infrastructure/salary-records.repository'
import type { ActionRow } from '@/features/actions/infrastructure/actions.repository'

function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function daysUntil(target: Date, referenceDate: Date): number {
  const ms = stripTime(target).getTime() - stripTime(referenceDate).getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

/** Última fila de salary_records por persona (records puede venir en cualquier orden). */
export function latestSalaryByPerson(records: SalaryRecordRow[]): Map<string, SalaryRecordRow> {
  const map = new Map<string, SalaryRecordRow>()
  for (const record of records) {
    const existing = map.get(record.person_id)
    if (!existing || record.effective_date > existing.effective_date) {
      map.set(record.person_id, record)
    }
  }
  return map
}

/** Masa salarial anual: suma del último salario bruto de cada persona activa. */
export function calculateAnnualPayroll(activePeople: PersonRow[], latestByPerson: Map<string, SalaryRecordRow>): number {
  return activePeople.reduce((total, person) => {
    const latest = latestByPerson.get(person.id)
    return total + (latest ? Number(latest.gross_annual_salary) : 0)
  }, 0)
}

/** Antigüedad media en años (decimal) de las personas activas. */
export function averageTenureYears(activePeople: PersonRow[], referenceDate: Date): number {
  if (activePeople.length === 0) return 0
  const totalYears = activePeople.reduce((sum, person) => {
    const hire = new Date(person.hire_date)
    const years = (referenceDate.getTime() - hire.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    return sum + Math.max(0, years)
  }, 0)
  return totalYears / activePeople.length
}

export function nextBirthdayDate(birthDateIso: string, referenceDate: Date): Date {
  const birth = new Date(`${birthDateIso}T00:00:00`)
  const today = stripTime(referenceDate)
  let next = new Date(referenceDate.getFullYear(), birth.getMonth(), birth.getDate())
  if (next < today) next = new Date(referenceDate.getFullYear() + 1, birth.getMonth(), birth.getDate())
  return next
}

export type UpcomingBirthday = { person: PersonRow; date: Date; daysUntil: number }

/** Próximos cumpleaños dentro de una ventana de días, ordenados por proximidad. */
export function upcomingBirthdays(people: PersonRow[], referenceDate: Date, withinDays: number): UpcomingBirthday[] {
  return people
    .filter((p) => p.birth_date)
    .map((p) => {
      const date = nextBirthdayDate(p.birth_date as string, referenceDate)
      return { person: p, date, daysUntil: daysUntil(date, referenceDate) }
    })
    .filter((b) => b.daysUntil >= 0 && b.daysUntil <= withinDays)
    .sort((a, b) => a.daysUntil - b.daysUntil)
}

export type SalaryReviewDue = { person: PersonRow; lastReviewDate: string; monthsSince: number }

/** Personas activas cuya última revisión salarial ya está vencida o vence pronto, ordenadas de más a menos urgente. */
export function upcomingSalaryReviews(
  activePeople: PersonRow[],
  latestByPerson: Map<string, SalaryRecordRow>,
  referenceDate: Date,
  thresholdMonths = 18,
  warnWithinMonths = 2,
): SalaryReviewDue[] {
  return activePeople
    .map((person) => {
      const latest = latestByPerson.get(person.id)
      if (!latest) return null
      const last = new Date(latest.effective_date)
      const monthsSince =
        (referenceDate.getFullYear() - last.getFullYear()) * 12 + (referenceDate.getMonth() - last.getMonth())
      return { person, lastReviewDate: latest.effective_date, monthsSince }
    })
    .filter((entry): entry is SalaryReviewDue => entry !== null && entry.monthsSince >= thresholdMonths - warnWithinMonths)
    .sort((a, b) => b.monthsSince - a.monthsSince)
}

export { isSalaryReviewOverdue }

export type ActionsByUrgency = { overdue: ActionRow[]; dueToday: ActionRow[]; dueThisWeek: ActionRow[] }

/** Agrupa acciones abiertas por urgencia de fecha límite. */
export function groupActionsByUrgency(actions: ActionRow[], referenceDate: Date): ActionsByUrgency {
  const open = actions.filter((a) => a.status !== 'completed' && a.status !== 'cancelled')
  const overdue: ActionRow[] = []
  const dueToday: ActionRow[] = []
  const dueThisWeek: ActionRow[] = []

  for (const action of open) {
    if (!action.due_date) continue
    const days = daysUntil(new Date(`${action.due_date}T00:00:00`), referenceDate)
    if (days < 0) overdue.push(action)
    else if (days === 0) dueToday.push(action)
    else if (days <= 7) dueThisWeek.push(action)
  }

  return { overdue, dueToday, dueThisWeek }
}

/** Altas recientes: personas cuyo hire_date cae dentro de la ventana de días pasados. */
export function recentHires(people: PersonRow[], referenceDate: Date, withinDays: number): PersonRow[] {
  return people
    .filter((p) => {
      const days = daysUntil(referenceDate, new Date(p.hire_date))
      return days >= 0 && days <= withinDays
    })
    .sort((a, b) => new Date(b.hire_date).getTime() - new Date(a.hire_date).getTime())
}

/** Incorporaciones futuras: hire_date en el futuro respecto a hoy. */
export function futureHires(people: PersonRow[], referenceDate: Date): PersonRow[] {
  return people
    .filter((p) => new Date(p.hire_date) > referenceDate)
    .sort((a, b) => new Date(a.hire_date).getTime() - new Date(b.hire_date).getTime())
}
