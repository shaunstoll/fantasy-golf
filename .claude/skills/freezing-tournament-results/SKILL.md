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

## The score-breakdown fields (don't strip them)

`ScoringService` emits per-category point fields on every player — `placementPoints`, `rankingBonus`, `madeCutBonusPoints`, `firstPlaceBonusPoints`, `lowestRankedBonusPoints` — and the UI uses them to power the **expandable point math** when you click a roster player (`src/components/player.tsx` keys on `player.placementPoints !== undefined`). Because you freeze by running the real `ScoringService` (step 3), these come for free — just **don't post-process them out** of the JSON. A frozen file missing them collapses the breakdown to a bare total.

**Backfilling an old frozen file:** files frozen _before_ these fields existed (the 2026 Masters was the original offender) show only the total. To backfill without touching the totals, reconstruct the `Tournament` from the file's **own frozen `leaderboard`** array (it already has `place`/`isTied`/`score`/`status` per player — no Wikipedia needed), re-run `ScoringService`, **assert each team's recomputed `score` equals the frozen one**, then overwrite. `src/scripts/build-masters-results.ts` (`npm run build-masters-results`) is the worked example.

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
- Every player in both `standings[].players[]` and `leaderboard[]` has the breakdown fields (`placementPoints`, etc.) — otherwise the click-to-expand point math won't render.
- `npm run check` (fmt + lint + typecheck + tests) and `npm run build` both pass.

## Cross-checking totals against the source site

The fantasy-golf-neon Vercel app (the same site `get-teams` scrapes) is the authoritative scorer. Use it to prove our frozen totals are right — after a freeze, a WD/backup adjustment, or any time the standings look off. Two endpoints:

- **`/api/leaderboard`** — the **current event only**. Per team: `Name`, `Total Score`, `Place`, `AllCut`, `WorstRankedBonus`, and a `Roster` of `{ Name, Cut, "Points scored", Finish }`. Rolls over to the next event after the tournament ends (same rollover trap as everything else here). Use it to cross-check the in-progress/just-finished major's per-team total and place, and to discover WD/backup substitutions (re-scrape and diff the roster against `data/{year}/{tournament}.json`).
- **`/api/overall`** — the **season**. `Teams[]` of `{ name, email, masters, pga, US, open, total, place }`. This is the only place the all-tournaments-combined total exists — our app computes the Total tab by summing the frozen files, so `/api/overall` is the external source of truth for both the per-major columns _and_ the combined total. Use it to validate every major + the total in one shot.

**Name-matching trap (worse than the player one):** team names are spelled differently on every endpoint and in our files — `Ari & Micah` / `Ari and Micah`, `Noah & Joey` / `Noah + Joey` / `Noah Joey`, `Jude Skove` / `jude skove`, `Josh & Jimmy Shizgal` / `Josh and jimmy Shizgal`, `Bill Mayer` / `William Mayer`, `Donald Campbell` / `Don Campbell`. `/api/leaderboard` and `/api/overall` don't even agree with each other. Match on a normalized key, not the raw string:

```js
const norm = (s) =>
  s
    .toLowerCase()
    .replace(/\band\b/g, "")
    .replace(/[^a-z0-9]/g, "");
```

This folds `&`/`+`/`and`/case/spacing together (and is safe for `Donald` — no standalone `and`). Assert **zero unmatched teams** before trusting a "0 mismatches" result — an unmatched team is a silent miss, not a pass. Worked check (all 36 teams must match on Masters/PGA/US/Total, 0 unmatched):

```js
const axios = require("axios");
const m = require("./data/2026/masters-results.json").standings;
const p = require("./data/2026/pga-results.json").standings;
const u = require("./data/2026/us-open-results.json").standings;
const sc = (t, n) => t.find((x) => x.name === n)?.score ?? 0;
const norm = (s) =>
  s
    .toLowerCase()
    .replace(/\band\b/g, "")
    .replace(/[^a-z0-9]/g, "");
const names = [...new Set([...m, ...p, ...u].map((s) => s.name))];
axios.get("https://fantasy-golf-neon.vercel.app/api/overall").then((r) => {
  const src = new Map(r.data.Teams.map((t) => [norm(t.name), t]));
  for (const n of names) {
    const s = src.get(norm(n));
    if (!s) {
      console.log("UNMATCHED", n);
      continue;
    }
    const M = sc(m, n),
      P = sc(p, n),
      U = sc(u, n);
    if (s.masters !== M || s.pga !== P || s.US !== U || Math.abs(s.total - (M + P + U)) > 0.001)
      console.log("MISMATCH", n, { M, P, U, src: s });
  }
});
```

## Common mistakes

- Running `save-results` for an event that already rolled over → empty/wrong data.
- Forgetting the alias map → rostered players score 0, standings look plausible but are wrong.
- Hand-writing standings instead of running `ScoringService` → diverges from live scoring rules.
- Not capturing missed-cut players → leaderboard view is incomplete (Masters stored the full field).
