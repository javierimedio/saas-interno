'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { updateGoalStatusSchema, type UpdateGoalStatusInput } from '../domain/goal.schema'
import { updateGoalStatus, type GoalRow } from '../infrastructure/goals.repository'

export async function updateGoalStatusAction(input: UpdateGoalStatusInput): Promise<Result<GoalRow>> {
  const parsed = updateGoalStatusSchema.safeParse(input)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')

  await requireCurrentSession()
  const supabase = await createClient()

  try {
    const goal = await updateGoalStatus(supabase, parsed.data.id, parsed.data.status)
    revalidatePath('/development')
    revalidatePath(`/people/${goal.person_id}`)
    return ok(goal)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo actualizar el objetivo')
  }
}
