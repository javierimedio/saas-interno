import * as React from 'react'
import Link from 'next/link'

import { getWeekDays, isSameDay } from '../domain/calendar.rules'
import type { OneOnOneRow } from '@/features/one-on-ones/infrastructure/one-on-ones.repository'

const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i) // 08:00 - 18:00

export function WeekView({
  date,
  meetings,
  peopleNamesById,
}: {
  date: Date
  meetings: OneOnOneRow[]
  peopleNamesById: Map<string, string>
}) {
  const days = getWeekDays(date)

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <div className="grid min-w-[720px] grid-cols-[52px_repeat(7,1fr)]">
        <div className="border-b border-border bg-secondary/60" />
        {days.map((day) => (
          <div
            key={day.toISOString()}
            className="border-b border-l border-border bg-secondary/60 px-2 py-1.5 text-center text-[11px] font-semibold"
          >
            {day.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
          </div>
        ))}

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
