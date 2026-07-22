import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/shared/infrastructure/supabase/database.types'
import type { PrivateNoteInput } from '../domain/person.schema'

type TypedClient = SupabaseClient<Database>
export type PrivateNoteRow = Database['public']['Tables']['people_private_notes']['Row']

/** RLS ya filtra a "solo el autor o un admin" (docs/03-modelo-datos.md §3.10 nota sobre people_private_notes). */
export async function listPrivateNotes(client: TypedClient, personId: string): Promise<PrivateNoteRow[]> {
  const { data, error } = await client
    .from('people_private_notes')
    .select('*')
    .eq('person_id', personId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`No se pudieron cargar las notas privadas: ${error.message}`)
  }

  return data ?? []
}

export async function addPrivateNote(
  client: TypedClient,
  organizationId: string,
  authorId: string,
  input: PrivateNoteInput,
): Promise<PrivateNoteRow> {
  const { data, error } = await client
    .from('people_private_notes')
    .insert({
      organization_id: organizationId,
      person_id: input.personId,
      author_id: authorId,
      note: input.note,
      visibility: input.visibility,
    })
    .select('*')
    .single()

  if (error) {
    throw new Error(`No se pudo guardar la nota: ${error.message}`)
  }

  return data
}
