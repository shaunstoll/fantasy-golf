import fs from "node:fs/promises";
import path from "node:path";

import { getRankings } from "@/db/rankings";
import { TournamentName } from "@/enums/tournament.enum";
import type { Leaderboard } from "@/interfaces/leaderboard.interface";
import type { LeaderboardPlayer } from "@/interfaces/leaderboard-player.interface";
import type { Standing } from "@/interfaces/standing.interface";
import type { Team } from "@/interfaces/team.interface";
import type { Tournament } from "@/interfaces/tournament.interface";
import ScoringService from "@/services/scoring.service";
import usOpen from "@data/2026/us-open.json";
import usOpenResults from "@data/2026/us-open-results.json";

/**
 * Rebuilds data/2026/us-open-results.json from the (corrected) roster.
 *
 * Jason Day withdrew from the 2026 US Open after the frozen file had already
 * been scored, so the three teams that drafted him (Danny Frankel, Ari & Micah,
 * Searle Videlefsky) had their backup picks applied on the source site
 * (Tyrrell Hatton, Akshay Bhatia, Sam Burns respectively). us-open.json now
 * carries those backups. The live datagolf endpoint has rolled past the event,
 * but the frozen file still holds the final field (place, score, status, …) for
 * every player — including the backups, who other teams also rostered. So we
 * reconstruct the Tournament from that frozen leaderboard and re-run the same
 * ScoringService the live app uses. Standings shift only for the three swapped
 * teams (and any bonus they newly qualify for, e.g. all-made-cut); everyone else
 * is unchanged.
 */
async function main() {
  const frozen = usOpenResults as { standings: Standing[]; leaderboard: LeaderboardPlayer[] };

  const leaderboard: Leaderboard = {};
  for (const p of frozen.leaderboard) {
    leaderboard[`${p.firstName} ${p.lastName}`] = {
      nationality: p.nationality,
      score: p.score,
      thru: p.thru,
      isTied: p.isTied,
      place: p.place,
      status: p.status,
    };
  }

  const tournament: Tournament = {
    name: TournamentName.UsOpen,
    round: 4,
    leaderboard,
  };

  const teams = usOpen as Team[];
  const scoringService = new ScoringService();
  const standings = scoringService.getStandings(teams, tournament);
  const rebuiltLeaderboard = scoringService.getLeaderboard(
    teams,
    tournament,
    getRankings(TournamentName.UsOpen),
  );

  // Name-trap guard: every rostered player must resolve in the frozen field,
  // otherwise a misspelled backup would silently score zero.
  const fieldNames = new Set(Object.keys(leaderboard));
  for (const team of teams) {
    for (const player of team.players) {
      const name = `${player.firstName} ${player.lastName}`;
      if (!fieldNames.has(name)) {
        throw new Error(`Rostered player not found in frozen field: ${name} (${team.name})`);
      }
    }
  }

  const dir = path.join(process.cwd(), "data", "2026");
  const filePath = path.join(dir, "us-open-results.json");
  await fs.writeFile(
    filePath,
    JSON.stringify({ standings, leaderboard: rebuiltLeaderboard }, undefined, 2) + "\n",
  );
  console.info(
    `Wrote ${standings.length} standings and ${rebuiltLeaderboard.length} leaderboard entries to ${filePath}`,
  );
}

main();
