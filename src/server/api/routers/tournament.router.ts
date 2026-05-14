import { z } from "zod";

import DataGolfClient from "@/clients/data-golf.client";
import { allRankings } from "@/db/rankings";
import { getResults } from "@/db/results";
import { teams } from "@/db/teams";
import { TournamentName } from "@/enums/tournament.enum";
import { currentTournament } from "@/config/tournaments";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import ScoringService from "@/services/scoring.service";

const dataGolfClient = new DataGolfClient();
const scoringService = new ScoringService();

const tournamentNameSchema = z.enum([
  TournamentName.Masters,
  TournamentName.Pga,
  TournamentName.UsOpen,
  TournamentName.Open,
]);

export const tournamentRouter = createTRPCRouter({
  get: publicProcedure.query(async () => {
    const results = getResults(currentTournament);
    if (results) return results.standings;
    const tournament = await dataGolfClient.getTournament();
    return scoringService.getStandings(teams, tournament);
  }),
  leaderboard: publicProcedure.query(async () => {
    const results = getResults(currentTournament);
    if (results) return results.leaderboard;
    const tournament = await dataGolfClient.getTournament();
    return scoringService.getLeaderboard(teams, tournament, allRankings);
  }),
  results: publicProcedure
    .input(z.object({ tournament: tournamentNameSchema }))
    .query(({ input }) => {
      const results = getResults(input.tournament);
      return results ?? { standings: [], leaderboard: [] };
    }),
});
