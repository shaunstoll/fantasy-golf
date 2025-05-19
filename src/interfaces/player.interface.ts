import { PlayerStatus } from "@/enums/player-status.enum";

export interface Player {
  firstName: string;
  lastName: string;
  rank: number;
  place: number | null;
  nationality: string;
  status: PlayerStatus;
  score: number;
  thru: string;
  lowestRankedPlayerBonus: boolean;
  madeCutBonus: boolean;
  firstPlaceBonus: boolean;
  isTied: boolean;
  fantasyScore: number;
  multiplier: number;
}
