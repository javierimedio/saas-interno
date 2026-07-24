import { notFound } from 'next/navigation'

import { Avatar } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { getPersonById } from '@/features/people/infrastructure/people.repository'
import { getMeetingById } from '@/features/one-on-ones/infrastructure/one-on-ones.repository'
import { listAgendaItems } from '@/features/one-on-ones/infrastructure/agenda-items.repository'
import { listAgreements } from '@/features/one-on-ones/infrastructure/agreements.repository'
import { listActionsByOneOnOne } from '@/features/actions/infrastructure/actions.repository'
import { getMeetingPreparation } from '@/features/one-on-ones/application/get-meeting-preparation'
import { MeetingStatusBadge } from '@/features/one-on-ones/ui/meeting-status-badge'
import { MeetingTransitionButtons } from '@/features/one-on-ones/ui/meeting-transition-buttons'
import { CloseMeetingDialog } from '@/features/one-on-ones/ui/close-meeting-dialog'
import { ScheduleNextButton } from '@/features/one-on-ones/ui/schedule-next-button'
import { AgendaList } from '@/features/one-on-ones/ui/agenda-list'
import { AgreementsList } from '@/features/one-on-ones/ui/agreements-list'
import { MeetingPreparationPanel } from '@/features/one-on-ones/ui/meeting-preparation-panel'
import { NarrativeBlocksEditor } from '@/features/one-on-ones/ui/narrative-blocks-editor'
import { ActionPlanBlock } from '@/features/one-on-ones/ui/action-plan-block'
import { FeedbackBlock } from '@/features/one-on-ones/ui/feedback-block'
import { NextMeetingBlock } from '@/features/one-on-ones/ui/next-meeting-block'
import { MEETING_MODE_LABELS, meetingDataSchema } from '@/features/one-on-ones/domain/one-on-one.schema'
import { NARRATIVE_BLOCKS, type NarrativeBlockKey } from '@/features/one-on-ones/domain/one-on-one-templates'
import { GenerateOneOnOneReportButton } from '@/features/reports/ui/generate-one-on-one-report-button'

export default async function MeetingPage({ params }: { params: Promise<{ meetingId: string }> }) {
  const { meetingId } = await params
  const supabase = await createClient()

  const meeting = await getMeetingById(supabase, meetingId)
  if (!meeting) notFound()

  const readOnly = meeting.status === 'completed' || meeting.status === 'cancelled'

  const [person, manager, agendaItems, agreements, actions, preparation] = await Promise.all([
    getPersonById(supabase, meeting.person_id),
    getPersonById(supabase, meeting.manager_id),
    listAgendaItems(supabase, meeting.id),
    listAgreements(supabase, meeting.id),
    listActionsByOneOnOne(supabase, meeting.id),
    readOnly ? Promise.resolve(null) : getMeetingPreparation(supabase, meeting.person_id, meeting.id, meeting.scheduled_at),
  ])

  if (!person || !manager) notFound()

  const personName = `${person.first_name} ${person.last_name}`
  const managerName = `${manager.first_name} ${manager.last_name}`

  const meetingData = meetingDataSchema.parse(meeting.meeting_data)
  const blockKeys = Object.keys(meetingData.blocks)
  const narrativeBlockKeys = blockKeys.filter((key): key is NarrativeBlockKey => key in NARRATIVE_BLOCKS)
  const hasFeedbackBlock = blockKeys.includes('feedback')

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
          {meeting.status === 'in_progress' ? (
            <CloseMeetingDialog
              meetingId={meeting.id}
              managerComments={meeting.manager_comments ?? ''}
              nextMeetingSuggestedAt={meeting.next_meeting_suggested_at ?? ''}
            />
          ) : null}
        </div>
      </div>

      {preparation ? <MeetingPreparationPanel data={preparation} /> : null}

      <NarrativeBlocksEditor
        meetingId={meeting.id}
        blockKeys={narrativeBlockKeys}
        initialMeetingData={meetingData}
        readOnly={readOnly}
      />

      <Card>
        <CardHeader>
          <CardTitle>Agenda</CardTitle>
        </CardHeader>
        <CardContent>
          <AgendaList oneOnOneId={meeting.id} items={agendaItems} readOnly={readOnly} />
        </CardContent>
      </Card>

      {agreements.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Acuerdos</CardTitle>
          </CardHeader>
          <CardContent>
            <AgreementsList oneOnOneId={meeting.id} agreements={agreements} readOnly />
          </CardContent>
        </Card>
      ) : null}

      <ActionPlanBlock
        meetingId={meeting.id}
        initialBlock={meetingData.blocks.action_plan}
        actions={actions}
        personId={person.id}
        managerId={manager.id}
        personName={personName}
        managerName={managerName}
        readOnly={readOnly}
      />

      {hasFeedbackBlock ? (
        <FeedbackBlock
          meetingId={meeting.id}
          managerComments={meeting.manager_comments}
          employeeComments={meeting.employee_comments}
          initialBlock={meetingData.blocks.feedback}
          readOnly={readOnly}
        />
      ) : null}

      <NextMeetingBlock
        meetingId={meeting.id}
        nextMeetingSuggestedAt={meeting.next_meeting_suggested_at}
        initialBlock={meetingData.blocks.next_meeting}
        readOnly={readOnly}
      />

      {meeting.status === 'completed' ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Cierre</CardTitle>
            <GenerateOneOnOneReportButton oneOnOneId={meeting.id} />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {meeting.manager_comments ? <p className="text-sm">{meeting.manager_comments}</p> : null}
            {meeting.overall_rating ? (
              <p className="text-sm text-muted-foreground">Valoración: {meeting.overall_rating}/5</p>
            ) : null}
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
