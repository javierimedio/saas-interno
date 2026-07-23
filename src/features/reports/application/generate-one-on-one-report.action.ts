'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { getMeetingById } from '@/features/one-on-ones/infrastructure/one-on-ones.repository'
import { listAgendaItems } from '@/features/one-on-ones/infrastructure/agenda-items.repository'
import { listAgreements } from '@/features/one-on-ones/infrastructure/agreements.repository'
import { listActionsByOneOnOne } from '@/features/actions/infrastructure/actions.repository'
import { getPersonById } from '@/features/people/infrastructure/people.repository'
import { ONE_ON_ONE_STATUS_LABELS } from '@/features/one-on-ones/domain/one-on-one.schema'
import { generateOneOnOneReportSchema, type GenerateOneOnOneReportInput } from '../domain/report.schema'
import { ReportPdfBuilder } from '../infrastructure/pdf-builder'
import { createReportRecord, type ReportRow } from '../infrastructure/reports.repository'

export async function generateOneOnOneReportAction(input: GenerateOneOnOneReportInput): Promise<Result<ReportRow>> {
  const parsed = generateOneOnOneReportSchema.safeParse(input)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')

  const session = await requireCurrentSession()
  const supabase = await createClient()

  try {
    const meeting = await getMeetingById(supabase, parsed.data.oneOnOneId)
    if (!meeting) return err('No se encontró la reunión')

    const [person, agendaItems, agreements, actions] = await Promise.all([
      getPersonById(supabase, meeting.person_id),
      listAgendaItems(supabase, meeting.id),
      listAgreements(supabase, meeting.id),
      listActionsByOneOnOne(supabase, meeting.id),
    ])

    const pdf = await ReportPdfBuilder.create()
    pdf.title('Acta de reunión One2One')
    pdf.subtitle(person ? `${person.first_name} ${person.last_name}` : 'Persona desconocida')
    pdf.emptyLine()
    pdf.keyValue('Fecha', new Date(meeting.scheduled_at).toLocaleString('es-ES'))
    pdf.keyValue('Estado', ONE_ON_ONE_STATUS_LABELS[meeting.status] ?? meeting.status)
    if (meeting.overall_rating) pdf.keyValue('Valoración', `${meeting.overall_rating}/5`)
    if (meeting.next_meeting_suggested_at) {
      pdf.keyValue('Próxima reunión sugerida', new Date(meeting.next_meeting_suggested_at).toLocaleDateString('es-ES'))
    }

    pdf.heading('Agenda')
    if (agendaItems.length === 0) pdf.line('Sin puntos de agenda.')
    for (const item of agendaItems) {
      pdf.line(`${item.discussed ? '[Tratado] ' : ''}${item.topic}`)
    }

    pdf.heading('Acuerdos')
    if (agreements.length === 0) pdf.line('Sin acuerdos registrados.')
    for (const agreement of agreements) {
      pdf.line(`- ${agreement.description}`)
    }

    pdf.heading('Acciones generadas')
    if (actions.length === 0) pdf.line('Sin acciones asociadas.')
    for (const action of actions) {
      pdf.line(`- ${action.title}${action.due_date ? ` (vence ${new Date(action.due_date).toLocaleDateString('es-ES')})` : ''}`)
    }

    if (meeting.manager_comments) {
      pdf.heading('Comentarios del responsable')
      pdf.line(meeting.manager_comments)
    }
    if (meeting.employee_comments) {
      pdf.heading('Comentarios del empleado')
      pdf.line(meeting.employee_comments)
    }

    const bytes = await pdf.toBytes()
    const storagePath = `${session.organizationId}/${meeting.person_id}/one-on-one-${meeting.id}-${randomUUID()}.pdf`

    const { error: uploadError } = await supabase.storage
      .from('reports')
      .upload(storagePath, Buffer.from(bytes), { contentType: 'application/pdf' })
    if (uploadError) return err(`No se pudo subir el informe: ${uploadError.message}`)

    const report = await createReportRecord(supabase, {
      organizationId: session.organizationId,
      personId: meeting.person_id,
      oneOnOneId: meeting.id,
      type: 'one_on_one_pdf',
      generatedBy: session.userId,
      storagePath,
    })

    revalidatePath('/reports')
    revalidatePath(`/one-on-ones/${meeting.id}`)
    revalidatePath(`/people/${meeting.person_id}`)
    return ok(report)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo generar el informe')
  }
}
