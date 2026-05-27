import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Intercept auth code from Supabase (password reset, email confirm, etc.)
  const code = request.nextUrl.searchParams.get('code')
  if (code && (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '')) {
    const url = request.nextUrl.clone()
    url.pathname = '/api/auth/callback'
    url.searchParams.set('code', code)
    url.searchParams.set('next', '/auth/reset-password')
    return NextResponse.redirect(url)
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/registro') ||
                     request.nextUrl.pathname.startsWith('/recuperar-contrasena')
  const isResetPage = request.nextUrl.pathname.startsWith('/auth/reset-password')
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard') ||
                          request.nextUrl.pathname.startsWith('/partidos') ||
                          request.nextUrl.pathname.startsWith('/pronosticos') ||
                          request.nextUrl.pathname.startsWith('/grupos') ||
                          request.nextUrl.pathname.startsWith('/ranking') ||
                          request.nextUrl.pathname.startsWith('/premios') ||
                          request.nextUrl.pathname.startsWith('/perfil')
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin')

  if (!user && isDashboardPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthPage && !isResetPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
