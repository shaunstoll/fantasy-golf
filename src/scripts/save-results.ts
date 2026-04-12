import fs from "node:fs/promises";
import path from "node:path";

import DataGolfClient from "@/clients/data-golf.client";
import { allRankings } from "@/db/rankings";
import { teams } from "@/db/teams";
import ScoringService from "@/services/scoring.service";

async function main() {
  const tournament = process.argv[2];
  if (!tournament) {
    throw new Error(
      "Tournament argument required. Usage: npx tsx src/scripts/save-results.ts <tournament>",
    );
  }

  const year = new Date().getFullYear();
  const dir = path.join(process.cwd(), "data", year.toString());
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${tournament}-results.json`);

  const dataGolfClient = new DataGolfClient();
  const scoringService = new ScoringService();
  const tournamentData = await dataGolfClient.getTournament();

  console.info(`Fetched tournament: round ${tournamentData.round}`);
  console.info(`Leaderboard has ${Object.keys(tournamentData.leaderboard).length} players`);

  const standings = scoringService.getStandings(teams, tournamentData);
  const leaderboard = scoringService.getLeaderboard(teams, tournamentData, allRankings);

  const results = { standings, leaderboard };
  await fs.writeFile(filePath, JSON.stringify(results, undefined, 2));
  console.info(
    `Wrote ${standings.length} standings and ${leaderboard.length} leaderboard entries to ${filePath}`,
  );
}

main();
