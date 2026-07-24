import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/shared/infrastructure/supabase/database.types'
import { listActionsByPerson } from '@/features/actions/infrastructure/actions.repository'
import type { ActionRow } from '@/features/actions/infrastructure/actions.repository'
import { listSalaryRecords } from '@/features/people/infrastructure/salary-records.repository'
import type { SalaryRecordRow } from '@/features/people/infrastructure/salary-records.repository'
import { listWorkingHoursRecords } from '@/features/people/infrastructure/working-hours-records.repository'
import type { WorkingHoursRecordRow } from '@/features/people/infrastructure/working-hours-records.repository'
import { listDocuments } from '@/features/people/infrastructure/documents.repository'
import type { DocumentRow } from '@/features/people/infrastructure/documents.repository'
import { listPrivateNotes } from '@/features/people/infrastructure/private-notes.repository'
import type { PrivateNoteRow } from '@/features/people/infrastructure/private-notes.repository'
import { listMeetingsByPerson } from '../infrastructure/one-on-ones.repository'
import { findPreviousCompletedMeeting } from '../domain/one-on-one.rules'

type TypedClient = SupabaseClient<Database>

export type MeetingPreparationData = {
  sinceDate: string | null
  openActions: ActionRow[]
  salaryChanges: SalaryRecordRow[]
  workingHoursChanges: WorkingHoursRecordRow[]
  recentDocuments: DocumentRow[]
  privateNotes: PrivateNoteRow[]
}

const DEFAULT_WINDOW_DAYS = 180

/**
 * Bloque "Preparación": agrega, de un vistazo, todo lo relevante de la persona desde el último
 * One2One (o de los últimos 6 meses si es el primero). Solo lecturas de datos ya existentes, sin
 * ninguna tabla ni columna nueva.
 */
export async function getMeetingPreparation(
  client: TypedClient,
  personId: string,
  currentMeetingId: string,
  currentScheduledAt: string,
): Promise<MeetingPreparationData> {
  const meetings = await listMeetingsByPerson(client, personId)
  const previous = findPreviousCompletedMeeting(meetings, currentMeetingId, currentScheduledAt)
  const sinceDate =
    previous?.scheduled_at ?? new Date(new Date(currentScheduledAt).getTime() - DEFAULT_WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const [actions, salaryRecords, workingHoursRecords, documents, privateNotes] = await Promise.all([
    listActionsByPerson(client, personId),
    listSalaryRecords(client, personId),
    listWorkingHoursRecords(client, personId),
    listDocuments(client, personId),
    listPrivateNotes(client, personId),
  ])

  return {
    sinceDate: previous?.scheduled_at ?? null,
    openActions: actions.filter((a) => a.status !== 'completed' && a.status !== 'cancelled'),
    salaryChanges: salaryRecords.filter((r) => r.effective_date >= sinceDate.slice(0, 10)),
    workingHoursChanges: workingHoursRecords.filter((r) => r.effective_date >= sinceDate.slice(0, 10)),
    recentDocuments: documents.filter((d) => d.created_at >= sinceDate),
    privateNotes: privateNotes.filter((n) => n.created_at >= sinceDate),
  }
}
