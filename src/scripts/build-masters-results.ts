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
import masters from "@data/2026/masters.json";
import mastersResults from "@data/2026/masters-results.json";

/**
 * Backfills the per-category point breakdown into data/2026/masters-results.json.
 *
 * The Masters was frozen before ScoringService emitted placementPoints,
 * rankingBonus, etc., so the expandable player breakdown in the UI could only
 * fall back to the bare total. The live datagolf endpoint has long since rolled
 * over, so we cannot regenerate from the API — but the frozen results already
 * contain the final leaderboard (place, score, status, …). We reconstruct the
 * Tournament from that leaderboard and re-run the same ScoringService the live
 * app uses, which now also produces the breakdown fields. We assert the new
 * standings scores match the frozen ones before overwriting, so the only change
 * is the added breakdown — never the totals.
 */
async function main() {
  const frozen = mastersResults as { standings: Standing[]; leaderboard: LeaderboardPlayer[] };

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
    name: TournamentName.Masters,
    round: 4,
    leaderboard,
  };

  const teams = masters as Team[];
  const scoringService = new ScoringService();
  const standings = scoringService.getStandings(teams, tournament);
  const rebuiltLeaderboard = scoringService.getLeaderboard(
    teams,
    tournament,
    getRankings(TournamentName.Masters),
  );

  // Guard: the recomputed totals must match what was frozen, otherwise we'd be
  // silently rewriting history rather than backfilling the breakdown.
  for (const standing of standings) {
    const before = frozen.standings.find((s) => s.name === standing.name);
    if (!before) throw new Error(`Team ${standing.name} missing from frozen standings`);
    if (before.score !== standing.score) {
      throw new Error(
        `Score mismatch for ${standing.name}: frozen ${before.score} vs rebuilt ${standing.score}`,
      );
    }
  }

  const dir = path.join(process.cwd(), "data", "2026");
  const filePath = path.join(dir, "masters-results.json");
  await fs.writeFile(
    filePath,
    JSON.stringify({ standings, leaderboard: rebuiltLeaderboard }, undefined, 2),
  );
  console.info(
    `Wrote ${standings.length} standings and ${rebuiltLeaderboard.length} leaderboard entries to ${filePath}`,
  );
}

main();
