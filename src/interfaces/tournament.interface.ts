import { TournamentName } from "@/enums/tournament.enum";
import { Leaderboard } from "./leaderboard.interface";

export interface Tournament {
  name: TournamentName;
  round: number;
  leaderboard: Leaderboard;
}
