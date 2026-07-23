import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/shared/infrastructure/supabase/database.types'
import type { WorkingHoursRecordInput } from '../domain/person.schema'

type TypedClient = SupabaseClient<Database>
export type WorkingHoursRecordRow = Database['public']['Tables']['working_hours_records']['Row']

/** Histórico completo, más reciente primero (misma filosofía que salary_records: nunca se pisa). */
export async function listWorkingHoursRecords(client: TypedClient, personId: string): Promise<WorkingHoursRecordRow[]> {
  const { data, error } = await client
    .from('working_hours_records')
    .select('*')
    .eq('person_id', personId)
    .order('effective_date', { ascending: false })

  if (error) {
    throw new Error(`No se pudo cargar el histórico de jornada: ${error.message}`)
  }

  return data ?? []
}

/** Todo el histórico de jornada de la organización, para agregados de dashboard. */
export async function listWorkingHoursRecordsGlobal(
  client: TypedClient,
  organizationId: string,
): Promise<WorkingHoursRecordRow[]> {
  const { data, error } = await client
    .from('working_hours_records')
    .select('*')
    .eq('organization_id', organizationId)
    .order('effective_date', { ascending: false })

  if (error) {
    throw new Error(`No se pudo cargar el histórico de jornada: ${error.message}`)
  }

  return data ?? []
}

export async function addWorkingHoursRecord(
  client: TypedClient,
  organizationId: string,
  userId: string,
  input: WorkingHoursRecordInput,
): Promise<WorkingHoursRecordRow> {
  const { data, error } = await client
    .from('working_hours_records')
    .insert({
      organization_id: organizationId,
      person_id: input.personId,
      effective_date: input.effectiveDate,
      weekly_hours: input.weeklyHours,
      working_percentage: input.workingPercentage ?? null,
      reason: input.reason,
      notes: input.notes || null,
      created_by: userId,
    })
    .select('*')
    .single()

  if (error) {
    throw new Error(`No se pudo registrar el cambio de jornada: ${error.message}`)
  }

  return data
}
