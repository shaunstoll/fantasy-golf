import { currentTournament } from "@/config/tournaments";
import { TournamentName } from "@/enums/tournament.enum";
import type { Ranking } from "@/interfaces/ranking.interface";
import mastersRankings from "@data/2026/masters-rankings.json";
import usOpenRankings from "@data/2026/us-open-rankings.json";

const rankingsByTournament: Partial<Record<TournamentName, Record<string, Ranking>>> = {
  [TournamentName.Masters]: mastersRankings,
  [TournamentName.UsOpen]: usOpenRankings,
};

export function getRankings(tournament: TournamentName): Record<string, Ranking> {
  return rankingsByTournament[tournament] ?? {};
}

export const allRankings: Record<string, Ranking> = getRankings(currentTournament);
