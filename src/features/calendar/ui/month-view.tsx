import Link from 'next/link'

import { cn } from '@/lib/utils'
import { getMonthGridDays, isDateWithinRange, isMonthDayMatch, isSameDay } from '../domain/calendar.rules'
import type { OneOnOneRow } from '@/features/one-on-ones/infrastructure/one-on-ones.repository'
import type { TimeOffRow } from '../infrastructure/time-off.repository'
import type { HolidayRow } from '../infrastructure/holidays.repository'

export function MonthView({
  date,
  meetings,
  peopleNamesById,
  timeOff = [],
  holidays = [],
  birthdays = [],
}: {
  date: Date
  meetings: OneOnOneRow[]
  peopleNamesById: Map<string, string>
  timeOff?: TimeOffRow[]
  holidays?: HolidayRow[]
  birthdays?: { id: string; name: string; birthDate: string }[]
}) {
  const days = getMonthGridDays(date)
  const today = new Date()
  const currentMonth = date.getMonth()

  return (
    <div className="grid grid-cols-7 overflow-hidden rounded-lg border border-border">
      {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
        <div key={d} className="border-b border-border bg-secondary/60 px-2 py-1.5 text-center text-[11px] font-semibold text-muted-foreground">
          {d}
        </div>
      ))}
      {days.map((day) => {
        const dayMeetings = meetings.filter((m) => isSameDay(new Date(m.scheduled_at), day))
        const dayHoliday = holidays.find((h) => isSameDay(new Date(`${h.date}T00:00:00`), day))
        const dayTimeOff = timeOff.filter((t) => isDateWithinRange(day, t.start_date, t.end_date))
        const dayBirthdays = birthdays.filter((b) => isMonthDayMatch(b.birthDate, day))
        return (
          <div
            key={day.toISOString()}
            className={cn(
              'min-h-24 border-b border-r border-border p-1.5 last:border-r-0',
              day.getMonth() !== currentMonth && 'bg-muted/40 text-muted-foreground',
              dayHoliday && 'bg-warning-soft/40',
            )}
          >
            <span
              className={cn(
                'inline-flex size-5 items-center justify-center rounded-full text-xs',
                isSameDay(day, today) && 'bg-primary font-semibold text-primary-foreground',
              )}
            >
              {day.getDate()}
            </span>
            <div className="mt-1 flex flex-col gap-0.5">
              {dayHoliday ? (
                <span className="truncate rounded bg-warning-soft px-1 py-0.5 text-[10.5px] font-medium text-warning">
                  {dayHoliday.name}
                </span>
              ) : null}
              {dayBirthdays.map((b) => (
                <span key={b.id} className="truncate rounded bg-muted px-1 py-0.5 text-[10.5px] font-medium">
                  🎂 {b.name}
                </span>
              ))}
              {dayTimeOff.slice(0, 2).map((t) => (
                <span key={t.id} className="truncate rounded bg-secondary px-1 py-0.5 text-[10.5px] font-medium">
                  {peopleNamesById.get(t.person_id) ?? '—'}
                </span>
              ))}
              {dayMeetings.slice(0, 3).map((meeting) => (
                <Link
                  key={meeting.id}
                  href={`/one-on-ones/${meeting.id}`}
                  className="truncate rounded bg-accent px-1 py-0.5 text-[11px] font-medium text-accent-foreground"
                >
                  {new Date(meeting.scheduled_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}{' '}
                  {peopleNamesById.get(meeting.person_id) ?? ''}
                </Link>
              ))}
              {dayMeetings.length > 3 ? (
                <span className="text-[10.5px] text-text-faint">+{dayMeetings.length - 3} más</span>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
