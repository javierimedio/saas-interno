'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { addCareerMilestoneSchema, type AddCareerMilestoneInput } from '../domain/development.schema'
import { addCareerMilestone, type CareerMilestoneRow } from '../infrastructure/career-plans.repository'

export async function addCareerMilestoneAction(input: AddCareerMilestoneInput): Promise<Result<CareerMilestoneRow>> {
  const parsed = addCareerMilestoneSchema.safeParse(input)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')

  await requireCurrentSession()
  const supabase = await createClient()

  try {
    const milestone = await addCareerMilestone(supabase, parsed.data)
    revalidatePath('/development')
    return ok(milestone)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo añadir el hito')
  }
}
