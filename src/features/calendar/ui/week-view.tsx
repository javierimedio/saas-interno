import * as React from 'react'
import Link from 'next/link'

import { getWeekDays, isDateWithinRange, isMonthDayMatch, isSameDay } from '../domain/calendar.rules'
import type { OneOnOneRow } from '@/features/one-on-ones/infrastructure/one-on-ones.repository'
import type { TimeOffRow } from '../infrastructure/time-off.repository'
import type { HolidayRow } from '../infrastructure/holidays.repository'

const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i) // 08:00 - 18:00

export function WeekView({
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
  const days = getWeekDays(date)

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <div className="grid min-w-[720px] grid-cols-[52px_repeat(7,1fr)]">
        <div className="border-b border-border bg-secondary/60" />
        {days.map((day) => {
          const dayHoliday = holidays.find((h) => isSameDay(new Date(`${h.date}T00:00:00`), day))
          return (
            <div
              key={day.toISOString()}
              className="border-b border-l border-border bg-secondary/60 px-2 py-1.5 text-center text-[11px] font-semibold"
            >
              {day.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
              {dayHoliday ? <div className="truncate text-[10px] font-medium text-warning">{dayHoliday.name}</div> : null}
            </div>
          )
        })}
        <div className="border-b border-border" />
        {days.map((day) => {
          const dayTimeOff = timeOff.filter((t) => isDateWithinRange(day, t.start_date, t.end_date))
          const dayBirthdays = birthdays.filter((b) => isMonthDayMatch(b.birthDate, day))
          if (dayTimeOff.length === 0 && dayBirthdays.length === 0) {
            return <div key={day.toISOString() + '-chips'} className="border-b border-l border-border" />
          }
          return (
            <div key={day.toISOString() + '-chips'} className="flex flex-col gap-0.5 border-b border-l border-border p-1">
              {dayBirthdays.map((b) => (
                <span key={b.id} className="truncate rounded bg-muted px-1 py-0.5 text-[10px] font-medium">
                  🎂 {b.name}
                </span>
              ))}
              {dayTimeOff.map((t) => (
                <span key={t.id} className="truncate rounded bg-secondary px-1 py-0.5 text-[10px] font-medium">
                  {peopleNamesById.get(t.person_id) ?? '—'}
                </span>
              ))}
            </div>
          )
        })}

        {HOURS.map((hour) => (
          <React.Fragment key={hour}>
            <div className="border-b border-border px-1.5 py-2 text-right text-[10px] text-text-faint">{hour}:00</div>
            {days.map((day) => {
              const cellMeetings = meetings.filter((m) => {
                const d = new Date(m.scheduled_at)
                return isSameDay(d, day) && d.getHours() === hour
              })
              return (
                <div key={day.toISOString() + hour} className="min-h-11 border-b border-l border-border p-0.5">
                  {cellMeetings.map((meeting) => (
                    <Link
                      key={meeting.id}
                      href={`/one-on-ones/${meeting.id}`}
                      className="block truncate rounded bg-accent px-1 py-0.5 text-[10.5px] font-medium text-accent-foreground"
                    >
                      {peopleNamesById.get(meeting.person_id) ?? ''}
                    </Link>
                  ))}
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
