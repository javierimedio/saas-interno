import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/shared/infrastructure/supabase/database.types'
import type { CreateTimeOffInput } from '../domain/time-off.schema'

type TypedClient = SupabaseClient<Database>
export type TimeOffRow = Database['public']['Tables']['time_off']['Row']

export async function listTimeOffInRange(
  client: TypedClient,
  organizationId: string,
  startDate: string,
  endDate: string,
): Promise<TimeOffRow[]> {
  const { data, error } = await client
    .from('time_off')
    .select('*')
    .eq('organization_id', organizationId)
    .lte('start_date', endDate)
    .gte('end_date', startDate)
    .order('start_date', { ascending: true })

  if (error) throw new Error(`No se pudieron cargar las ausencias: ${error.message}`)
  return data ?? []
}

export async function listTimeOffByPerson(client: TypedClient, personId: string): Promise<TimeOffRow[]> {
  const { data, error } = await client
    .from('time_off')
    .select('*')
    .eq('person_id', personId)
    .order('start_date', { ascending: false })

  if (error) throw new Error(`No se pudieron cargar las ausencias: ${error.message}`)
  return data ?? []
}

export async function createTimeOff(
  client: TypedClient,
  organizationId: string,
  createdBy: string,
  input: CreateTimeOffInput,
): Promise<TimeOffRow> {
  const { data, error } = await client
    .from('time_off')
    .insert({
      organization_id: organizationId,
      person_id: input.personId,
      type: input.type,
      start_date: input.startDate,
      end_date: input.endDate,
      notes: input.notes || null,
      created_by: createdBy,
    })
    .select('*')
    .single()

  if (error) throw new Error(`No se pudo registrar la ausencia: ${error.message}`)
  return data
}

export async function deleteTimeOff(client: TypedClient, id: string): Promise<void> {
  const { error } = await client.from('time_off').delete().eq('id', id)
  if (error) throw new Error(`No se pudo eliminar la ausencia: ${error.message}`)
}
