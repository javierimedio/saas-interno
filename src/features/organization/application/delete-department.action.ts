'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { deleteDepartment } from '@/features/people/infrastructure/departments.repository'

export async function deleteDepartmentAction(id: string): Promise<Result<null>> {
  await requireCurrentSession()
  const supabase = await createClient()

  try {
    await deleteDepartment(supabase, id)
    revalidatePath('/settings')
    revalidatePath('/people')
    return ok(null)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo eliminar el departamento')
  }
}
