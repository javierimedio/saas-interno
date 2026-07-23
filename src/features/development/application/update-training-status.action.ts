'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { updateTrainingStatusSchema, type UpdateTrainingStatusInput } from '../domain/development.schema'
import { updateTrainingStatus, type TrainingRow } from '../infrastructure/trainings.repository'

export async function updateTrainingStatusAction(input: UpdateTrainingStatusInput): Promise<Result<TrainingRow>> {
  const parsed = updateTrainingStatusSchema.safeParse(input)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')

  await requireCurrentSession()
  const supabase = await createClient()

  try {
    const training = await updateTrainingStatus(supabase, parsed.data.id, parsed.data.status)
    revalidatePath('/development')
    revalidatePath(`/people/${training.person_id}`)
    return ok(training)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo actualizar la formación')
  }
}
