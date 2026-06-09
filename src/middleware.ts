import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ─── MAINTENANCE MODE ─────────────────────────────────────
// Activated per client request. Set MAINTENANCE_MODE=false in Vercel
// env vars (or revert this commit) to disable. APIs, auth callbacks,
// the cron endpoint, and static assets stay reachable so the cron job,
// Supabase Edge Function, Realtime, and admin email delivery keep
// running normally in the background.
const MAINTENANCE_MODE = true

function isMaintenanceExempt(pathname: string): boolean {
  return (
    pathname === '/mantenimiento' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/images/') ||
    pathname === '/manifest.json' ||
    pathname === '/favicon.ico' ||
    /\.(png|jpg|jpeg|gif|webp|svg|ico|mp4|webm|woff2?)$/i.test(pathname)
  )
}

export async function middleware(request: NextRequest) {
  // STEP 0: Maintenance redirect (runs before everything else)
  if (MAINTENANCE_MODE && !isMaintenanceExempt(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/mantenimiento'
    url.search = ''
    return NextResponse.redirect(url)
  }

  // Intercept auth code from Supabase (password reset, email confirm, etc.)
  const code = request.nextUrl.searchParams.get('code')
  if (code && (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '')) {
    const url = request.nextUrl.clone()
    url.pathname = '/api/auth/callback'
    url.searchParams.set('code', code)
    url.searchParams.set('next', '/auth/reset-password')
    return NextResponse.redirect(url)
  }

  // Handle expired/invalid auth links — redirect to recuperar-contrasena with error
  const authError = request.nextUrl.searchParams.get('error_code')
  if (authError === 'otp_expired' && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/recuperar-contrasena'
    url.search = '?expired=true'
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
