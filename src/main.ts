import ScoringService from "./scoring.service";
import DataGolfClient from "./clients/data-golf.client";
import { TournamentType } from "./enums/tournament.enum";
import fs from "fs/promises";
import path from "path";

const cutLine = {
  [TournamentType.MASTER]: 50,
  [TournamentType.US_OPEN]: 60,
  [TournamentType.PGA]: 70,
  [TournamentType.OPEN]: 70,
};

async function main() {
  const teams = await fs.readFile(
    path.join(process.cwd(), "data", "teams.json"),
    "utf8",
  );
  const leaderboard = await DataGolfClient.getLeaderboard();
  const scores = ScoringService.getStandings(
    JSON.parse(teams),
    leaderboard,
    cutLine[process.env.NEXT_PUBLIC_TOURNAMENT_TYPE as TournamentType],
  );
  console.log(scores);
}

void main();
