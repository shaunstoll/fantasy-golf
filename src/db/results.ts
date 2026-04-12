import type { LeaderboardPlayer } from "@/interfaces/leaderboard-player.interface";
import type { Standing } from "@/interfaces/standing.interface";
import { TournamentName } from "@/enums/tournament.enum";
import mastersResults from "@data/2026/masters-results.json";

interface TournamentResults {
  standings: Standing[];
  leaderboard: LeaderboardPlayer[];
}

const resultsByTournament: Partial<Record<TournamentName, TournamentResults>> = {
  [TournamentName.Masters]: mastersResults as TournamentResults,
};

export function getResults(tournament: TournamentName): TournamentResults | undefined {
  return resultsByTournament[tournament];
}
