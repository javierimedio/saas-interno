'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { createCareerPlanSchema, type CreateCareerPlanInput } from '../domain/development.schema'
import { createCareerPlan, type CareerPlanRow } from '../infrastructure/career-plans.repository'

export async function createCareerPlanAction(input: CreateCareerPlanInput): Promise<Result<CareerPlanRow>> {
  const parsed = createCareerPlanSchema.safeParse(input)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')

  const session = await requireCurrentSession()
  const supabase = await createClient()

  try {
    const plan = await createCareerPlan(supabase, session.organizationId, session.userId, parsed.data)
    revalidatePath('/development')
    revalidatePath(`/people/${plan.person_id}`)
    return ok(plan)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo crear el plan de carrera')
  }
}
