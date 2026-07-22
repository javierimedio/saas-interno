import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/shared/infrastructure/supabase/database.types'
import type { CreatePersonInput, PeopleListFilters, UpdatePersonInput } from '../domain/person.schema'

type TypedClient = SupabaseClient<Database>
export type PersonRow = Database['public']['Tables']['people']['Row']

export const PAGE_SIZE = 20

export type PeopleListResult = {
  people: PersonRow[]
  total: number
  page: number
  pageSize: number
}

export async function listPeople(
  client: TypedClient,
  organizationId: string,
  filters: PeopleListFilters,
): Promise<PeopleListResult> {
  const page = filters.page ?? 1
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = client
    .from('people')
    .select('*', { count: 'exact' })
    .eq('organization_id', organizationId)
    .order('first_name', { ascending: true })
    .range(from, to)

  if (filters.q) {
    const term = filters.q.replace(/[%_]/g, '')
    query = query.or(
      `first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%,position_title.ilike.%${term}%`,
    )
  }

  if (filters.departmentId) {
    query = query.eq('department_id', filters.departmentId)
  }

  if (filters.status) {
    query = query.eq('employment_status', filters.status)
  }

  const { data, error, count } = await query

  if (error) {
    throw new Error(`No se pudo cargar el listado de personas: ${error.message}`)
  }

  return { people: data ?? [], total: count ?? 0, page, pageSize: PAGE_SIZE }
}

export async function getPersonById(client: TypedClient, id: string): Promise<PersonRow | null> {
  const { data, error } = await client.from('people').select('*').eq('id', id).maybeSingle()

  if (error) {
    throw new Error(`No se pudo cargar la persona: ${error.message}`)
  }

  return data
}

/** Alta atómica vía la función de Postgres create_person_with_initial_salary (docs/03-modelo-datos.md §3.4). */
export async function createPersonWithInitialSalary(
  client: TypedClient,
  organizationId: string,
  input: CreatePersonInput,
): Promise<PersonRow> {
  const { data, error } = await client.rpc('create_person_with_initial_salary', {
    p_organization_id: organizationId,
    p_first_name: input.firstName,
    p_last_name: input.lastName,
    p_email: input.email,
    p_phone: input.phone || null,
    p_position_title: input.positionTitle,
    p_department_id: input.departmentId ?? null,
    p_manager_id: input.managerId ?? null,
    p_hire_date: input.hireDate,
    p_contract_type: input.contractType,
    p_gross_annual_salary: input.grossAnnualSalary,
    p_currency: input.currency,
  })

  if (error) {
    throw new Error(`No se pudo dar de alta a la persona: ${error.message}`)
  }

  return data
}

export async function updatePerson(client: TypedClient, input: UpdatePersonInput): Promise<PersonRow> {
  const { data, error } = await client
    .from('people')
    .update({
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone: input.phone || null,
      position_title: input.positionTitle,
      department_id: input.departmentId ?? null,
      manager_id: input.managerId ?? null,
      hire_date: input.hireDate,
      contract_type: input.contractType,
    })
    .eq('id', input.id)
    .select('*')
    .single()

  if (error) {
    throw new Error(`No se pudo actualizar la persona: ${error.message}`)
  }

  return data
}

/** Baja lógica (docs/01-analisis-funcional.md §1.4.2): nunca se borra, solo cambia el estado. */
export async function offboardPerson(
  client: TypedClient,
  id: string,
  terminationDate: string,
): Promise<PersonRow> {
  const { data, error } = await client
    .from('people')
    .update({ employment_status: 'offboarded', termination_date: terminationDate })
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw new Error(`No se pudo dar de baja a la persona: ${error.message}`)
  }

  return data
}

export async function getPeopleNamesByIds(
  client: TypedClient,
  ids: string[],
): Promise<Pick<PersonRow, 'id' | 'first_name' | 'last_name'>[]> {
  if (ids.length === 0) return []

  const { data, error } = await client.from('people').select('id, first_name, last_name').in('id', ids)

  if (error) {
    throw new Error(`No se pudieron cargar los responsables: ${error.message}`)
  }

  return data ?? []
}

export async function listManagerCandidates(
  client: TypedClient,
  organizationId: string,
  excludePersonId?: string,
): Promise<Pick<PersonRow, 'id' | 'first_name' | 'last_name' | 'position_title'>[]> {
  let query = client
    .from('people')
    .select('id, first_name, last_name, position_title')
    .eq('organization_id', organizationId)
    .eq('employment_status', 'active')
    .order('first_name', { ascending: true })

  if (excludePersonId) {
    query = query.neq('id', excludePersonId)
  }

  const { data, error } = await query
  if (error) {
    throw new Error(`No se pudieron cargar los responsables: ${error.message}`)
  }
  return data ?? []
}
