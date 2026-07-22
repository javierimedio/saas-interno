'use server'

import { redirect } from 'next/navigation'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { err, type Result } from '@/shared/domain/result'
import { signUpSchema, type SignUpInput } from '../domain/auth.schema'

/**
 * Alta de un nuevo manager: crea el usuario en Supabase Auth. El nombre de organización se
 * guarda como metadata del usuario porque, con confirmación de email activada (por defecto
 * en Supabase Cloud), todavía no hay sesión en este momento para llamar a
 * bootstrap_organization() — se arranca de forma perezosa en el primer acceso autenticado
 * (ver requireCurrentSession en shared/infrastructure/supabase/current-session.ts), tanto si
 * hay sesión inmediata (confirmaciones desactivadas, típico en local) como si llega tras
 * confirmar el email vía /auth/callback.
 */
export async function signUpAction(input: SignUpInput): Promise<Result<null>> {
  const parsed = signUpSchema.safeParse(input)
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? 'Datos de registro inválidos')
  }

  const { organizationName, email, password } = parsed.data
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { organization_name: organizationName } },
  })
  if (error) {
    return err(error.message === 'User already registered' ? 'Ya existe una cuenta con ese email' : 'No se pudo crear la cuenta')
  }

  if (!data.session) {
    return err('Revisa tu email para confirmar la cuenta antes de continuar')
  }

  redirect('/hoy')
}
