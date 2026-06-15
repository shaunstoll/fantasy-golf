---
name: freezing-tournament-results
description: Use when a major (Masters, PGA, US Open, Open) has finished and its standings need to be frozen into a static results file — especially weeks/months later when the live datagolf API has rolled over to a newer event and `npm run save-results` no longer works.
---

# Freezing Tournament Results

## Overview

Each major's standings are served live from datagolf only while datagolf still has that event loaded. `tournament.router.ts` checks `getResults(...)` **first** and short-circuits to the static file when one exists — so once you write `data/{year}/{tournament}-results.json`, that tournament's tab and the Total tab read from it regardless of the month-based `getCurrentTournament()` gate (`src/config/tournaments.ts`, 0-indexed `getMonth()`). Until the file exists, a finished tournament shows **empty** (live API has rolled over to a newer event).

This skill freezes a finished tournament into that static file so the Total tab and the tournament's own tab keep working forever.

## Prerequisite: the roster must exist

The reconstruction imports the roster directly: `data/{year}/{tournament}.json` (e.g. `pga.json`). **Confirm it exists and is non-empty first.** If it doesn't, `npm run get-teams -- <tournament>` is the normal way to create it — but `get-teams` hits the **same live-API rollover** problem, so a late freeze may get empty rosters. In that case recover the roster from git history or a teammate before going further. The data-integrity test expects the same team-name set across all tournament rosters.

## When `save-results` works vs. when it doesn't

`npm run save-results <tournament>` only works **while the tournament is still live** (datagolf still serves it AND `currentTournament` still resolves to it). After it rolls over, that script is useless because:

1. The live datagolf endpoint now serves a **different event** (e.g. by June it's the RBC Canadian Open, not the May PGA Championship).
2. `src/db/teams.ts` binds `teams` to `currentTournament`, so the rosters come back **empty** for any non-current tournament.

If you're freezing late, **do not use `save-results`** — reconstruct from an archive instead (below).

## Reconstructing from an archive (the late case)

Worked example: `src/scripts/build-pga-results.ts` (run `npm run build-pga-results`). Use it as the template and adapt per tournament. The flow:

1. **Pull the final leaderboard from Wikipedia.** Fetch the article wikitext via the API:
   `https://en.wikipedia.org/w/api.php?action=parse&page=<PAGE>&prop=wikitext&format=json`
   Pages: `2026_Masters_Tournament`, `2026_PGA_Championship`, `2026_U.S._Open_(golf)`, `2026_Open_Championship`. **Verify the section headers** the parser keys on (`====Final leaderboard====` … `Source:`) actually match that article before trusting the parse — golf-major articles are usually consistent but confirm.
2. **Build a `Tournament` object** (`name`, `round: 4`, `leaderboard`). For each player set `place` (undefined if missed cut), `isTied`, `score` (to-par number; `E`→0, unicode minus `−`→`-`), `status` (`PLAYING`/`MISSED_CUT`), `thru` (`"F"` made cut, `"-"` missed cut).
3. **Run it through `ScoringService`** — `getStandings(teams, tournament)` and `getLeaderboard(teams, tournament, allRankings)`. Reuse the real service; never hand-compute scores. Import the roster directly (`import pga from "@data/{year}/{tournament}.json"`), because `src/db/teams.ts` won't give it to you when it isn't the current tournament.
4. **Write** `{ standings, leaderboard }` to `data/{year}/{tournament}-results.json`.
5. **Add an npm script** (the PGA one is hardcoded per-tournament): `"build-<tournament>-results": "npx tsx src/scripts/build-<tournament>-results.ts"`.

Note on rankings: `getLeaderboard` takes `allRankings`, which `src/db/rankings.ts` hardcodes to `masters-rankings.json`. Standings (the Total tab) use the **roster's own** `rank` field and are unaffected; only the leaderboard view's ranking-bonus column leans on `allRankings`. Reusing Masters rankings matches existing live behavior — fine unless you deliberately add a per-tournament rankings file.

## The name-matching trap (most likely failure)

Player matching is by exact `"FirstName LastName"` string (see CLAUDE.md). Wikipedia spells names differently than the rosters, so unmatched rostered players silently score **zero** with only a `console.error`. Build an alias map (Wikipedia display name → exact roster name) and **prove zero rostered players are unmatched** before committing. Known 2026 PGA cases:

| Wikipedia          | Roster             |
| ------------------ | ------------------ |
| `Kim Si-woo`       | `Si Woo Kim`       |
| `Im Sung-jae`      | `Sungjae Im`       |
| `Ludvig Åberg`     | `Ludvig Aberg`     |
| `Nicolai Højgaard` | `Nicolai Hojgaard` |
| `J. J. Spaun`      | `J.J. Spaun`       |

Other tournaments have their own accented/reordered names — rebuild the alias map each time.

## Wire it in

1. `src/db/results.ts` — import the new JSON and add `[TournamentName.X]: xResults as TournamentResults` to `resultsByTournament`.
2. `src/__tests__/results.spec.ts` — remove the tournament from the "returns undefined" assertion; add a "returns results" test and a test asserting **every rostered player resolves** on the leaderboard (this is the regression guard for the name trap).

## Verify before committing

- Build script logs **no** `Player ... not found in leaderboard` errors.
- Rostered-players-unmatched count is `0`.
- Spot-check a few finishers' `place`/`isTied`/`score` against the source (winner, a tie group, a missed-cut name, and every aliased name).
- `npm run check` (fmt + lint + typecheck + tests) and `npm run build` both pass.

## Common mistakes

- Running `save-results` for an event that already rolled over → empty/wrong data.
- Forgetting the alias map → rostered players score 0, standings look plausible but are wrong.
- Hand-writing standings instead of running `ScoringService` → diverges from live scoring rules.
- Not capturing missed-cut players → leaderboard view is incomplete (Masters stored the full field).
