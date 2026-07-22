'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { updatePersonSchema, type UpdatePersonInput } from '../domain/person.schema'
import { updatePerson, type PersonRow } from '../infrastructure/people.repository'

export async function updatePersonAction(input: UpdatePersonInput): Promise<Result<PersonRow>> {
  const parsed = updatePersonSchema.safeParse(input)
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')
  }

  await requireCurrentSession()
  const supabase = await createClient()

  try {
    const person = await updatePerson(supabase, parsed.data)
    revalidatePath('/people')
    revalidatePath(`/people/${person.id}`)
    return ok(person)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo actualizar la persona')
  }
}
