'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { createTrainingSchema, type CreateTrainingInput } from '../domain/development.schema'
import { createTraining, type TrainingRow } from '../infrastructure/trainings.repository'

export async function createTrainingAction(input: CreateTrainingInput): Promise<Result<TrainingRow>> {
  const parsed = createTrainingSchema.safeParse(input)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')

  const session = await requireCurrentSession()
  const supabase = await createClient()

  try {
    const training = await createTraining(supabase, session.organizationId, session.userId, parsed.data)
    revalidatePath('/development')
    revalidatePath(`/people/${training.person_id}`)
    return ok(training)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo crear la formación')
  }
}
