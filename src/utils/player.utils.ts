import { PlayerStatus } from "@/enums/player-status.enum";
import type { LeaderboardPlayer } from "@/interfaces/leaderboard-player.interface";
import type { Player } from "@/interfaces/player.interface";

/**
 * The leaderboard-style place label: a status abbreviation when the player isn't
 * actively placed, otherwise the (optionally tied) finishing position. Shared by
 * the roster player row and the leaderboard row so they never diverge.
 */
export function formatPlace(player: {
  status: PlayerStatus;
  isTied: boolean;
  place?: number;
}): string | number | undefined {
  switch (player.status) {
    case PlayerStatus.MISSED_CUT:
      return "MC";
    case PlayerStatus.WITHDRAWN:
      return "WD";
    case PlayerStatus.DID_NOT_START:
      return "-";
    default:
      return player.isTied ? `T${player.place}` : player.place;
  }
}

/**
 * Adapt a field-wide LeaderboardPlayer to the roster Player shape so both can
 * render through the same Player component. The leaderboard has no captain
 * multiplier (1), and carries bonus *points* rather than booleans — derive the
 * boolean flags from those points for the bonus dots.
 */
export function leaderboardPlayerToPlayer(p: LeaderboardPlayer): Player {
  return {
    firstName: p.firstName,
    lastName: p.lastName,
    rank: p.rank,
    place: p.place,
    nationality: p.nationality,
    status: p.status,
    score: p.score,
    thru: p.thru,
    isTied: p.isTied,
    fantasyScore: p.fantasyScore,
    multiplier: 1,
    ownedCount: p.ownedCount,
    ownedTotal: p.ownedTotal,
    firstPlaceBonus: p.firstPlaceBonusPoints > 0,
    madeCutBonus: p.madeCutBonusPoints > 0,
    lowestRankedPlayerBonus: p.lowestRankedBonusPoints > 0,
    placementPoints: p.placementPoints,
    rankingBonus: p.rankingBonus,
    madeCutBonusPoints: p.madeCutBonusPoints,
    firstPlaceBonusPoints: p.firstPlaceBonusPoints,
    lowestRankedBonusPoints: p.lowestRankedBonusPoints,
  };
}
