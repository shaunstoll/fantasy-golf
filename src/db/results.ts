import type { LeaderboardPlayer } from "@/interfaces/leaderboard-player.interface";
import type { Standing } from "@/interfaces/standing.interface";
import { TournamentName } from "@/enums/tournament.enum";
import mastersResults from "@data/2026/masters-results.json";
import pgaResults from "@data/2026/pga-results.json";
import usOpenResults from "@data/2026/us-open-results.json";

interface TournamentResults {
  standings: Standing[];
  leaderboard: LeaderboardPlayer[];
}

const resultsByTournament: Partial<Record<TournamentName, TournamentResults>> = {
  [TournamentName.Masters]: mastersResults as TournamentResults,
  [TournamentName.Pga]: pgaResults as TournamentResults,
  [TournamentName.UsOpen]: usOpenResults as TournamentResults,
};

export function getResults(tournament: TournamentName): TournamentResults | undefined {
  return resultsByTournament[tournament];
}
