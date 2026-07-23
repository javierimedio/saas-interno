import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/shared/infrastructure/supabase/database.types'
import type { AssessCompetencyInput, CreateCompetencyInput } from '../domain/development.schema'

type TypedClient = SupabaseClient<Database>
export type CompetencyRow = Database['public']['Tables']['competencies']['Row']
export type PersonCompetencyRow = Database['public']['Tables']['person_competencies']['Row']

export async function listCompetencies(client: TypedClient, organizationId: string): Promise<CompetencyRow[]> {
  const { data, error } = await client
    .from('competencies')
    .select('*')
    .eq('organization_id', organizationId)
    .order('name', { ascending: true })

  if (error) throw new Error(`No se pudieron cargar las competencias: ${error.message}`)
  return data ?? []
}

export async function createCompetency(
  client: TypedClient,
  organizationId: string,
  input: CreateCompetencyInput,
): Promise<CompetencyRow> {
  const { data, error } = await client
    .from('competencies')
    .insert({ organization_id: organizationId, name: input.name, description: input.description || null })
    .select('*')
    .single()

  if (error) throw new Error(`No se pudo crear la competencia: ${error.message}`)
  return data
}

export async function listPersonCompetencies(client: TypedClient, personId: string): Promise<PersonCompetencyRow[]> {
  const { data, error } = await client
    .from('person_competencies')
    .select('*')
    .eq('person_id', personId)
    .order('assessed_at', { ascending: false })

  if (error) throw new Error(`No se pudieron cargar las evaluaciones de competencias: ${error.message}`)
  return data ?? []
}

export async function assessCompetency(
  client: TypedClient,
  organizationId: string,
  assessedBy: string,
  input: AssessCompetencyInput,
): Promise<PersonCompetencyRow> {
  const { data, error } = await client
    .from('person_competencies')
    .insert({
      organization_id: organizationId,
      person_id: input.personId,
      competency_id: input.competencyId,
      level: input.level,
      assessed_by: assessedBy,
      notes: input.notes || null,
    })
    .select('*')
    .single()

  if (error) throw new Error(`No se pudo registrar la evaluación: ${error.message}`)
  return data
}
