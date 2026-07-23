'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { addActionCommentSchema, type AddActionCommentInput } from '../domain/action.schema'
import { addActionComment, type ActionCommentRow } from '../infrastructure/actions.repository'

export async function addActionCommentAction(input: AddActionCommentInput): Promise<Result<ActionCommentRow>> {
  const parsed = addActionCommentSchema.safeParse(input)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')

  const session = await requireCurrentSession()
  const supabase = await createClient()

  try {
    const comment = await addActionComment(supabase, parsed.data.actionId, session.userId, parsed.data.comment)
    revalidatePath(`/actions/${parsed.data.actionId}`)
    return ok(comment)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo añadir el comentario')
  }
}
