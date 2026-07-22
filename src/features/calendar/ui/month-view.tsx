import Link from 'next/link'

import { cn } from '@/lib/utils'
import { getMonthGridDays, isSameDay } from '../domain/calendar.rules'
import type { OneOnOneRow } from '@/features/one-on-ones/infrastructure/one-on-ones.repository'

export function MonthView({
  date,
  meetings,
  peopleNamesById,
}: {
  date: Date
  meetings: OneOnOneRow[]
  peopleNamesById: Map<string, string>
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
        return (
          <div
            key={day.toISOString()}
            className={cn(
              'min-h-24 border-b border-r border-border p-1.5 last:border-r-0',
              day.getMonth() !== currentMonth && 'bg-muted/40 text-muted-foreground',
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
