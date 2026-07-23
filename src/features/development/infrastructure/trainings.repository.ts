import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/shared/infrastructure/supabase/database.types'
import type { CreateTrainingInput } from '../domain/development.schema'

type TypedClient = SupabaseClient<Database>
export type TrainingRow = Database['public']['Tables']['trainings']['Row']

export async function listTrainingsByPerson(client: TypedClient, personId: string): Promise<TrainingRow[]> {
  const { data, error } = await client
    .from('trainings')
    .select('*')
    .eq('person_id', personId)
    .order('start_date', { ascending: false, nullsFirst: false })

  if (error) throw new Error(`No se pudieron cargar las formaciones: ${error.message}`)
  return data ?? []
}

export async function listTrainingsGlobal(client: TypedClient, organizationId: string): Promise<TrainingRow[]> {
  const { data, error } = await client
    .from('trainings')
    .select('*')
    .eq('organization_id', organizationId)
    .order('start_date', { ascending: false, nullsFirst: false })

  if (error) throw new Error(`No se pudieron cargar las formaciones: ${error.message}`)
  return data ?? []
}

export async function createTraining(
  client: TypedClient,
  organizationId: string,
  createdBy: string,
  input: CreateTrainingInput,
): Promise<TrainingRow> {
  const { data, error } = await client
    .from('trainings')
    .insert({
      organization_id: organizationId,
      person_id: input.personId,
      title: input.title,
      provider: input.provider || null,
      status: input.status,
      start_date: input.startDate || null,
      end_date: input.endDate || null,
      created_by: createdBy,
    })
    .select('*')
    .single()

  if (error) throw new Error(`No se pudo crear la formación: ${error.message}`)
  return data
}

export async function updateTrainingStatus(client: TypedClient, id: string, status: TrainingRow['status']): Promise<TrainingRow> {
  const { data, error } = await client.from('trainings').update({ status }).eq('id', id).select('*').single()
  if (error) throw new Error(`No se pudo actualizar la formación: ${error.message}`)
  return data
}
