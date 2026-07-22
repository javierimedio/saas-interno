import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/shared/infrastructure/supabase/database.types'
import type { SalaryRecordInput } from '../domain/person.schema'

type TypedClient = SupabaseClient<Database>
export type SalaryRecordRow = Database['public']['Tables']['salary_records']['Row']

/** Histórico completo, más reciente primero (docs/03-modelo-datos.md §3.4: nunca se pisa). */
export async function listSalaryRecords(client: TypedClient, personId: string): Promise<SalaryRecordRow[]> {
  const { data, error } = await client
    .from('salary_records')
    .select('*')
    .eq('person_id', personId)
    .order('effective_date', { ascending: false })

  if (error) {
    throw new Error(`No se pudo cargar el histórico salarial: ${error.message}`)
  }

  return data ?? []
}

export async function addSalaryRecord(
  client: TypedClient,
  organizationId: string,
  userId: string,
  input: SalaryRecordInput,
): Promise<SalaryRecordRow> {
  const { data, error } = await client
    .from('salary_records')
    .insert({
      organization_id: organizationId,
      person_id: input.personId,
      effective_date: input.effectiveDate,
      gross_annual_salary: input.grossAnnualSalary,
      currency: input.currency,
      reason: input.reason,
      notes: input.notes || null,
      created_by: userId,
    })
    .select('*')
    .single()

  if (error) {
    throw new Error(`No se pudo registrar la revisión salarial: ${error.message}`)
  }

  return data
}
