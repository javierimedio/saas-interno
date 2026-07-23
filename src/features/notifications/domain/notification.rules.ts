import { daysUntil, futureHires, groupActionsByUrgency, latestSalaryByPerson, upcomingBirthdays, upcomingSalaryReviews } from '@/features/dashboard/domain/dashboard.rules'
import type { PersonRow } from '@/features/people/infrastructure/people.repository'
import type { SalaryRecordRow } from '@/features/people/infrastructure/salary-records.repository'
import type { ActionRow } from '@/features/actions/infrastructure/actions.repository'
import type { OneOnOneRow } from '@/features/one-on-ones/infrastructure/one-on-ones.repository'

export const NOTIFICATION_TYPES = [
  'birthday',
  'one_on_one_today',
  'one_on_one_tomorrow',
  'action_overdue',
  'action_due_soon',
  'future_hire',
  'salary_review',
] as const
export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

export type AppNotification = {
  id: string
  type: NotificationType
  title: string
  description: string
  date: string
  href: string
}

export type NotificationSourceData = {
  people: PersonRow[]
  salaryRecords: SalaryRecordRow[]
  actions: ActionRow[]
  meetingsTodayTomorrow: OneOnOneRow[]
}

function personName(person: Pick<PersonRow, 'first_name' | 'last_name'>): string {
  return `${person.first_name} ${person.last_name}`
}

/**
 * Deriva notificaciones a partir de datos que ya existen en la aplicación (cumpleaños, One2One,
 * acciones, altas, revisiones salariales). No introduce ninguna regla de negocio nueva: cada
 * bloque reutiliza las funciones puras ya usadas por el dashboard.
 */
export function buildNotifications(data: NotificationSourceData, referenceDate: Date): AppNotification[] {
  const notifications: AppNotification[] = []
  const peopleById = new Map(data.people.map((p) => [p.id, p]))
  const activePeople = data.people.filter((p) => p.employment_status === 'active')

  for (const b of upcomingBirthdays(data.people, referenceDate, 7)) {
    notifications.push({
      id: `birthday:${b.person.id}:${b.date.getFullYear()}`,
      type: 'birthday',
      title: b.daysUntil === 0 ? 'Cumpleaños hoy' : `Cumpleaños en ${b.daysUntil} día${b.daysUntil === 1 ? '' : 's'}`,
      description: personName(b.person),
      date: b.date.toISOString(),
      href: `/people/${b.person.id}`,
    })
  }

  for (const meeting of data.meetingsTodayTomorrow) {
    const days = daysUntil(new Date(meeting.scheduled_at), referenceDate)
    if (days !== 0 && days !== 1) continue
    const person = peopleById.get(meeting.person_id)
    notifications.push({
      id: `one_on_one:${meeting.id}`,
      type: days === 0 ? 'one_on_one_today' : 'one_on_one_tomorrow',
      title: days === 0 ? 'One2One hoy' : 'One2One mañana',
      description: person ? personName(person) : 'Reunión programada',
      date: meeting.scheduled_at,
      href: `/one-on-ones/${meeting.id}`,
    })
  }

  const { overdue, dueToday, dueThisWeek } = groupActionsByUrgency(data.actions, referenceDate)
  for (const action of overdue) {
    notifications.push({
      id: `action_overdue:${action.id}`,
      type: 'action_overdue',
      title: 'Acción vencida',
      description: action.title,
      date: action.due_date ?? referenceDate.toISOString(),
      href: `/actions/${action.id}`,
    })
  }
  for (const action of [...dueToday, ...dueThisWeek]) {
    notifications.push({
      id: `action_due_soon:${action.id}`,
      type: 'action_due_soon',
      title: 'Acción próxima a vencer',
      description: action.title,
      date: action.due_date ?? referenceDate.toISOString(),
      href: `/actions/${action.id}`,
    })
  }

  for (const person of futureHires(data.people, referenceDate)) {
    if (daysUntil(new Date(person.hire_date), referenceDate) > 14) continue
    notifications.push({
      id: `future_hire:${person.id}`,
      type: 'future_hire',
      title: 'Próxima incorporación',
      description: `${personName(person)} · ${new Date(person.hire_date).toLocaleDateString('es-ES')}`,
      date: person.hire_date,
      href: `/people/${person.id}`,
    })
  }

  const latestByPerson = latestSalaryByPerson(data.salaryRecords)
  for (const review of upcomingSalaryReviews(activePeople, latestByPerson, referenceDate)) {
    notifications.push({
      id: `salary_review:${review.person.id}`,
      type: 'salary_review',
      title: review.monthsSince >= 18 ? 'Revisión salarial vencida' : 'Revisión salarial próxima',
      description: personName(review.person),
      date: review.lastReviewDate,
      href: `/people/${review.person.id}`,
    })
  }

  return notifications.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}
