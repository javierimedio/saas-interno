'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { createPersonSchema, type CreatePersonInput } from '../domain/person.schema'
import { createPersonWithInitialSalary, type PersonRow } from '../infrastructure/people.repository'

export async function createPersonAction(input: CreatePersonInput): Promise<Result<PersonRow>> {
  const parsed = createPersonSchema.safeParse(input)
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')
  }

  const session = await requireCurrentSession()
  if (session.role !== 'admin' && session.role !== 'manager') {
    return err('No tienes permiso para dar de alta personas')
  }

  const supabase = await createClient()

  try {
    const person = await createPersonWithInitialSalary(supabase, session.organizationId, parsed.data)
    revalidatePath('/people')
    return ok(person)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo dar de alta a la persona')
  }
}
