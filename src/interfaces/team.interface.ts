import type { Ranking } from "@/interfaces/ranking.interface";

export interface Team {
  name: string;
  players: Ranking[];
}
