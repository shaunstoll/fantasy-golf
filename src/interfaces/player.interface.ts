import type { PlayerStatus } from "@/enums/player-status.enum";

export interface Player {
  firstName: string;
  lastName: string;
  rank: number;
  place?: number;
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
  ownedCount: number;
  ownedTotal: number;
  // Per-category point parts powering the expandable breakdown. Optional because
  // results frozen before these existed (e.g. masters-results.json) lack them;
  // the Player component falls back to the total when they're absent. These are
  // raw, pre-multiplier points — except lowestRankedBonusPoints, which is the
  // flat +15 added after the captain multiplier (see ScoringService).
  placementPoints?: number;
  rankingBonus?: number;
  madeCutBonusPoints?: number;
  firstPlaceBonusPoints?: number;
  lowestRankedBonusPoints?: number;
}
