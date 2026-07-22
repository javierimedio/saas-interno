'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { privateNoteSchema, type PrivateNoteInput } from '../domain/person.schema'
import { addPrivateNote, type PrivateNoteRow } from '../infrastructure/private-notes.repository'

export async function addPrivateNoteAction(input: PrivateNoteInput): Promise<Result<PrivateNoteRow>> {
  const parsed = privateNoteSchema.safeParse(input)
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')
  }

  const session = await requireCurrentSession()
  const supabase = await createClient()

  try {
    const note = await addPrivateNote(supabase, session.organizationId, session.userId, parsed.data)
    revalidatePath(`/people/${parsed.data.personId}`)
    return ok(note)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo guardar la nota')
  }
}
