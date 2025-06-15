import { TournamentName } from "@/enums/tournament.enum";
import { Leaderboard } from "@/interfaces/leaderboard.interface";

export interface Tournament {
  name: TournamentName;
  round: number;
  leaderboard: Leaderboard;
}
