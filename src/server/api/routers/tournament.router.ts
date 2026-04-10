import DataGolfClient from "@/clients/data-golf.client";
import { allRankings } from "@/db/rankings";
import { teams } from "@/db/teams";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import ScoringService from "@/services/scoring.service";

const dataGolfClient = new DataGolfClient();
const scoringService = new ScoringService();

export const tournamentRouter = createTRPCRouter({
  get: publicProcedure.query(async () => {
    const tournament = await dataGolfClient.getTournament();
    const standings = scoringService.getStandings(teams, tournament);
    return standings;
  }),
  leaderboard: publicProcedure.query(async () => {
    const tournament = await dataGolfClient.getTournament();
    return scoringService.getLeaderboard(teams, tournament, allRankings);
  }),
});
