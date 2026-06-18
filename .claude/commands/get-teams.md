---
description: Grab fantasy team rosters from the live Vercel leaderboard and wire them into the app
argument-hint: <tournament-slug>  (masters | pga | us-open | open)
---

Pull this year's team rosters for the **$1** tournament from the deployed Vercel app and make the app actually serve them.

Tournament slug must be one of the `TournamentName` enum values (`src/enums/tournament.enum.ts`): `masters`, `pga`, `us-open`, `open`. If `$1` is empty, ask which tournament before doing anything.

## Steps

1. **Scrape the rosters:** `npm run get-teams -- $1`
   - This hits `https://fantasy-golf-neon.vercel.app/api/leaderboard` for each team's roster (names only), then joins every name against DataGolf's live world rankings, and writes the enriched rosters to `data/{currentYear}/$1.json`.
   - **Timing trap:** `get-teams` reads the _live_ leaderboard API, which rolls over to the next event after a tournament ends. Pull rosters while `$1` is the current/in-progress event, or you'll get empty/wrong data. (Same rollover problem the `freezing-tournament-results` skill warns about.)

2. **Check for name mismatches:** the script prints `No ranking found for player: <Name>` to stderr for any roster name that didn't match a DataGolf ranking. Player matching is exact `"FirstName LastName"` (see CLAUDE.md). Any such line means that player will be missing from the stored roster — investigate and resolve the name before moving on. Also confirm the team count looks right and no roster has a null/undefined player entry.

3. **Reconcile team names against the prior majors:** the same people play every major, but they re-enter their team name each time and often type it differently (capitalization, nickname, `+` vs space, short vs full first name). The roster set should be **identical across all majors** — the prior majors agree with each other, so treat their shared spelling as canonical and rename the odd ones out in the new file. As a general rule, always run this diff after a pull and resolve every mismatch before wiring in. Compare against the existing tournaments:

   ```bash
   node -e "
   const prior = new Set([
     ...require('./data/{year}/masters.json'),
     ...require('./data/{year}/pga.json'),
   ].map(t => t.name));
   const cur = require('./data/{year}/$1.json').map(t => t.name);
   console.log('new file teams:', cur.length, '| canonical set:', prior.size);
   console.log('in $1 but not canonical:', cur.filter(n => !prior.has(n)));
   console.log('canonical but missing from $1:', [...prior].filter(n => !cur.includes(n)));
   "
   ```

   The two lists should pair up 1:1 (same person, different spelling). Map each new-file name to its canonical name and rewrite `data/{year}/$1.json` with the canonical names. Real 2026 US Open cases: `Jacques mosseri`→`Jacques Mosseri`, `Neill VIDELEFSKY`→`Neill Videlefsky`, `Don Campbell`→`Donald Campbell`, `Noah + Joey`→`Noah Joey`, `William Mayer`→`Bill Mayer`. If a name can't be matched by elimination, ask rather than guess.

4. **Wire it into the app:** `src/db/teams.ts` binds `teams` to `currentTournament` via the `teamsByTournament` map, and `currentTournament` is decided by month (`src/config/tournaments.ts`, 0-indexed `getMonth()`). A roster file the app doesn't import shows up as **empty**. So add the new tournament:
   - `import x from "@data/{year}/$1.json";`
   - add `"$1": x,` to `teamsByTournament` (key by the exact slug).
     Skip this only if the entry already exists.

5. **Verify:** `npm run check` (fmt + lint + typecheck + tests). The data-integrity test expects the same team-name set across all tournament rosters — a failure there means step 3 missed a mismatch.

## Related

- `freezing-tournament-results` skill — for freezing a _finished_ tournament's standings into a static results file after the live API has rolled over.
