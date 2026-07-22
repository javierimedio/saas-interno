import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { listManagerCandidates } from '@/features/people/infrastructure/people.repository'
import { listMeetingsInRange } from '@/features/one-on-ones/infrastructure/one-on-ones.repository'
import { getRangeForView, parseDate, parseView } from '@/features/calendar/domain/calendar.rules'
import { CalendarToolbar } from '@/features/calendar/ui/calendar-toolbar'
import { MonthView } from '@/features/calendar/ui/month-view'
import { WeekView } from '@/features/calendar/ui/week-view'
import { DayView } from '@/features/calendar/ui/day-view'

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
  const session = await requireCurrentSession()
  const supabase = await createClient()
  const raw = await searchParams

  const view = parseView(typeof raw.view === 'string' ? raw.view : undefined)
  const date = parseDate(typeof raw.date === 'string' ? raw.date : undefined)
  const { start, end } = getRangeForView(view, date)

  const [meetings, people] = await Promise.all([
    listMeetingsInRange(supabase, session.organizationId, start.toISOString(), end.toISOString()),
    listManagerCandidates(supabase, session.organizationId),
  ])

  const peopleNamesById = new Map(people.map((p) => [p.id, `${p.first_name} ${p.last_name}`]))

  return (
    <div className="flex flex-col gap-5 p-6">
      <h1 className="text-lg font-semibold">Calendario</h1>
      <CalendarToolbar view={view} date={date} title={titleFor(view, date)} />
      {view === 'month' ? <MonthView date={date} meetings={meetings} peopleNamesById={peopleNamesById} /> : null}
      {view === 'week' ? <WeekView date={date} meetings={meetings} peopleNamesById={peopleNamesById} /> : null}
      {view === 'day' ? <DayView meetings={meetings} peopleNamesById={peopleNamesById} /> : null}
    </div>
  )
}
