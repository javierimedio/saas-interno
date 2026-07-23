import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireAdmin } from '@/shared/infrastructure/supabase/current-session'
import { listAllPeople, listManagerCandidates } from '@/features/people/infrastructure/people.repository'
import { listMeetingsInRange } from '@/features/one-on-ones/infrastructure/one-on-ones.repository'
import { getRangeForView, parseDate, parseView } from '@/features/calendar/domain/calendar.rules'
import { listTimeOffInRange } from '@/features/calendar/infrastructure/time-off.repository'
import { listHolidaysInRange } from '@/features/calendar/infrastructure/holidays.repository'
import { CalendarToolbar } from '@/features/calendar/ui/calendar-toolbar'
import { MonthView } from '@/features/calendar/ui/month-view'
import { WeekView } from '@/features/calendar/ui/week-view'
import { DayView } from '@/features/calendar/ui/day-view'
import { CreateTimeOffDialog } from '@/features/calendar/ui/create-time-off-dialog'
import { CreateHolidayDialog } from '@/features/calendar/ui/create-holiday-dialog'
import { PeriodEventsPanel } from '@/features/calendar/ui/period-events-panel'

function titleFor(view: string, date: Date): string {
  if (view === 'day') return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
  if (view === 'month') return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await requireAdmin()
  const supabase = await createClient()
  const raw = await searchParams

  const view = parseView(typeof raw.view === 'string' ? raw.view : undefined)
  const date = parseDate(typeof raw.date === 'string' ? raw.date : undefined)
  const { start, end } = getRangeForView(view, date)
  const startDate = start.toISOString().slice(0, 10)
  const endDate = end.toISOString().slice(0, 10)

  const [meetings, people, managerCandidates, timeOff, holidays] = await Promise.all([
    listMeetingsInRange(supabase, session.organizationId, start.toISOString(), end.toISOString()),
    listAllPeople(supabase, session.organizationId),
    listManagerCandidates(supabase, session.organizationId),
    listTimeOffInRange(supabase, session.organizationId, startDate, endDate),
    listHolidaysInRange(supabase, session.organizationId, startDate, endDate),
  ])

  const peopleNamesById = new Map(people.map((p) => [p.id, `${p.first_name} ${p.last_name}`]))
  const birthdays = people
    .filter((p) => p.birth_date)
    .map((p) => ({ id: p.id, name: `${p.first_name} ${p.last_name}`, birthDate: p.birth_date as string }))

  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-nexo-title">Calendario</h1>
        <div className="flex gap-2">
          <CreateHolidayDialog />
          <CreateTimeOffDialog people={managerCandidates} />
        </div>
      </div>
      <CalendarToolbar view={view} date={date} title={titleFor(view, date)} />
      {view === 'month' ? (
        <MonthView
          date={date}
          meetings={meetings}
          peopleNamesById={peopleNamesById}
          timeOff={timeOff}
          holidays={holidays}
          birthdays={birthdays}
        />
      ) : null}
      {view === 'week' ? (
        <WeekView
          date={date}
          meetings={meetings}
          peopleNamesById={peopleNamesById}
          timeOff={timeOff}
          holidays={holidays}
          birthdays={birthdays}
        />
      ) : null}
      {view === 'day' ? (
        <DayView
          date={date}
          meetings={meetings}
          peopleNamesById={peopleNamesById}
          timeOff={timeOff}
          holidays={holidays}
          birthdays={birthdays}
        />
      ) : null}
      <PeriodEventsPanel timeOff={timeOff} holidays={holidays} peopleNamesById={peopleNamesById} />
    </div>
  )
}
