import fs from "node:fs/promises";
import path from "node:path";

import axios from "axios";

import DataGolfClient from "@/clients/data-golf.client";

interface ApiResponse {
  Teams: Array<{ Name: string; Roster: Array<{ Name: string }> }>;
}

const year = new Date().getFullYear();
const tournament = process.argv[2];
if (!tournament) {
  throw new Error(
    "Tournament argument required. Usage: npx tsx src/scripts/get-teams.ts <tournament>",
  );
}

const dir = path.join(process.cwd(), "data", year.toString());
await fs.mkdir(dir, { recursive: true });
const filePath = path.join(dir, `${tournament}.json`);

const dataGolfClient = new DataGolfClient();
const rankings = await dataGolfClient.getRankings();

const response = await axios.get<ApiResponse>(
  "https://fantasy-golf-neon.vercel.app/api/leaderboard",
);

const teams = response.data.Teams.map((team) => {
  const players = team.Roster.map((rosterPlayer) => {
    const ranking = rankings[rosterPlayer.Name];
    if (!ranking) {
      console.error(`No ranking found for player: ${rosterPlayer.Name}`);
    }
    return ranking;
  });
  return {
    name: team.Name,
    players,
  };
});

await fs.writeFile(filePath, JSON.stringify(teams, undefined, 2));
console.info(`Wrote ${teams.length} teams to ${filePath}`);
