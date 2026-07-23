'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { assessCompetencySchema, type AssessCompetencyInput } from '../domain/development.schema'
import { assessCompetency, type PersonCompetencyRow } from '../infrastructure/competencies.repository'

export async function assessCompetencyAction(input: AssessCompetencyInput): Promise<Result<PersonCompetencyRow>> {
  const parsed = assessCompetencySchema.safeParse(input)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')

  const session = await requireCurrentSession()
  const supabase = await createClient()

  try {
    const assessment = await assessCompetency(supabase, session.organizationId, session.userId, parsed.data)
    revalidatePath('/development')
    revalidatePath(`/people/${parsed.data.personId}`)
    return ok(assessment)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo registrar la evaluación')
  }
}
