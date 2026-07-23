import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/shared/infrastructure/supabase/database.types'
import type { AddCareerMilestoneInput, CreateCareerPlanInput } from '../domain/development.schema'

type TypedClient = SupabaseClient<Database>
export type CareerPlanRow = Database['public']['Tables']['career_plans']['Row']
export type CareerMilestoneRow = Database['public']['Tables']['career_plan_milestones']['Row']

export async function listCareerPlansByPerson(client: TypedClient, personId: string): Promise<CareerPlanRow[]> {
  const { data, error } = await client
    .from('career_plans')
    .select('*')
    .eq('person_id', personId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`No se pudieron cargar los planes de carrera: ${error.message}`)
  return data ?? []
}

export async function listMilestones(client: TypedClient, careerPlanIds: string[]): Promise<CareerMilestoneRow[]> {
  if (careerPlanIds.length === 0) return []
  const { data, error } = await client
    .from('career_plan_milestones')
    .select('*')
    .in('career_plan_id', careerPlanIds)
    .order('target_date', { ascending: true, nullsFirst: false })

  if (error) throw new Error(`No se pudieron cargar los hitos: ${error.message}`)
  return data ?? []
}

export async function createCareerPlan(
  client: TypedClient,
  organizationId: string,
  createdBy: string,
  input: CreateCareerPlanInput,
): Promise<CareerPlanRow> {
  const { data, error } = await client
    .from('career_plans')
    .insert({
      organization_id: organizationId,
      person_id: input.personId,
      target_position: input.targetPosition,
      notes: input.notes || null,
      created_by: createdBy,
    })
    .select('*')
    .single()

  if (error) throw new Error(`No se pudo crear el plan de carrera: ${error.message}`)
  return data
}

export async function addCareerMilestone(client: TypedClient, input: AddCareerMilestoneInput): Promise<CareerMilestoneRow> {
  const { data, error } = await client
    .from('career_plan_milestones')
    .insert({
      career_plan_id: input.careerPlanId,
      title: input.title,
      target_date: input.targetDate || null,
    })
    .select('*')
    .single()

  if (error) throw new Error(`No se pudo añadir el hito: ${error.message}`)
  return data
}

export async function completeMilestone(client: TypedClient, id: string): Promise<CareerMilestoneRow> {
  const { data, error } = await client
    .from('career_plan_milestones')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw new Error(`No se pudo completar el hito: ${error.message}`)
  return data
}
