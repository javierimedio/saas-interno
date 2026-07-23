'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { requireCurrentSession } from '@/shared/infrastructure/supabase/current-session'
import { err, ok, type Result } from '@/shared/domain/result'
import { renameOrganizationSchema, type RenameOrganizationInput } from '../domain/organization.schema'
import { updateOrganizationName, type OrganizationRow } from '../infrastructure/organizations.repository'

export async function renameOrganizationAction(input: RenameOrganizationInput): Promise<Result<OrganizationRow>> {
  const parsed = renameOrganizationSchema.safeParse(input)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Datos inválidos')

  const session = await requireCurrentSession()
  const supabase = await createClient()

  try {
    const organization = await updateOrganizationName(supabase, session.organizationId, parsed.data.name)
    revalidatePath('/settings')
    return ok(organization)
  } catch (error) {
    return err(error instanceof Error ? error.message : 'No se pudo renombrar la organización')
  }
}
