/**
 * The per-player point categories shared by every scoring path.
 *
 * Both ScoringService.getStandings (team rosters, with captain multipliers) and
 * getLeaderboard (the flat field-wide board) award these exact same categories.
 * They used to compute them in two parallel blocks, which silently drifted — the
 * lowest-ranked bonus once used the whole field on the leaderboard but only owned
 * players in standings. Keeping the math here, in one pure function, means the two
 * callers can never disagree again. The lowest-ranked +15 lives in the callers,
 * not here, because they apply it differently (standings adds it flat after the
 * captain multiplier; the leaderboard has no multiplier).
 */
export interface PlayerPoints {
  placementPoints: number;
  rankingBonus: number;
  madeCutBonusPoints: number;
  firstPlaceBonusPoints: number;
  /** True when the player missed the (projected) cut in an in-progress event. */
  outsideCutLine: boolean;
}

export function computePlayerPoints({
  place,
  isTied,
  rank,
  round,
  cutLine,
}: {
  place: number;
  isTied: boolean;
  rank: number;
  round: number;
  cutLine: number;
}): PlayerPoints {
  let placementPoints = 0;
  let rankingBonus = 0;
  let madeCutBonusPoints = 0;
  let firstPlaceBonusPoints = 0;

  if (place === 1 && !isTied) {
    firstPlaceBonusPoints = 15;
  }
  if (place <= 10) {
    placementPoints += 11 - place;
  }
  if (place <= 15) {
    placementPoints += 4;
  }
  if (place <= 25) {
    placementPoints += 3;
    if (rank > 10 && rank <= 20) {
      rankingBonus = 6;
    }
    if (rank > 20) {
      rankingBonus = 11;
    }
  }

  const outsideCutLine = round < 3 && place > cutLine;
  if (!outsideCutLine && rank > 5) {
    madeCutBonusPoints = 5;
  }

  return {
    placementPoints,
    rankingBonus,
    madeCutBonusPoints,
    firstPlaceBonusPoints,
    outsideCutLine,
  };
}
