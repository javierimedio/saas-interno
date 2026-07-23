import Link from 'next/link'

import { Avatar } from '@/components/ui/avatar'
import { EmptyState } from '@/components/shared/empty-state'
import { MeetingStatusBadge } from '@/features/one-on-ones/ui/meeting-status-badge'
import { isDateWithinRange, isMonthDayMatch } from '../domain/calendar.rules'
import type { OneOnOneRow } from '@/features/one-on-ones/infrastructure/one-on-ones.repository'
import type { TimeOffRow } from '../infrastructure/time-off.repository'
import type { HolidayRow } from '../infrastructure/holidays.repository'

export function DayView({
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
  const sorted = [...meetings].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
  const dayHoliday = holidays.find((h) => isDateWithinRange(date, h.date, h.date))
  const dayTimeOff = timeOff.filter((t) => isDateWithinRange(date, t.start_date, t.end_date))
  const dayBirthdays = birthdays.filter((b) => isMonthDayMatch(b.birthDate, date))
  const hasBanner = Boolean(dayHoliday) || dayTimeOff.length > 0 || dayBirthdays.length > 0

  return (
    <div className="flex flex-col gap-3">
      {hasBanner ? (
        <div className="flex flex-col gap-1 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm">
          {dayHoliday ? <span className="font-medium text-warning">Festivo: {dayHoliday.name}</span> : null}
          {dayBirthdays.length > 0 ? (
            <span>🎂 Cumpleaños: {dayBirthdays.map((b) => b.name).join(', ')}</span>
          ) : null}
          {dayTimeOff.length > 0 ? (
            <span>
              Ausentes:{' '}
              {dayTimeOff.map((t) => peopleNamesById.get(t.person_id) ?? '—').join(', ')}
            </span>
          ) : null}
        </div>
      ) : null}
      {sorted.length === 0 ? (
        <EmptyState title="Sin reuniones este día" />
      ) : (
        <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {sorted.map((meeting) => {
            const name = peopleNamesById.get(meeting.person_id) ?? '—'
            return (
              <Link
                key={meeting.id}
                href={`/one-on-ones/${meeting.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50"
              >
                <span className="w-14 shrink-0 text-sm font-semibold tabular-nums">
                  {new Date(meeting.scheduled_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <Avatar name={name} size="sm" />
                <span className="flex-1 text-sm font-medium">{name}</span>
                <MeetingStatusBadge status={meeting.status} />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
