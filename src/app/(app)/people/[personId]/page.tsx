import { notFound } from 'next/navigation'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { getPersonById } from '@/features/people/infrastructure/people.repository'
import { listDepartments } from '@/features/people/infrastructure/departments.repository'
import { listSalaryRecords } from '@/features/people/infrastructure/salary-records.repository'
import { listDocuments } from '@/features/people/infrastructure/documents.repository'
import { listPrivateNotes } from '@/features/people/infrastructure/private-notes.repository'
import { listAuditEventsForPerson } from '@/features/people/infrastructure/audit-log.repository'
import { buildPersonTimeline } from '@/features/people/application/build-person-timeline'
import { PersonHeader } from '@/features/people/ui/person-header'
import { PersonVitals } from '@/features/people/ui/person-vitals'
import { PersonSectionNav } from '@/features/people/ui/person-section-nav'
import { PersonTimeline } from '@/features/people/ui/person-timeline'
import { SalaryHistoryPanel } from '@/features/people/ui/salary-history-panel'
import { DocumentsPanel } from '@/features/people/ui/documents-panel'
import { PrivateNotesPanel } from '@/features/people/ui/private-notes-panel'
import { listMeetingsByPerson } from '@/features/one-on-ones/infrastructure/one-on-ones.repository'
import { PersonMeetingsPanel } from '@/features/one-on-ones/ui/person-meetings-panel'
import { listActionsByPerson } from '@/features/actions/infrastructure/actions.repository'

export default async function PersonProfilePage({ params }: { params: Promise<{ personId: string }> }) {
  const { personId } = await params
  const supabase = await createClient()

  const person = await getPersonById(supabase, personId)
  if (!person) {
    notFound()
  }

  const [departments, salaryRecords, documents, privateNotes, auditEvents, meetings, actions] = await Promise.all([
    listDepartments(supabase, person.organization_id),
    listSalaryRecords(supabase, person.id),
    listDocuments(supabase, person.id),
    listPrivateNotes(supabase, person.id),
    listAuditEventsForPerson(supabase, person.id),
    listMeetingsByPerson(supabase, person.id),
    listActionsByPerson(supabase, person.id),
  ])

  let managerName: string | undefined
  if (person.manager_id) {
    const manager = await getPersonById(supabase, person.manager_id)
    managerName = manager ? `${manager.first_name} ${manager.last_name}` : undefined
  }

  const departmentName = departments.find((d) => d.id === person.department_id)?.name
  const timeline = buildPersonTimeline(auditEvents, salaryRecords, documents, meetings, actions)
  const now = new Date()

  const upcoming = meetings
    .filter((m) => (m.status === 'scheduled' || m.status === 'preparing') && new Date(m.scheduled_at) >= now)
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())[0]
  const lastCompleted = meetings
    .filter((m) => m.status === 'completed')
    .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())[0]

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <PersonHeader person={person} departmentName={departmentName} managerName={managerName} />
      <PersonVitals
        hireDate={person.hire_date}
        terminationDate={person.termination_date}
        latestSalary={salaryRecords[0]}
        nextMeetingAt={upcoming?.scheduled_at}
        lastMeetingAt={lastCompleted?.actual_ended_at ?? lastCompleted?.scheduled_at}
        lastMeetingRating={lastCompleted?.overall_rating}
        now={now}
      />

      <PersonSectionNav />

      <section id="cronologia" className="scroll-mt-16">
        <h2 className="mb-3 text-sm font-semibold">Cronología</h2>
        <PersonTimeline events={timeline} />
      </section>

      <section id="one-on-one" className="scroll-mt-16">
        <Card>
          <CardHeader>
            <CardTitle>One2One</CardTitle>
          </CardHeader>
          <CardContent>
            <PersonMeetingsPanel personId={person.id} meetings={meetings} />
          </CardContent>
        </Card>
      </section>

      <section id="compensacion" className="scroll-mt-16">
        <Card>
          <CardHeader>
            <CardTitle>Compensación</CardTitle>
          </CardHeader>
          <CardContent>
            <SalaryHistoryPanel personId={person.id} records={salaryRecords} />
          </CardContent>
        </Card>
      </section>

      <section id="documentos" className="scroll-mt-16">
        <Card>
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentsPanel personId={person.id} documents={documents} />
          </CardContent>
        </Card>
      </section>

      <section id="notas" className="scroll-mt-16">
        <Card>
          <CardHeader>
            <CardTitle>Notas privadas</CardTitle>
          </CardHeader>
          <CardContent>
            <PrivateNotesPanel personId={person.id} notes={privateNotes} />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
