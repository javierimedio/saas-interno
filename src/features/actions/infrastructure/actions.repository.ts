import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/shared/infrastructure/supabase/database.types'
import type { ActionListFilters, ChangeActionStatusInput, CreateActionInput, UpdateActionInput } from '../domain/action.schema'

type TypedClient = SupabaseClient<Database>
export type ActionRow = Database['public']['Tables']['actions']['Row']
export type ActionCommentRow = Database['public']['Tables']['action_comments']['Row']

export async function listActionsGlobal(
  client: TypedClient,
  organizationId: string,
  filters: ActionListFilters,
): Promise<ActionRow[]> {
  let query = client
    .from('actions')
    .select('*')
    .eq('organization_id', organizationId)
    .order('due_date', { ascending: true, nullsFirst: false })

  if (filters.personId) query = query.eq('person_id', filters.personId)
  if (filters.assigneeId) query = query.eq('assignee_id', filters.assigneeId)
  if (filters.priority) query = query.eq('priority', filters.priority)
  if (filters.overdueOnly) {
    query = query.lt('due_date', new Date().toISOString().slice(0, 10)).not('status', 'in', '(completed,cancelled)')
  }

  const { data, error } = await query
  if (error) throw new Error(`No se pudieron cargar las acciones: ${error.message}`)
  return data ?? []
}

export async function getActionById(client: TypedClient, id: string): Promise<ActionRow | null> {
  const { data, error } = await client.from('actions').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`No se pudo cargar la acción: ${error.message}`)
  return data
}

export async function updateAction(client: TypedClient, input: UpdateActionInput): Promise<ActionRow> {
  const { data, error } = await client
    .from('actions')
    .update({
      title: input.title,
      description: input.description || null,
      priority: input.priority,
      due_date: input.dueDate || null,
      assignee_id: input.assigneeId,
    })
    .eq('id', input.id)
    .select('*')
    .single()

  if (error) throw new Error(`No se pudo actualizar la acción: ${error.message}`)
  return data
}

export async function listActionComments(client: TypedClient, actionId: string): Promise<ActionCommentRow[]> {
  const { data, error } = await client
    .from('action_comments')
    .select('*')
    .eq('action_id', actionId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(`No se pudieron cargar los comentarios: ${error.message}`)
  return data ?? []
}

export async function addActionComment(
  client: TypedClient,
  actionId: string,
  authorId: string,
  comment: string,
): Promise<ActionCommentRow> {
  const { data, error } = await client
    .from('action_comments')
    .insert({ action_id: actionId, author_id: authorId, comment })
    .select('*')
    .single()

  if (error) throw new Error(`No se pudo añadir el comentario: ${error.message}`)
  return data
}

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
