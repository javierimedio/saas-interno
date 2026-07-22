import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { InsightCard } from '@/components/shared/insight-card'
import { EmptyState } from '@/components/shared/empty-state'
import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { listManagerCandidates } from '@/features/people/infrastructure/people.repository'
import { listOverdueMeetings, listUpcomingMeetings } from '@/features/one-on-ones/infrastructure/one-on-ones.repository'

function daysSince(dateIso: string, now: Date): number {
  return Math.floor((now.getTime() - new Date(dateIso).getTime()) / (1000 * 60 * 60 * 24))
}

export default async function HoyPage() {
  const session = await requireCurrentSession()
  const supabase = await createClient()
  const now = new Date()

  const [upcoming, overdue, people] = await Promise.all([
    listUpcomingMeetings(supabase, session.organizationId, now.toISOString(), 5),
    listOverdueMeetings(supabase, session.organizationId, now.toISOString()),
    listManagerCandidates(supabase, session.organizationId),
  ])

  const namesById = new Map(people.map((p) => [p.id, `${p.first_name} ${p.last_name}`]))
  const todayMeetings = upcoming.filter((m) => {
    const d = new Date(m.scheduled_at)
    return d.toDateString() === now.toDateString()
  })

  const hasInsights = todayMeetings.length > 0 || upcoming.length > 0 || overdue.length > 0

  return (
    <div className="flex flex-col gap-5 p-6">
      <h1 className="text-lg font-semibold">Hoy</h1>

      {!hasInsights ? (
        <EmptyState title="Todo al día — no hay nada que requiera tu atención ahora mismo" />
      ) : (
        <div className="flex flex-col gap-2.5">
          {todayMeetings.length > 0 ? (
            <InsightCard
              headline={`Hoy tienes ${todayMeetings.length} reunión${todayMeetings.length > 1 ? 'es' : ''}: ${todayMeetings
                .map((m) => `${namesById.get(m.person_id) ?? ''} (${new Date(m.scheduled_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })})`)
                .join(', ')}`}
              action={
                <Button asChild size="sm" variant="outline">
                  <Link href="/calendar?view=day">Ver agenda del día</Link>
                </Button>
              }
            />
          ) : null}

          {overdue.map((meeting) => (
            <InsightCard
              key={meeting.id}
              severity="danger"
              headline={`Hace ${daysSince(meeting.scheduled_at, now)} días que no hablas con ${namesById.get(meeting.person_id) ?? 'esta persona'}`}
              sub={`Estaba programado para el ${new Date(meeting.scheduled_at).toLocaleDateString('es-ES')}`}
              action={
                <Button asChild size="sm">
                  <Link href={`/one-on-ones/${meeting.id}`}>Ver 1:1</Link>
                </Button>
              }
            />
          ))}

          {upcoming
            .filter((m) => !todayMeetings.includes(m))
            .map((meeting) => (
              <InsightCard
                key={meeting.id}
                headline={`Próximo 1:1 con ${namesById.get(meeting.person_id) ?? ''}`}
                sub={new Date(meeting.scheduled_at).toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                action={
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/one-on-ones/${meeting.id}`}>Preparar</Link>
                  </Button>
                }
              />
            ))}
        </div>
      )}
    </div>
  )
}
