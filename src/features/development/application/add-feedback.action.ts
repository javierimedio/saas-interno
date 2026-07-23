'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { addFeedbackSchema, type AddFeedbackInput } from '../domain/development.schema'
import { addFeedback, type FeedbackEntryRow } from '../infrastructure/feedback-evaluations.repository'

export async function addFeedbackAction(input: AddFeedbackInput): Promise<Result<FeedbackEntryRow>> {
  const parsed = addFeedbackSchema.safeParse(input)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')

  const session = await requireCurrentSession()
  const supabase = await createClient()

  try {
    const feedback = await addFeedback(supabase, session.organizationId, session.userId, parsed.data)
    revalidatePath('/development')
    revalidatePath(`/people/${parsed.data.personId}`)
    return ok(feedback)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo añadir el feedback')
  }
}
