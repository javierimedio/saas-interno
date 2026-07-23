'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { addGoalCheckinSchema, type AddGoalCheckinInput } from '../domain/goal.schema'
import { addGoalCheckin, type GoalCheckinRow } from '../infrastructure/goals.repository'

export async function addGoalCheckinAction(input: AddGoalCheckinInput): Promise<Result<GoalCheckinRow>> {
  const parsed = addGoalCheckinSchema.safeParse(input)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')

  const session = await requireCurrentSession()
  const supabase = await createClient()

  try {
    const checkin = await addGoalCheckin(supabase, session.userId, parsed.data)
    revalidatePath('/development')
    return ok(checkin)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo registrar el checkpoint')
  }
}
