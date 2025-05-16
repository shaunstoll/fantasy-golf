import { publicProcedure, router } from "../trpc";
import { teams } from "@/db/teams";
import ScoringService from "@/services/scoring.service";
import { TournamentType } from "@/enums/tournament.enum";
import { env } from "@/env";
import DataGolfClient from "@/clients/data-golf.client";

const dataGolfClient = new DataGolfClient();
const scoringService = new ScoringService();

export const leaderboardRouter = router({
  getStandings: publicProcedure.query(async () => {
    const leaderboard = await dataGolfClient.getLeaderboard();
    const standings = scoringService.getStandings(
      teams,
      leaderboard,
      env.NEXT_PUBLIC_TOURNAMENT as TournamentType,
    );
    return standings;
  }),
});
