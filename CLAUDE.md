# Fantasy Golf

Next.js (App Router) fantasy golf scoring app deployed on Vercel.

## Stack

- **Framework**: Next.js 16 with Turbopack, React 19, TypeScript 6
- **API**: tRPC v11 (single `tournament.get` endpoint)
- **Styling**: Tailwind CSS v4
- **State**: Zustand (favorite teams persisted to localStorage)
- **Testing**: Vitest 4 + Testing Library (unit), Playwright (e2e)
- **Linting/Formatting**: oxlint + oxfmt, enforced via Husky pre-commit

## Architecture

Clients (`src/clients/`) fetch tournament data → ScoringService (`src/services/scoring.service.ts`) computes fantasy standings → tRPC router returns `Standing[]` → frontend polls every 5s.

Team rosters are stored as JSON in `data/{year}/{tournament}.json` and loaded via `src/db/teams.ts` based on the `NEXT_PUBLIC_TOURNAMENT` env var. Run `npm run get-teams -- <tournament>` to scrape rosters from the leaderboard API.

## Commands

- `npm run dev` — start dev server
- `npm run typecheck` — TypeScript check
- `npm run lint` / `npm run lint:fix` — oxlint
- `npm run fmt` / `npm run fmt:check` — oxfmt
- `npm test` — run Vitest
- `npm run e2e` — run Playwright
- `npm run get-rankings` — scrape player rankings
- `npm run get-teams` — scrape team rosters

## Workflow

- Solo project. Commit and push directly to `prod` — no feature branches, no PRs.

## Rules

- Never use type `any`
- Player matching is by exact `"FirstName LastName"` string — be careful with name formatting
