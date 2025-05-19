import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { teams } from "@/db/teams";
import ScoringService from "@/services/scoring.service";
import DataGolfClient from "@/clients/data-golf.client";

const dataGolfClient = new DataGolfClient();
const scoringService = new ScoringService();

export const tournamentRouter = createTRPCRouter({
  get: publicProcedure.query(async () => {
    const tournament = await dataGolfClient.getTournament();
    const standings = scoringService.getStandings(teams, tournament);
    return standings;
  }),
});
