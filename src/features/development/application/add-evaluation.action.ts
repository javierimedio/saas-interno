'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { addEvaluationSchema, type AddEvaluationInput } from '../domain/development.schema'
import { addEvaluation, type EvaluationRow } from '../infrastructure/feedback-evaluations.repository'

export async function addEvaluationAction(input: AddEvaluationInput): Promise<Result<EvaluationRow>> {
  const parsed = addEvaluationSchema.safeParse(input)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')

  const session = await requireCurrentSession()
  const supabase = await createClient()

  try {
    const evaluation = await addEvaluation(supabase, session.organizationId, session.userId, parsed.data)
    revalidatePath('/development')
    revalidatePath(`/people/${parsed.data.personId}`)
    return ok(evaluation)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo registrar la evaluación')
  }
}
