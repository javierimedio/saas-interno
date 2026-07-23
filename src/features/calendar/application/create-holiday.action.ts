'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { createHolidaySchema, type CreateHolidayInput } from '../domain/time-off.schema'
import { createHoliday, type HolidayRow } from '../infrastructure/holidays.repository'

export async function createHolidayAction(input: CreateHolidayInput): Promise<Result<HolidayRow>> {
  const parsed = createHolidaySchema.safeParse(input)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')

  const session = await requireCurrentSession()
  const supabase = await createClient()

  try {
    const holiday = await createHoliday(supabase, session.organizationId, parsed.data)
    revalidatePath('/calendar')
    return ok(holiday)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo crear el festivo')
  }
}
