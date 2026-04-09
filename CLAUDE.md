# Fantasy Golf

Next.js (App Router) fantasy golf scoring app deployed on Vercel.

## Stack

- **Framework**: Next.js 15 with Turbopack, React 19, TypeScript
- **API**: tRPC v11 (single `tournament.get` endpoint)
- **Styling**: Tailwind CSS v4
- **State**: Zustand (favorite teams persisted to localStorage)
- **Testing**: Vitest + Testing Library (unit), Playwright (e2e)
- **Linting**: ESLint 9 flat config + Prettier, enforced via Husky pre-commit

## Architecture

Clients (`src/clients/`) fetch tournament data → ScoringService (`src/services/scoring.service.ts`) computes fantasy standings → tRPC router returns `Standing[]` → frontend polls every 5s.

Team rosters are hardcoded in `src/db/teams.ts` (Masters) and `src/db/pga-teams.ts` (PGA). The active tournament is set via `NEXT_PUBLIC_TOURNAMENT` env var.

## Commands

- `npm run dev` — start dev server
- `npm run typecheck` — TypeScript check
- `npm run lint:fix` — lint and auto-fix
- `npm test` — run Vitest
- `npm run e2e` — run Playwright
- `npm run get-rankings` — scrape player rankings
- `npm run get-teams` — scrape team rosters

## Rules

- Never use type `any`
- Follow existing eslint.config.mts rules
- Player matching is by exact `"FirstName LastName"` string — be careful with name formatting
