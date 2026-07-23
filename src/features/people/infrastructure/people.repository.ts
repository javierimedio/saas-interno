import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/shared/infrastructure/supabase/database.types'
import type { CreatePersonInput, UpdatePersonInput } from '../domain/person.schema'

type TypedClient = SupabaseClient<Database>
export type PersonRow = Database['public']['Tables']['people']['Row']

export async function getPersonById(client: TypedClient, id: string): Promise<PersonRow | null> {
  const { data, error } = await client.from('people').select('*').eq('id', id).maybeSingle()

  if (error) {
    throw new Error(`No se pudo cargar la persona: ${error.message}`)
  }

  return data
}

/** Alta atómica vía la función de Postgres create_person_with_initial_salary (docs/03-modelo-datos.md §3.4).
 * employee_code/birth_date no forman parte de la firma de esa función (no se ha tocado el
 * esquema): se completan con un update inmediato tras el alta, igual que hace la importación. */
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

  if (input.employeeCode || input.birthDate) {
    const { data: updated, error: updateError } = await client
      .from('people')
      .update({
        employee_code: input.employeeCode || null,
        birth_date: input.birthDate || null,
      })
      .eq('id', data.id)
      .select('*')
      .single()

    if (updateError) {
      throw new Error(`Persona creada, pero no se pudo guardar el código de empleado/fecha de nacimiento: ${updateError.message}`)
    }
    return updated
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
      employee_code: input.employeeCode || null,
      birth_date: input.birthDate || null,
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

/**
 * Vincula una ficha existente con el usuario de una membership (Configuración → Miembros),
 * para no depender de editar people.user_id a mano en Supabase. people.user_id no tiene una
 * constraint unique en el esquema, así que se comprueba aquí para no dejar dos fichas
 * apuntando al mismo usuario.
 */
export async function linkPersonToUser(
  client: TypedClient,
  organizationId: string,
  personId: string,
  userId: string,
): Promise<PersonRow> {
  const { data: existing, error: existingError } = await client
    .from('people')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existingError) {
    throw new Error(`No se pudo comprobar la vinculación: ${existingError.message}`)
  }
  if (existing && existing.id !== personId) {
    throw new Error('Ese usuario ya tiene una ficha vinculada')
  }

  const { data, error } = await client.from('people').update({ user_id: userId }).eq('id', personId).select('*').single()

  if (error) {
    throw new Error(`No se pudo vincular la ficha: ${error.message}`)
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

/** Roster completo sin paginar, para agregados de dashboard/calendario (KPIs, cumpleaños, altas). */
export async function listAllPeople(client: TypedClient, organizationId: string): Promise<PersonRow[]> {
  const { data, error } = await client
    .from('people')
    .select('*')
    .eq('organization_id', organizationId)
    .order('first_name', { ascending: true })

  if (error) {
    throw new Error(`No se pudo cargar el roster: ${error.message}`)
  }
  return data ?? []
}
