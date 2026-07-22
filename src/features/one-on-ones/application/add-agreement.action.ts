'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { addAgreementSchema, type AddAgreementInput } from '../domain/one-on-one.schema'
import { addAgreement, type AgreementRow } from '../infrastructure/agreements.repository'

export async function addAgreementAction(input: AddAgreementInput): Promise<Result<AgreementRow>> {
  const parsed = addAgreementSchema.safeParse(input)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')

  const session = await requireCurrentSession()
  const supabase = await createClient()

  try {
    const agreement = await addAgreement(supabase, parsed.data.oneOnOneId, session.userId, parsed.data.description)
    revalidatePath(`/one-on-ones/${parsed.data.oneOnOneId}`)
    return ok(agreement)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo guardar el acuerdo')
  }
}
