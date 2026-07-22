import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

import type { Database } from './database.types'

/**
 * Cliente de Supabase para Server Components y Server Actions, ligado a las cookies de la
 * sesión (docs/02-arquitectura.md §2.8): siempre lleva el JWT del usuario, nunca la
 * service_role key, de modo que RLS se aplica igual que si el usuario consultase la base
 * de datos directamente.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Se puede llamar desde un Server Component durante el render, donde no se
            // pueden escribir cookies. El middleware se encarga de refrescar la sesión.
          }
        },
      },
    },
  )
}
