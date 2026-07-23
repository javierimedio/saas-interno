/**
 * Reglas puras de dominio (docs/02-arquitectura.md §2.3): sin dependencias de Supabase ni
 * de React, para poder probarse sin red (docs/product-design/03-employee-profile.md §3.2:
 * antigüedad y estado de compensación en la barra de "vitals").
 */

export function fullName(person: { firstName: string; lastName: string }): string {
  return `${person.firstName} ${person.lastName}`.trim()
}

export function initials(person: { firstName: string; lastName: string }): string {
  return `${person.firstName[0] ?? ''}${person.lastName[0] ?? ''}`.toUpperCase()
}

/** Antigüedad en años y meses completos entre la fecha de alta y hoy (o la baja). */
export function calculateTenure(hireDate: string, referenceDate: Date, terminationDate?: string | null): string {
  const start = new Date(hireDate)
  const end = terminationDate ? new Date(terminationDate) : referenceDate

  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  if (end.getDate() < start.getDate()) {
    months -= 1
  }
  months = Math.max(0, months)

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (years === 0) return `${remainingMonths}m`
  if (remainingMonths === 0) return `${years}a`
  return `${years}a ${remainingMonths}m`
}

const DEFAULT_SALARY_REVIEW_THRESHOLD_MONTHS = 18

/**
 * docs/product-design/04-dashboard.md §4.3: "Laura no tiene revisión salarial desde hace
 * 20 meses" — regla determinista de umbral, sin IA.
 */
export function isSalaryReviewOverdue(
  lastReviewDate: string,
  referenceDate: Date,
  thresholdMonths: number = DEFAULT_SALARY_REVIEW_THRESHOLD_MONTHS,
): boolean {
  const last = new Date(lastReviewDate)
  const monthsSince =
    (referenceDate.getFullYear() - last.getFullYear()) * 12 + (referenceDate.getMonth() - last.getMonth())
  return monthsSince >= thresholdMonths
}

export function isPersonActive(employmentStatus: string): boolean {
  return employmentStatus === 'active'
}

/** Edad en años cumplidos a partir de la fecha de nacimiento. Nunca se almacena, se calcula al vuelo. */
export function calculateAge(birthDate: string, referenceDate: Date): number {
  const birth = new Date(`${birthDate}T00:00:00`)
  let age = referenceDate.getFullYear() - birth.getFullYear()
  const hasHadBirthdayThisYear =
    referenceDate.getMonth() > birth.getMonth() ||
    (referenceDate.getMonth() === birth.getMonth() && referenceDate.getDate() >= birth.getDate())
  if (!hasHadBirthdayThisYear) age -= 1
  return age
}
