'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { workingHoursRecordSchema, type WorkingHoursRecordInput } from '../domain/person.schema'
import { addWorkingHoursRecord, type WorkingHoursRecordRow } from '../infrastructure/working-hours-records.repository'

/** Ledger append-only, misma filosofía que las revisiones salariales: solo añade filas, nunca edita ni borra. */
export async function addWorkingHoursRecordAction(input: WorkingHoursRecordInput): Promise<Result<WorkingHoursRecordRow>> {
  const parsed = workingHoursRecordSchema.safeParse(input)
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')
  }

  const session = await requireCurrentSession()
  if (session.role !== 'admin' && session.role !== 'manager') {
    return err('No tienes permiso para registrar cambios de jornada')
  }

  const supabase = await createClient()

  try {
    const record = await addWorkingHoursRecord(supabase, session.organizationId, session.userId, parsed.data)
    revalidatePath(`/people/${parsed.data.personId}`)
    return ok(record)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo registrar el cambio de jornada')
  }
}
