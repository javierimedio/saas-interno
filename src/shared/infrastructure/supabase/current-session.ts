import { redirect } from 'next/navigation'

import { createClient } from './server-client'
import type { Database } from './database.types'

export type CurrentSession = {
  userId: string
  email: string
  organizationId: string
  organizationName: string
  role: Database['public']['Enums']['membership_role']
}

/**
 * Resuelve la sesión + membership del usuario actual. Si no tiene organización todavía
 * (registro sin completar el bootstrap), lo manda de vuelta a login — no debería ocurrir
 * en uso normal porque signUpAction crea la organización en el mismo flujo.
 */
export async function requireCurrentSession(): Promise<CurrentSession> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('role, organization_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (!membership) {
    redirect('/login')
  }

  const { data: organization } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', membership.organization_id)
    .single()

  return {
    userId: user.id,
    email: user.email ?? '',
    organizationId: membership.organization_id,
    organizationName: organization?.name ?? 'Organización',
    role: membership.role,
  }
}
