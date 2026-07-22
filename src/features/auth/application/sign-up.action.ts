'use server'

import { redirect } from 'next/navigation'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { err, type Result } from '@/shared/domain/result'
import { signUpSchema, type SignUpInput } from '../domain/auth.schema'

/**
 * Alta de un nuevo manager: crea el usuario en Supabase Auth y, si el registro produce
 * sesión inmediata (email confirmations desactivadas en desarrollo), arranca su
 * organización vía bootstrap_organization() (docs/02-arquitectura.md §2.7,
 * supabase/migrations/20260722120400_functions_and_triggers.sql).
 */
export async function signUpAction(input: SignUpInput): Promise<Result<null>> {
  const parsed = signUpSchema.safeParse(input)
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? 'Datos de registro inválidos')
  }

  const { organizationName, email, password } = parsed.data
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) {
    return err(error.message === 'User already registered' ? 'Ya existe una cuenta con ese email' : 'No se pudo crear la cuenta')
  }

  if (!data.session) {
    return err('Revisa tu email para confirmar la cuenta antes de continuar')
  }

  const { error: bootstrapError } = await supabase.rpc('bootstrap_organization', {
    p_org_name: organizationName,
  })
  if (bootstrapError) {
    return err('La cuenta se creó pero no se pudo inicializar la organización')
  }

  redirect('/hoy')
}
