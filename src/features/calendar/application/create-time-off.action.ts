'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { createTimeOffSchema, type CreateTimeOffInput } from '../domain/time-off.schema'
import { createTimeOff, type TimeOffRow } from '../infrastructure/time-off.repository'

export async function createTimeOffAction(input: CreateTimeOffInput): Promise<Result<TimeOffRow>> {
  const parsed = createTimeOffSchema.safeParse(input)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')

  const session = await requireCurrentSession()
  const supabase = await createClient()

  try {
    const timeOff = await createTimeOff(supabase, session.organizationId, session.userId, parsed.data)
    revalidatePath('/calendar')
    revalidatePath(`/people/${timeOff.person_id}`)
    return ok(timeOff)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo registrar la ausencia')
  }
}
