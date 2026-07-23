'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { getPersonById } from '@/features/people/infrastructure/people.repository'
import { listSalaryRecords } from '@/features/people/infrastructure/salary-records.repository'
import { listMeetingsByPerson } from '@/features/one-on-ones/infrastructure/one-on-ones.repository'
import { listActionsByPerson } from '@/features/actions/infrastructure/actions.repository'
import { listGoalsByPerson, listCheckinsForGoals } from '@/features/development/infrastructure/goals.repository'
import { listTrainingsByPerson } from '@/features/development/infrastructure/trainings.repository'
import { listEvaluationsByPerson } from '@/features/development/infrastructure/feedback-evaluations.repository'
import { GOAL_STATUS_LABELS } from '@/features/development/domain/goal.schema'
import { TRAINING_STATUS_LABELS } from '@/features/development/domain/development.schema'
import { latestProgress } from '@/features/development/domain/goal.rules'
import { generateEmployeeReportSchema, type GenerateEmployeeReportInput } from '../domain/report.schema'
import { REPORT_TYPE_LABELS } from '../domain/report.schema'
import { ReportPdfBuilder } from '../infrastructure/pdf-builder'
import { createReportRecord, type ReportRow } from '../infrastructure/reports.repository'

export async function generateEmployeeReportAction(input: GenerateEmployeeReportInput): Promise<Result<ReportRow>> {
  const parsed = generateEmployeeReportSchema.safeParse(input)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')

  const session = await requireCurrentSession()
  const supabase = await createClient()
  const { personId, type, year } = parsed.data
  const reportYear = year ?? new Date().getFullYear()

  try {
    const person = await getPersonById(supabase, personId)
    if (!person) return err('No se encontró la persona')

    const [salaryRecords, meetings, actions, goals, trainings, evaluations] = await Promise.all([
      listSalaryRecords(supabase, personId),
      listMeetingsByPerson(supabase, personId),
      listActionsByPerson(supabase, personId),
      listGoalsByPerson(supabase, personId),
      listTrainingsByPerson(supabase, personId),
      listEvaluationsByPerson(supabase, personId),
    ])
    const checkins = await listCheckinsForGoals(supabase, goals.map((g) => g.id))
    const checkinsByGoal = new Map<string, typeof checkins>()
    for (const c of checkins) checkinsByGoal.set(c.goal_id, [...(checkinsByGoal.get(c.goal_id) ?? []), c])

    const inYear = (iso: string) => new Date(iso).getFullYear() === reportYear

    const pdf = await ReportPdfBuilder.create()
    pdf.title(REPORT_TYPE_LABELS[type])
    pdf.subtitle(`${person.first_name} ${person.last_name} · ${person.position_title}`)
    pdf.emptyLine()
    pdf.keyValue('Fecha de alta', new Date(person.hire_date).toLocaleDateString('es-ES'))
    pdf.keyValue('Estado', person.employment_status)
    if (type === 'employee_annual') pdf.keyValue('Año', String(reportYear))

    const scopedSalary = type === 'employee_annual' ? salaryRecords.filter((s) => inYear(s.effective_date)) : salaryRecords
    const scopedMeetings = type === 'employee_annual' ? meetings.filter((m) => inYear(m.scheduled_at)) : meetings
    const scopedActions = type === 'employee_summary' ? actions.filter((a) => a.status !== 'completed' && a.status !== 'cancelled') : actions
    const scopedGoals = type === 'employee_annual' ? goals.filter((g) => g.year === reportYear) : goals
    const scopedTrainings = type === 'employee_annual' ? trainings.filter((t) => t.start_date && inYear(t.start_date)) : trainings
    const scopedEvaluations = type === 'employee_annual' ? evaluations.filter((e) => inYear(e.created_at)) : evaluations

    pdf.heading('Compensación')
    if (scopedSalary.length === 0) pdf.line('Sin registros salariales en el periodo.')
    for (const s of scopedSalary.slice(0, type === 'employee_summary' ? 1 : undefined)) {
      pdf.line(
        `${new Date(s.effective_date).toLocaleDateString('es-ES')}: ${Number(s.gross_annual_salary).toLocaleString('es-ES')} ${s.currency}`,
      )
    }

    pdf.heading('One2One')
    const completedMeetings = scopedMeetings.filter((m) => m.status === 'completed')
    pdf.line(`${completedMeetings.length} reuniones completadas de ${scopedMeetings.length} en el periodo.`)
    if (type !== 'employee_summary') {
      for (const m of completedMeetings) {
        pdf.line(`- ${new Date(m.scheduled_at).toLocaleDateString('es-ES')}${m.overall_rating ? ` · ${m.overall_rating}/5` : ''}`)
      }
    }

    pdf.heading('Acciones')
    if (scopedActions.length === 0) pdf.line('Sin acciones en el periodo.')
    for (const a of scopedActions) {
      pdf.line(`- [${a.status}] ${a.title}`)
    }

    pdf.heading('Objetivos')
    if (scopedGoals.length === 0) pdf.line('Sin objetivos en el periodo.')
    for (const g of scopedGoals) {
      const progress = latestProgress(checkinsByGoal.get(g.id) ?? [])
      pdf.line(`- ${g.title} (${GOAL_STATUS_LABELS[g.status]}, ${progress}%)`)
    }

    if (type !== 'employee_summary') {
      pdf.heading('Formación')
      if (scopedTrainings.length === 0) pdf.line('Sin formaciones en el periodo.')
      for (const t of scopedTrainings) {
        pdf.line(`- ${t.title} (${TRAINING_STATUS_LABELS[t.status]})`)
      }

      pdf.heading('Evaluaciones')
      if (scopedEvaluations.length === 0) pdf.line('Sin evaluaciones en el periodo.')
      for (const e of scopedEvaluations) {
        pdf.line(`- ${e.period}: ${e.result}`)
      }
    }

    const bytes = await pdf.toBytes()
    const storagePath = `${session.organizationId}/${personId}/${type}-${randomUUID()}.pdf`

    const { error: uploadError } = await supabase.storage
      .from('reports')
      .upload(storagePath, Buffer.from(bytes), { contentType: 'application/pdf' })
    if (uploadError) return err(`No se pudo subir el informe: ${uploadError.message}`)

    const report = await createReportRecord(supabase, {
      organizationId: session.organizationId,
      personId,
      type,
      generatedBy: session.userId,
      storagePath,
      params: type === 'employee_annual' ? { year: reportYear } : {},
    })

    revalidatePath('/reports')
    revalidatePath(`/people/${personId}`)
    return ok(report)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo generar el informe')
  }
}
