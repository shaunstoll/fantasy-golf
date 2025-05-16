import DataGolfClient from "@/clients/data-golf.client";
import HerokuClient from "@/clients/heroku.client";
import fs from "fs/promises";
import path from "path";

const filePath = path.join(process.cwd(), "data", "teams.json");

async function main() {
  const rankings = await DataGolfClient.getRankings();
  const teams = await HerokuClient.getTeams();
  const teamsWithRankings = teams.map((team) => ({
    ...team,
    players: team.players.map((player) => {
      const ranking = rankings[player];
      if (!ranking) {
        console.error(`No ranking found for player: ${player}`);
      }
      return ranking;
    }),
  }));
  await fs.writeFile(filePath, JSON.stringify(teamsWithRankings, null, 2));
}

void main();
