# Pasaporte Mundial 2026

## Project Overview
Plataforma web de pronósticos para el Mundial 2026, mercado salvadoreño. Usuarios pronostican marcadores de 104 partidos, acumulan puntos, compiten en ranking nacional y ganan premios. 100% gratuito, financiado por sponsors.

**Production URL:** https://pasaporte2026.com
**Stack:** Next.js 16.2.0 (App Router + Turbopack) | Supabase (DB + Auth) | Vercel | Tailwind CSS | Montserrat font

## Critical Rules
- NEVER use "FIFA", "FIFA World Cup", or "Copa del Mundo" anywhere in the app — trademark restriction
- NEVER use emojis in text — only country flag emojis (flag_emoji field) are permitted
- NEVER touch projects "dreamtide" or "muscari" in Supabase, Vercel, or VS Code
- Mobile first — primary use case is mobile (El Salvador market)
- All UI text in Spanish

## Brand Colors
- Blue: #458fff (links, ranking, datos)
- Yellow: #ffd70d (puntos, CTAs, titulo "MUNDIAL")
- Green: #2ac105 (botón primario, badge "Listo", fase de grupos)
- Red: #f10a3c (EN VIVO, errores, eliminatorias)
- Black base: #051119 (background de toda la app)

## Design System
- Font: Montserrat (loaded in layout.tsx via next/font/google)
- Titles: font-black (900), tracking-tight, uppercase
- Cards: rounded-2xl, border rgba(255,255,255,0.05), bg rgba(255,255,255,0.03)
- Buttons: rounded-xl, font-black, tracking-wider, hover:scale-[1.02]
- Background: bg-internal.jpg at 15% opacity with gradient overlay on all internal pages
- Bottom nav bar fixed on all dashboard pages (5 items: Inicio, Pronósticos, Partidos, Ranking, Perfil)
- Modals slide up from bottom on mobile (items-end), centered on desktop

## Architecture
```
src/app/
  layout.tsx              # Global layout (Montserrat + metadata)
  page.tsx                # Landing (hero + parallax + banners)
  (auth)/login/           # Login (Google OAuth + email)
  (auth)/registro/        # Register
  (dashboard)/layout.tsx  # Shared layout (bg + bottom nav)
  (dashboard)/dashboard/  # Main dashboard
  (dashboard)/pronosticos/# Predictions (core feature)
  (dashboard)/partidos/   # Match list
  (dashboard)/grupos/     # 12 groups
  (dashboard)/ranking/    # Global ranking
  (dashboard)/premios/    # Prizes & raffles
  (dashboard)/perfil/     # User profile
  admin/                  # Admin panel (PENDING)
  api/auth/callback/      # OAuth callback
  api/auth/signout/       # Sign out
```

## Database (Supabase - 11 tables)
- profiles, teams (48), players, matches (104), match_scorers
- predictions (UNIQUE user_id+match_id), prizes (5), weekly_raffles (3)
- sponsors, banners, news (5)
- RLS enabled on all tables
- Key functions: handle_new_user() trigger, calculate_match_points(match_id)

## Points System
- Exact score: 10 pts | Correct result (1X2): 4 pts | Correct goal diff: 3 pts
- Scorer bonus: +5 pts | Streak 3+: +3 pts (NOT YET IMPLEMENTED in SQL)
- Multipliers: Groups x1.0 → R32 x1.25 → R16 x1.5 → QF x2.0 → SF x2.5 → Final x3.0
- Predictions lock 1 minute before kickoff

## Supabase Connection
- URL: https://oyndtkrrwmsgkijbfwcs.supabase.co
- Browser client: src/lib/supabase-browser.ts
- Server client: src/lib/supabase-server.ts

## Build & Deploy
- `npm run dev` for local development
- `git push` to main triggers auto-deploy on Vercel
- next.config.ts: ignoreBuildErrors + ignoreDuringBuilds = true
- WARNING: zsh corrupts long `cat > file << 'EOF'` commands — use file creation instead

## Key Pending Items
- Admin panel (simulate results, manage matches)
- Streak bonus in calculate_match_points SQL function
- Password recovery page
- AI assistant for pre-match analysis (Claude + web search)
- Cron jobs for automation (Supabase Edge Functions + Vercel Cron)
- API integration (BALLDONTLIE for live results)
- PWA (manifest.json + service worker)
- Stats improvements: streak indicator, mini chart, raffle position
