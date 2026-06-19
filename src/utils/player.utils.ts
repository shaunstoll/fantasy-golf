import { PlayerStatus } from "@/enums/player-status.enum";

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
