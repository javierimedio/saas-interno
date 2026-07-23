'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireAdmin } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { linkPersonToUserSchema, type LinkPersonToUserInput } from '../domain/person.schema'
import { linkPersonToUser, type PersonRow } from '../infrastructure/people.repository'

/**
 * Vincula visualmente un miembro con su ficha de persona (Configuración → Miembros), sin
 * necesidad de editar people.user_id a mano en Supabase.
 */
export async function linkPersonToUserAction(input: LinkPersonToUserInput): Promise<Result<PersonRow>> {
  const parsed = linkPersonToUserSchema.safeParse(input)
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')
  }

  const session = await requireAdmin()
  const supabase = await createClient()

  try {
    const person = await linkPersonToUser(supabase, session.organizationId, parsed.data.personId, parsed.data.userId)
    revalidatePath('/settings')
    revalidatePath('/people')
    revalidatePath(`/people/${person.id}`)
    return ok(person)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo vincular la ficha')
  }
}
