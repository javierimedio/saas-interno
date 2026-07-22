'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { offboardPersonSchema, type OffboardPersonInput } from '../domain/person.schema'
import { offboardPerson, type PersonRow } from '../infrastructure/people.repository'

/** Baja lógica (docs/01-analisis-funcional.md §1.4.2): nunca se borra a la persona. */
export async function offboardPersonAction(input: OffboardPersonInput): Promise<Result<PersonRow>> {
  const parsed = offboardPersonSchema.safeParse(input)
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')
  }

  const session = await requireCurrentSession()
  if (session.role !== 'admin' && session.role !== 'manager') {
    return err('No tienes permiso para dar de baja personas')
  }

  const supabase = await createClient()

  try {
    const person = await offboardPerson(supabase, parsed.data.id, parsed.data.terminationDate)
    revalidatePath('/people')
    revalidatePath(`/people/${person.id}`)
    return ok(person)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo dar de baja a la persona')
  }
}
