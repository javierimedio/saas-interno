'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import {
  addAgendaItemSchema,
  removeAgendaItemSchema,
  toggleAgendaItemSchema,
  type AddAgendaItemInput,
  type RemoveAgendaItemInput,
  type ToggleAgendaItemInput,
} from '../domain/one-on-one.schema'
import {
  addAgendaItem,
  removeAgendaItem,
  toggleAgendaItem,
  type AgendaItemRow,
} from '../infrastructure/agenda-items.repository'

export async function addAgendaItemAction(input: AddAgendaItemInput): Promise<Result<AgendaItemRow>> {
  const parsed = addAgendaItemSchema.safeParse(input)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')

  await requireCurrentSession()
  const supabase = await createClient()

  try {
    const item = await addAgendaItem(supabase, parsed.data.oneOnOneId, parsed.data.topic)
    revalidatePath(`/one-on-ones/${parsed.data.oneOnOneId}`)
    return ok(item)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo añadir el punto de agenda')
  }
}

export async function toggleAgendaItemAction(
  input: ToggleAgendaItemInput,
  oneOnOneId: string,
): Promise<Result<AgendaItemRow>> {
  const parsed = toggleAgendaItemSchema.safeParse(input)
  if (!parsed.success) return err('Datos inválidos')

  await requireCurrentSession()
  const supabase = await createClient()

  try {
    const item = await toggleAgendaItem(supabase, parsed.data.id, parsed.data.discussed)
    revalidatePath(`/one-on-ones/${oneOnOneId}`)
    return ok(item)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo actualizar el punto de agenda')
  }
}

export async function removeAgendaItemAction(
  input: RemoveAgendaItemInput,
  oneOnOneId: string,
): Promise<Result<null>> {
  const parsed = removeAgendaItemSchema.safeParse(input)
  if (!parsed.success) return err('Datos inválidos')

  await requireCurrentSession()
  const supabase = await createClient()

  try {
    await removeAgendaItem(supabase, parsed.data.id)
    revalidatePath(`/one-on-ones/${oneOnOneId}`)
    return ok(null)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo eliminar el punto de agenda')
  }
}
