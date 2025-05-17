import { Player } from "./player.interface";

export interface Standing {
  name: string;
  score: number;
  rank: number;
  isTied: boolean;
  lowestRankedPlayerBonus: boolean;
  madeCutBonus: boolean;
  firstPlaceBonus: boolean;
  players: Player[];
}
