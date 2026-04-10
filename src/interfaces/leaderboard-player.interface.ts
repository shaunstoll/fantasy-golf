import type { PlayerStatus } from "@/enums/player-status.enum";

export interface LeaderboardPlayer {
  firstName: string;
  lastName: string;
  rank: number;
  place?: number;
  nationality: string;
  status: PlayerStatus;
  score: number;
  thru: string;
  isTied: boolean;
  placementPoints: number;
  rankingBonus: number;
  madeCutBonusPoints: number;
  firstPlaceBonusPoints: number;
  lowestRankedBonusPoints: number;
  fantasyScore: number;
  ownedCount: number;
  ownedTotal: number;
}
