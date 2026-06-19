import { z } from "zod";

import DataGolfClient from "@/clients/data-golf.client";
import { allRankings } from "@/db/rankings";
import { getResults } from "@/db/results";
import { teams } from "@/db/teams";
import { TournamentName } from "@/enums/tournament.enum";
import { currentTournament, getTournamentConfig } from "@/config/tournaments";
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
    const { cutLine } = getTournamentConfig(currentTournament);
    const results = getResults(currentTournament);
    if (results) return { standings: results.standings, cutLine, round: 4 };
    const tournament = await dataGolfClient.getTournament();
    return {
      standings: scoringService.getStandings(teams, tournament),
      cutLine,
      round: tournament.round,
    };
  }),
  leaderboard: publicProcedure.query(async () => {
    const { cutLine } = getTournamentConfig(currentTournament);
    const results = getResults(currentTournament);
    if (results) return { players: results.leaderboard, cutLine, round: 4 };
    const tournament = await dataGolfClient.getTournament();
    return {
      players: scoringService.getLeaderboard(teams, tournament, allRankings),
      cutLine,
      round: tournament.round,
    };
  }),
  results: publicProcedure
    .input(z.object({ tournament: tournamentNameSchema }))
    .query(({ input }) => {
      const results = getResults(input.tournament);
      return results ?? { standings: [], leaderboard: [] };
    }),
});
