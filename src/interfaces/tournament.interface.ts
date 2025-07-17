import type { TournamentName } from "@/enums/tournament.enum";
import type { Leaderboard } from "@/interfaces/leaderboard.interface";

export interface Tournament {
  name: TournamentName;
  round: number;
  leaderboard: Leaderboard;
}
