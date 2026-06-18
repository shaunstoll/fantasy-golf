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

3. **Wire it into the app:** `src/db/teams.ts` binds `teams` to `currentTournament` via the `teamsByTournament` map, and `currentTournament` is decided by month (`src/config/tournaments.ts`, 0-indexed `getMonth()`). A roster file the app doesn't import shows up as **empty**. So add the new tournament:
   - `import x from "@data/{year}/$1.json";`
   - add `"$1": x,` to `teamsByTournament` (key by the exact slug).
     Skip this only if the entry already exists.

4. **Verify:** `npm run check` (fmt + lint + typecheck + tests). The data-integrity test expects the same team-name set across all tournament rosters — a failure there usually means a roster pulled differently than the others.

## Related

- `freezing-tournament-results` skill — for freezing a _finished_ tournament's standings into a static results file after the live API has rolled over.
