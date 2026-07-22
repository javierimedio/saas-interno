'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { salaryRecordSchema, type SalaryRecordInput } from '../domain/person.schema'
import { addSalaryRecord, type SalaryRecordRow } from '../infrastructure/salary-records.repository'

/** Ledger append-only (docs/03-modelo-datos.md §3.4): solo añade filas, nunca edita ni borra. */
export async function addSalaryRecordAction(input: SalaryRecordInput): Promise<Result<SalaryRecordRow>> {
  const parsed = salaryRecordSchema.safeParse(input)
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')
  }

  const session = await requireCurrentSession()
  if (session.role !== 'admin' && session.role !== 'manager') {
    return err('No tienes permiso para registrar revisiones salariales')
  }

  const supabase = await createClient()

  try {
    const record = await addSalaryRecord(supabase, session.organizationId, session.userId, parsed.data)
    revalidatePath(`/people/${parsed.data.personId}`)
    return ok(record)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo registrar la revisión salarial')
  }
}
