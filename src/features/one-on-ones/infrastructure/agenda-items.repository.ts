import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/shared/infrastructure/supabase/database.types'

type TypedClient = SupabaseClient<Database>
export type AgendaItemRow = Database['public']['Tables']['one_on_one_agenda_items']['Row']

export async function listAgendaItems(client: TypedClient, oneOnOneId: string): Promise<AgendaItemRow[]> {
  const { data, error } = await client
    .from('one_on_one_agenda_items')
    .select('*')
    .eq('one_on_one_id', oneOnOneId)
    .order('position', { ascending: true })

  if (error) throw new Error(`No se pudo cargar la agenda: ${error.message}`)
  return data ?? []
}

export async function addAgendaItem(
  client: TypedClient,
  oneOnOneId: string,
  topic: string,
  source: string = 'manual',
): Promise<AgendaItemRow> {
  const existing = await listAgendaItems(client, oneOnOneId)
  const position = existing.length

  const { data, error } = await client
    .from('one_on_one_agenda_items')
    .insert({ one_on_one_id: oneOnOneId, topic, source, position })
    .select('*')
    .single()

  if (error) throw new Error(`No se pudo añadir el punto de agenda: ${error.message}`)
  return data
}

export async function toggleAgendaItem(client: TypedClient, id: string, discussed: boolean): Promise<AgendaItemRow> {
  const { data, error } = await client
    .from('one_on_one_agenda_items')
    .update({ discussed })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(`No se pudo actualizar el punto de agenda: ${error.message}`)
  return data
}

export async function removeAgendaItem(client: TypedClient, id: string): Promise<void> {
  const { error } = await client.from('one_on_one_agenda_items').delete().eq('id', id)
  if (error) throw new Error(`No se pudo eliminar el punto de agenda: ${error.message}`)
}
