import { notFound } from 'next/navigation'

import { Avatar } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { getPersonById } from '@/features/people/infrastructure/people.repository'
import { getMeetingById } from '@/features/one-on-ones/infrastructure/one-on-ones.repository'
import { listAgendaItems } from '@/features/one-on-ones/infrastructure/agenda-items.repository'
import { listAgreements } from '@/features/one-on-ones/infrastructure/agreements.repository'
import { listActionsByOneOnOne } from '@/features/actions/infrastructure/actions.repository'
import { MeetingStatusBadge } from '@/features/one-on-ones/ui/meeting-status-badge'
import { MeetingTransitionButtons } from '@/features/one-on-ones/ui/meeting-transition-buttons'
import { CloseMeetingDialog } from '@/features/one-on-ones/ui/close-meeting-dialog'
import { ScheduleNextButton } from '@/features/one-on-ones/ui/schedule-next-button'
import { AgendaList } from '@/features/one-on-ones/ui/agenda-list'
import { AgreementsList } from '@/features/one-on-ones/ui/agreements-list'
import { MeetingActionsPanel } from '@/features/one-on-ones/ui/meeting-actions-panel'
import { MEETING_MODE_LABELS } from '@/features/one-on-ones/domain/one-on-one.schema'
import { GenerateOneOnOneReportButton } from '@/features/reports/ui/generate-one-on-one-report-button'

export default async function MeetingPage({ params }: { params: Promise<{ meetingId: string }> }) {
  const { meetingId } = await params
  const supabase = await createClient()

  const meeting = await getMeetingById(supabase, meetingId)
  if (!meeting) notFound()

  const [person, manager, agendaItems, agreements, actions] = await Promise.all([
    getPersonById(supabase, meeting.person_id),
    getPersonById(supabase, meeting.manager_id),
    listAgendaItems(supabase, meeting.id),
    listAgreements(supabase, meeting.id),
    listActionsByOneOnOne(supabase, meeting.id),
  ])

  if (!person || !manager) notFound()

  const personName = `${person.first_name} ${person.last_name}`
  const managerName = `${manager.first_name} ${manager.last_name}`
  const readOnly = meeting.status === 'completed' || meeting.status === 'cancelled'

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar name={personName} size="lg" />
          <div>
            <h1 className="text-nexo-title">One2One con {personName}</h1>
            <p className="text-sm text-muted-foreground">
              {new Date(meeting.scheduled_at).toLocaleString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              · {MEETING_MODE_LABELS[meeting.mode]}
            </p>
            <div className="mt-2">
              <MeetingStatusBadge status={meeting.status} />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <MeetingTransitionButtons meetingId={meeting.id} status={meeting.status} />
          {meeting.status === 'in_progress' ? <CloseMeetingDialog meetingId={meeting.id} /> : null}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agenda</CardTitle>
        </CardHeader>
        <CardContent>
          <AgendaList oneOnOneId={meeting.id} items={agendaItems} readOnly={readOnly} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acuerdos</CardTitle>
        </CardHeader>
        <CardContent>
          <AgreementsList oneOnOneId={meeting.id} agreements={agreements} readOnly={readOnly} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acciones generadas</CardTitle>
        </CardHeader>
        <CardContent>
          <MeetingActionsPanel
            oneOnOneId={meeting.id}
            personId={person.id}
            managerId={manager.id}
            personName={personName}
            managerName={managerName}
            actions={actions}
            readOnly={readOnly}
          />
        </CardContent>
      </Card>

      {meeting.status === 'completed' ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Cierre</CardTitle>
            <GenerateOneOnOneReportButton oneOnOneId={meeting.id} />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {meeting.manager_comments ? <p className="text-sm">{meeting.manager_comments}</p> : null}
            <p className="text-sm text-muted-foreground">Valoración: {meeting.overall_rating}/5</p>
            {meeting.next_meeting_suggested_at ? (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Próxima reunión sugerida:{' '}
                  {new Date(meeting.next_meeting_suggested_at).toLocaleString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <ScheduleNextButton meetingId={meeting.id} />
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
