import { Player } from "./player.interface";

export interface Standing {
  name: string;
  score: number;
  players: Player[];
}
