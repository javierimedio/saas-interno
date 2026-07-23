'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { renameDepartmentSchema, type RenameDepartmentInput } from '../domain/organization.schema'
import { updateDepartment, type DepartmentRow } from '@/features/people/infrastructure/departments.repository'

export async function renameDepartmentAction(input: RenameDepartmentInput): Promise<Result<DepartmentRow>> {
  const parsed = renameDepartmentSchema.safeParse(input)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')

  await requireCurrentSession()
  const supabase = await createClient()

  try {
    const department = await updateDepartment(supabase, parsed.data.id, parsed.data.name)
    revalidatePath('/settings')
    revalidatePath('/people')
    return ok(department)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo renombrar el departamento')
  }
}
