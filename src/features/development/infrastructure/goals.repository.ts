import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/shared/infrastructure/supabase/database.types'
import type { AddGoalCheckinInput, CreateGoalInput } from '../domain/goal.schema'

type TypedClient = SupabaseClient<Database>
export type GoalRow = Database['public']['Tables']['goals']['Row']
export type GoalCheckinRow = Database['public']['Tables']['goal_checkins']['Row']

export async function listGoalsByPerson(client: TypedClient, personId: string): Promise<GoalRow[]> {
  const { data, error } = await client
    .from('goals')
    .select('*')
    .eq('person_id', personId)
    .order('year', { ascending: false })

  if (error) throw new Error(`No se pudieron cargar los objetivos: ${error.message}`)
  return data ?? []
}

export async function listGoalsGlobal(client: TypedClient, organizationId: string): Promise<GoalRow[]> {
  const { data, error } = await client
    .from('goals')
    .select('*')
    .eq('organization_id', organizationId)
    .order('year', { ascending: false })

  if (error) throw new Error(`No se pudieron cargar los objetivos: ${error.message}`)
  return data ?? []
}

export async function listCheckinsForGoals(client: TypedClient, goalIds: string[]): Promise<GoalCheckinRow[]> {
  if (goalIds.length === 0) return []
  const { data, error } = await client
    .from('goal_checkins')
    .select('*')
    .in('goal_id', goalIds)
    .order('checkin_date', { ascending: true })

  if (error) throw new Error(`No se pudieron cargar los checkpoints: ${error.message}`)
  return data ?? []
}

export async function createGoal(
  client: TypedClient,
  organizationId: string,
  createdBy: string,
  input: CreateGoalInput,
): Promise<GoalRow> {
  const { data, error } = await client
    .from('goals')
    .insert({
      organization_id: organizationId,
      person_id: input.personId,
      title: input.title,
      description: input.description || null,
      category: input.category || null,
      year: input.year,
      start_date: input.startDate,
      end_date: input.endDate,
      created_by: createdBy,
    })
    .select('*')
    .single()

  if (error) throw new Error(`No se pudo crear el objetivo: ${error.message}`)
  return data
}

export async function updateGoalStatus(client: TypedClient, id: string, status: GoalRow['status']): Promise<GoalRow> {
  const { data, error } = await client.from('goals').update({ status }).eq('id', id).select('*').single()
  if (error) throw new Error(`No se pudo actualizar el objetivo: ${error.message}`)
  return data
}

export async function addGoalCheckin(
  client: TypedClient,
  createdBy: string,
  input: AddGoalCheckinInput,
): Promise<GoalCheckinRow> {
  const { data, error } = await client
    .from('goal_checkins')
    .insert({
      goal_id: input.goalId,
      progress_percent: input.progressPercent,
      comment: input.comment || null,
      created_by: createdBy,
    })
    .select('*')
    .single()

  if (error) throw new Error(`No se pudo registrar el checkpoint: ${error.message}`)
  return data
}
