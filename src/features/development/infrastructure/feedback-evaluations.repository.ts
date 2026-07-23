import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/shared/infrastructure/supabase/database.types'
import type { AddEvaluationInput, AddFeedbackInput } from '../domain/development.schema'

type TypedClient = SupabaseClient<Database>
export type FeedbackEntryRow = Database['public']['Tables']['feedback_entries']['Row']
export type EvaluationRow = Database['public']['Tables']['evaluations']['Row']

export async function listFeedbackByPerson(client: TypedClient, personId: string): Promise<FeedbackEntryRow[]> {
  const { data, error } = await client
    .from('feedback_entries')
    .select('*')
    .eq('person_id', personId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`No se pudo cargar el feedback: ${error.message}`)
  return data ?? []
}

export async function addFeedback(
  client: TypedClient,
  organizationId: string,
  authorId: string,
  input: AddFeedbackInput,
): Promise<FeedbackEntryRow> {
  const { data, error } = await client
    .from('feedback_entries')
    .insert({
      organization_id: organizationId,
      person_id: input.personId,
      author_id: authorId,
      text: input.text,
      visibility: input.visibility,
    })
    .select('*')
    .single()

  if (error) throw new Error(`No se pudo añadir el feedback: ${error.message}`)
  return data
}

export async function listEvaluationsByPerson(client: TypedClient, personId: string): Promise<EvaluationRow[]> {
  const { data, error } = await client
    .from('evaluations')
    .select('*')
    .eq('person_id', personId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`No se pudieron cargar las evaluaciones: ${error.message}`)
  return data ?? []
}

export async function addEvaluation(
  client: TypedClient,
  organizationId: string,
  evaluatorId: string,
  input: AddEvaluationInput,
): Promise<EvaluationRow> {
  const { data, error } = await client
    .from('evaluations')
    .insert({
      organization_id: organizationId,
      person_id: input.personId,
      period: input.period,
      result: input.result,
      evaluator_id: evaluatorId,
      notes: input.notes || null,
    })
    .select('*')
    .single()

  if (error) throw new Error(`No se pudo registrar la evaluación: ${error.message}`)
  return data
}
