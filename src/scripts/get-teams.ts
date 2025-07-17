import fs from "node:fs/promises";
import path from "node:path";

import DataGolfClient from "@/clients/data-golf.client";
import HerokuClient from "@/clients/heroku.client";

const filePath = path.join(process.cwd(), "data", "teams.json");

const dataGolfClient = new DataGolfClient();
const rankings = await dataGolfClient.getRankings();
const herokuClient = new HerokuClient();
const teams = await herokuClient.getTeams();
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
await fs.writeFile(filePath, JSON.stringify(teamsWithRankings, undefined, 2));
