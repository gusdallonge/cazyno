# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cazyno is an online casino web application built with a React frontend and a Fastify/PostgreSQL backend. It was scaffolded with Base44 and uses Vite as the build tool.

## Commands

### Frontend (root directory)
- `npm run dev` — Start Vite dev server (proxies API requests to backend on port 3001)
- `npm run build` — Production build
- `npm run lint` — ESLint (quiet mode)
- `npm run lint:fix` — ESLint with auto-fix

### Backend (`server/` directory)
- `cd server && npm run dev` — Start Fastify server with `--watch` (port 3001)
- `cd server && npm start` — Start without watch mode
- `psql -U cazyno -d cazyno -f server/schema.sql` — Initialize/reset database schema

### Tests
No test framework is configured. There are no test files or test scripts.

### Environment
- Frontend `.env.local`: `VITE_BASE44_APP_ID`, `VITE_BASE44_APP_BASE_URL`, `VITE_TURNSTILE_SITE_KEY` (Cloudflare CAPTCHA)
- Backend env: `DATABASE_URL` (defaults to `postgresql://cazyno:cazyno@localhost:5432/cazyno`), `JWT_SECRET`, `TURNSTILE_SECRET_KEY`, `ANTHROPIC_API_KEY` (for chatbot), `PORT` (default 3001)

## Architecture

### Frontend (`src/`)
- **React 18 + Vite + Tailwind CSS** with `@` path alias mapped to `src/`
- **Routing**: React Router v6 in `App.jsx`. Three route groups:
  - Public: `/` (Landing), `/login`
  - Demo: `/demo/:game` — playable without login, wrapped in `DemoGame`
  - Protected: `/app/*` — requires auth, wrapped in `Layout` (sidebar + header)
- **Auth**: JWT stored in `localStorage` as `cazyno_token`. `AuthContext` (`src/lib/AuthContext.jsx`) provides `useAuth()` hook. `ProtectedRoute` component guards `/app/*`.
- **API layer**: `src/api/client.js` exports `apiFetch()` which auto-attaches JWT. Service modules in `src/api/services/` wrap CRUD calls. All services aggregated in `src/api/index.js`.
- **State**: TanStack React Query (`src/lib/query-client.js`) for server state.
- **UI components**: shadcn/ui primitives in `src/components/ui/`, app-level components in `src/components/`.
- **Games**: Each game is a page component in `src/pages/` (Dice, Blackjack, Plinko, Roulette, CrashGame, PulseBomb, ChickenDrop, Trader). Game rounds are saved via `src/lib/saveRound.js`.
- **i18n**: Translation system in `src/lib/i18n.js`. Sound effects managed via `src/lib/soundEffects.js` (uses Howler).

### Backend (`server/`)
- **Fastify** with route modules in `server/routes/` (auth, userProfiles, gameRounds, supportTickets, users, integrations)
- **PostgreSQL** via `pg` pool (`server/db.js`). Schema in `server/schema.sql`.
- **Auth**: bcrypt password hashing + JWT with 30-day expiry (`server/auth.js`). Middleware: `authenticate` (preHandler) and `requireAdmin` (role check). Signup/login use Cloudflare Turnstile CAPTCHA verification.
- **Tables**: `users` (auth), `user_profiles` (credits, XP, wallet, stats), `game_rounds`, `support_tickets`

### Vite Proxy
The dev server proxies `/auth`, `/user-profiles`, `/game-rounds`, `/support-tickets`, `/users`, `/integrations`, `/rpc`, `/health` to the backend at `localhost:3001`.
