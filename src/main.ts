import ScoringService from "./scoring.service";
import DataGolfClient from "./clients/data-golf.client";
import HerokuClient from "./clients/heroku.client";
import { TournamentType } from "./enums/tournament.enum";

const cutLine = {
  [TournamentType.MASTER]: 50,
  [TournamentType.US_OPEN]: 60,
  [TournamentType.PGA]: 70,
  [TournamentType.OPEN]: 70,
};

async function main() {
  const rankings = await DataGolfClient.getRankings();
  const leaderboard = await DataGolfClient.getLeaderboard();
  const teams = await HerokuClient.getTeams();
  const scores = ScoringService.getStandings(
    teams,
    leaderboard,
    rankings,
    cutLine[process.env.NEXT_PUBLIC_TOURNAMENT_TYPE as TournamentType],
  );
  console.log(scores);
}

void main();
