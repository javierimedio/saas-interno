import { NextResponse, type NextRequest } from 'next/server'

import { createClient } from '@/shared/infrastructure/supabase/server-client'

/**
 * Destino del enlace de confirmación de email de Supabase Auth (flujo PKCE de @supabase/ssr):
 * intercambia el `code` de la URL por una sesión y la cookie correspondiente antes de redirigir.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/hoy'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
