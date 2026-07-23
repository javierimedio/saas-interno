'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { deleteHoliday } from '../infrastructure/holidays.repository'

export async function deleteHolidayAction(id: string): Promise<Result<null>> {
  await requireCurrentSession()
  const supabase = await createClient()

  try {
    await deleteHoliday(supabase, id)
    revalidatePath('/calendar')
    return ok(null)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo eliminar el festivo')
  }
}
