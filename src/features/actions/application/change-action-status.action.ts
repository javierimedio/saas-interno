'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { changeActionStatusSchema, type ChangeActionStatusInput } from '../domain/action.schema'
import { changeActionStatus, type ActionRow } from '../infrastructure/actions.repository'

export async function changeActionStatusAction(input: ChangeActionStatusInput): Promise<Result<ActionRow>> {
  const parsed = changeActionStatusSchema.safeParse(input)
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')
  }

  await requireCurrentSession()
  const supabase = await createClient()

  try {
    const action = await changeActionStatus(supabase, parsed.data)
    if (action.one_on_one_id) revalidatePath(`/one-on-ones/${action.one_on_one_id}`)
    revalidatePath(`/people/${action.person_id}`)
    return ok(action)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo actualizar la acción')
  }
}
