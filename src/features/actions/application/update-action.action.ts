'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { updateActionSchema, type UpdateActionInput } from '../domain/action.schema'
import { updateAction, type ActionRow } from '../infrastructure/actions.repository'

export async function updateActionAction(input: UpdateActionInput): Promise<Result<ActionRow>> {
  const parsed = updateActionSchema.safeParse(input)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')

  await requireCurrentSession()
  const supabase = await createClient()

  try {
    const action = await updateAction(supabase, parsed.data)
    revalidatePath('/actions')
    revalidatePath(`/actions/${action.id}`)
    revalidatePath(`/people/${action.person_id}`)
    return ok(action)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo actualizar la acción')
  }
}
