import ScoringService from "./scoring.service";
import DataGolfClient from "./clients/data-golf.client";
import HerokuClient from "./clients/heroku.client";

const cutLine = {
  masters: 50,
  usOpen: 60,
  pga: 70,
  open: 70,
};

async function main() {
  const rankings = await DataGolfClient.getRankings();
  const leaderboard = await DataGolfClient.getLeaderboard();
  const teams = await HerokuClient.getTeams();
  const scores = ScoringService.getStandings(
    teams,
    leaderboard,
    rankings,
    cutLine.masters,
  );
  console.log(scores);
}

void main();
