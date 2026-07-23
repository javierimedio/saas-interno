'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { createCompetencySchema, type CreateCompetencyInput } from '../domain/development.schema'
import { createCompetency, type CompetencyRow } from '../infrastructure/competencies.repository'

export async function createCompetencyAction(input: CreateCompetencyInput): Promise<Result<CompetencyRow>> {
  const parsed = createCompetencySchema.safeParse(input)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')

  const session = await requireCurrentSession()
  const supabase = await createClient()

  try {
    const competency = await createCompetency(supabase, session.organizationId, parsed.data)
    revalidatePath('/development')
    return ok(competency)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo crear la competencia')
  }
}
