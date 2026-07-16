import { currentTournament } from "@/config/tournaments";
import { TournamentName } from "@/enums/tournament.enum";
import type { Ranking } from "@/interfaces/ranking.interface";
import mastersRankings from "@data/2026/masters-rankings.json";
import openRankings from "@data/2026/open-rankings.json";
import usOpenRankings from "@data/2026/us-open-rankings.json";

const rankingsByTournament: Partial<Record<TournamentName, Record<string, Ranking>>> = {
  [TournamentName.Masters]: mastersRankings,
  [TournamentName.UsOpen]: usOpenRankings,
  [TournamentName.Open]: openRankings,
};

export function getRankings(tournament: TournamentName): Record<string, Ranking> {
  return rankingsByTournament[tournament] ?? {};
}

export const allRankings: Record<string, Ranking> = getRankings(currentTournament);
