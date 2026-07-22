import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/shared/infrastructure/supabase/database.types'
import type { ChangeActionStatusInput, CreateActionInput } from '../domain/action.schema'

type TypedClient = SupabaseClient<Database>
export type ActionRow = Database['public']['Tables']['actions']['Row']

export async function listActionsByOneOnOne(client: TypedClient, oneOnOneId: string): Promise<ActionRow[]> {
  const { data, error } = await client
    .from('actions')
    .select('*')
    .eq('one_on_one_id', oneOnOneId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`No se pudieron cargar las acciones: ${error.message}`)
  return data ?? []
}

export async function listActionsByPerson(client: TypedClient, personId: string): Promise<ActionRow[]> {
  const { data, error } = await client
    .from('actions')
    .select('*')
    .eq('person_id', personId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`No se pudieron cargar las acciones: ${error.message}`)
  return data ?? []
}

export async function createAction(
  client: TypedClient,
  organizationId: string,
  createdBy: string,
  input: CreateActionInput,
): Promise<ActionRow> {
  const { data, error } = await client
    .from('actions')
    .insert({
      organization_id: organizationId,
      person_id: input.personId,
      assignee_id: input.assigneeId,
      one_on_one_id: input.oneOnOneId ?? null,
      title: input.title,
      description: input.description || null,
      priority: input.priority,
      due_date: input.dueDate || null,
      created_by: createdBy,
    })
    .select('*')
    .single()

  if (error) throw new Error(`No se pudo crear la acción: ${error.message}`)
  return data
}

export async function changeActionStatus(client: TypedClient, input: ChangeActionStatusInput): Promise<ActionRow> {
  const { data, error } = await client
    .from('actions')
    .update({
      status: input.status,
      blocked_reason: input.status === 'blocked' ? input.blockedReason : null,
      completed_at: input.status === 'completed' ? new Date().toISOString() : null,
    })
    .eq('id', input.id)
    .select('*')
    .single()

  if (error) throw new Error(`No se pudo actualizar la acción: ${error.message}`)
  return data
}
