'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { createGoalSchema, type CreateGoalInput } from '../domain/goal.schema'
import { createGoal, type GoalRow } from '../infrastructure/goals.repository'

export async function createGoalAction(input: CreateGoalInput): Promise<Result<GoalRow>> {
  const parsed = createGoalSchema.safeParse(input)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')

  const session = await requireCurrentSession()
  const supabase = await createClient()

  try {
    const goal = await createGoal(supabase, session.organizationId, session.userId, parsed.data)
    revalidatePath('/development')
    revalidatePath(`/people/${goal.person_id}`)
    return ok(goal)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo crear el objetivo')
  }
}
