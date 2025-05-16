import { Player } from "./player.interface";

export interface Standing {
  name: string;
  score: number;
  rank: number;
  isTied: boolean;
  players: Player[];
}
