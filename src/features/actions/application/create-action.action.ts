'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { createActionSchema, type CreateActionInput } from '../domain/action.schema'
import { createAction, type ActionRow } from '../infrastructure/actions.repository'

export async function createActionAction(input: CreateActionInput): Promise<Result<ActionRow>> {
  const parsed = createActionSchema.safeParse(input)
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')
  }

  const session = await requireCurrentSession()
  const supabase = await createClient()

  try {
    const action = await createAction(supabase, session.organizationId, session.userId, parsed.data)
    if (parsed.data.oneOnOneId) revalidatePath(`/one-on-ones/${parsed.data.oneOnOneId}`)
    revalidatePath(`/people/${parsed.data.personId}`)
    return ok(action)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo crear la acción')
  }
}
