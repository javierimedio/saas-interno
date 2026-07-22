'use server'

import { redirect } from 'next/navigation'

import { createClient } from '@/shared/infrastructure/supabase/server-client'
import { err, type Result } from '@/shared/domain/result'
import { signInSchema, type SignInInput } from '../domain/auth.schema'

export async function signInAction(input: SignInInput): Promise<Result<null>> {
  const parsed = signInSchema.safeParse(input)
  if (!parsed.success) {
    return err(parsed.error.issues[0]?.message ?? 'Datos de acceso inválidos')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return err('Email o contraseña incorrectos')
  }

  redirect('/hoy')
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
