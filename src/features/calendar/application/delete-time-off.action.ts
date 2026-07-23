'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { deleteTimeOff } from '../infrastructure/time-off.repository'

export async function deleteTimeOffAction(id: string): Promise<Result<null>> {
  await requireCurrentSession()
  const supabase = await createClient()

  try {
    await deleteTimeOff(supabase, id)
    revalidatePath('/calendar')
    return ok(null)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo eliminar la ausencia')
  }
}
