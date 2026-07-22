'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { createDepartment, type DepartmentRow } from '../infrastructure/departments.repository'

export async function createDepartmentAction(name: string): Promise<Result<DepartmentRow>> {
  const trimmed = name.trim()
  if (trimmed.length < 2) {
    return err('El nombre del departamento es obligatorio')
  }

  const session = await requireCurrentSession()
  const supabase = await createClient()

  try {
    const department = await createDepartment(supabase, session.organizationId, trimmed)
    revalidatePath('/people')
    return ok(department)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo crear el departamento')
  }
}
