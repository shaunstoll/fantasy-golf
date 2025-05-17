import { PlayerStatus } from "@/enums/player-status.enum";

export interface Leaderboard {
  [key: string]: {
    nationality: string;
    score: number;
    thru: number;
    isTied: boolean;
    place: number;
    status: PlayerStatus;
  };
}
