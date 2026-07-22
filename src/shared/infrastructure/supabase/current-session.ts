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

type MembershipRow = { role: Database['public']['Enums']['membership_role']; organization_id: string }

/**
 * Si el usuario autenticado todavía no tiene membership, la crea (docs/02-arquitectura.md
 * §2.7: el primer acceso arranca la organización). Esto puede ocurrir en el primer login
 * normal (sin confirmación de email) o, con confirmación de email activada, en la primera
 * visita después de confirmar — bootstrap_organization() no se puede llamar en el momento
 * del registro porque todavía no hay sesión. Importante: nunca redirigir a /login cuando el
 * usuario ya está autenticado, porque el middleware redirige de vuelta a /hoy y crea un bucle
 * infinito (visto en producción: /hoy ⇄ /login).
 */
async function getOrCreateMembership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: { id: string; email?: string; user_metadata?: Record<string, unknown> },
): Promise<MembershipRow | null> {
  const { data: existing } = await supabase
    .from('memberships')
    .select('role, organization_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (existing) return existing

  const organizationName =
    (user.user_metadata?.organization_name as string | undefined) || `Organización de ${user.email ?? user.id}`

  const { error } = await supabase.rpc('bootstrap_organization', { p_org_name: organizationName })
  if (error) return null

  const { data: created } = await supabase
    .from('memberships')
    .select('role, organization_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  return created
}

export async function requireCurrentSession(): Promise<CurrentSession> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const membership = await getOrCreateMembership(supabase, user)

  if (!membership) {
    throw new Error(
      'No se pudo inicializar tu organización. Vuelve a intentarlo o contacta con soporte si el problema persiste.',
    )
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
