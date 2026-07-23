import {
  addDays,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from 'date-fns'

export type CalendarView = 'day' | 'week' | 'month'

export function parseView(value: string | undefined): CalendarView {
  return value === 'day' || value === 'week' || value === 'month' ? value : 'week'
}

export function parseDate(value: string | undefined): Date {
  if (!value) return new Date()
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

/** Rango [inicio, fin] a consultar según la vista, con margen para completar la rejilla del mes. */
export function getRangeForView(view: CalendarView, date: Date): { start: Date; end: Date } {
  if (view === 'day') {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)
    return { start, end }
  }

  if (view === 'week') {
    return {
      start: startOfWeek(date, { weekStartsOn: 1 }),
      end: endOfWeek(date, { weekStartsOn: 1 }),
    }
  }

  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  return {
    start: startOfWeek(monthStart, { weekStartsOn: 1 }),
    end: endOfWeek(monthEnd, { weekStartsOn: 1 }),
  }
}

export function getMonthGridDays(date: Date): Date[] {
  const { start, end } = getRangeForView('month', date)
  const days: Date[] = []
  let cursor = start
  while (cursor <= end) {
    days.push(cursor)
    cursor = addDays(cursor, 1)
  }
  return days
}

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function shiftDate(view: CalendarView, date: Date, direction: 1 | -1): Date {
  const amount = view === 'day' ? 1 : view === 'week' ? 7 : 30
  const result = new Date(date)
  if (view === 'month') {
    result.setMonth(result.getMonth() + direction)
    return result
  }
  return addDays(result, amount * direction)
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** Compara solo mes/día (para cumpleaños, que se repiten cada año). */
export function isMonthDayMatch(isoDate: string, day: Date): boolean {
  const d = new Date(`${isoDate}T00:00:00`)
  return d.getMonth() === day.getMonth() && d.getDate() === day.getDate()
}

export function isDateWithinRange(day: Date, startDate: string, endDate: string): boolean {
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T23:59:59`)
  return day >= start && day <= end
}
