import fs from "node:fs/promises";
import path from "node:path";

import { TournamentName } from "@/enums/tournament.enum";
import type { LeaderboardPlayer } from "@/interfaces/leaderboard-player.interface";
import type { Ranking } from "@/interfaces/ranking.interface";
import type { Standing } from "@/interfaces/standing.interface";
import type { Team } from "@/interfaces/team.interface";
import type { Tournament } from "@/interfaces/tournament.interface";
import ScoringService from "@/services/scoring.service";

/**
 * Rebuilds the leaderboard inside an already-frozen results file using the
 * current ScoringService, without touching the network.
 *
 * Earlier freezes fed getLeaderboard the wrong rankings (e.g. PGA was built with
 * the Masters table), so a rostered player's leaderboard rank could disagree
 * with their standings rank. getLeaderboard now takes rostered players' ranks
 * from the roster, so re-running it here realigns the leaderboard with the
 * standings. Unrostered field players keep their existing (frozen) ranks, which
 * we feed back in as the fallback rankings map. Standings are already correct
 * and are preserved verbatim.
 */

const TOURNAMENTS = [
  { name: TournamentName.Masters, file: "masters" },
  { name: TournamentName.Pga, file: "pga" },
];

const scoringService = new ScoringService();
const dir = path.join(process.cwd(), "data", "2026");

async function refreeze(name: TournamentName, file: string) {
  const resultsPath = path.join(dir, `${file}-results.json`);
  const results = JSON.parse(await fs.readFile(resultsPath, "utf8")) as {
    standings: Standing[];
    leaderboard: LeaderboardPlayer[];
  };
  const teams = JSON.parse(await fs.readFile(path.join(dir, `${file}.json`), "utf8")) as Team[];

  // Reconstruct the field from the frozen leaderboard, and a fallback rankings
  // map (name -> rank) so unrostered players keep their existing rank.
  const tournament: Tournament = { name, round: 4, leaderboard: {} };
  const rankings: Record<string, Ranking> = {};
  for (const p of results.leaderboard) {
    const key = `${p.firstName} ${p.lastName}`;
    tournament.leaderboard[key] = {
      nationality: p.nationality,
      score: p.score,
      thru: p.thru,
      isTied: p.isTied,
      place: p.place,
      status: p.status,
    };
    rankings[key] = { firstName: p.firstName, lastName: p.lastName, rank: p.rank };
  }

  const leaderboard = scoringService.getLeaderboard(teams, tournament, rankings);
  await fs.writeFile(
    resultsPath,
    JSON.stringify({ standings: results.standings, leaderboard }, undefined, 2) + "\n",
  );
  console.info(`Refroze ${leaderboard.length} leaderboard entries in ${resultsPath}`);
}

async function main() {
  for (const t of TOURNAMENTS) await refreeze(t.name, t.file);
}

main();
