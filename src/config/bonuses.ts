/**
 * Single source of truth for the three bonus markers shown as colored dots on
 * team rows and player rows, and explained in the header legend. Keeping the
 * color, label, and description here keeps the dots and the legend in sync —
 * they previously drifted (a team dot read "All made cut" while the legend and
 * player dot read "Made cut").
 */
export interface BonusFlags {
  firstPlaceBonus: boolean;
  madeCutBonus: boolean;
  lowestRankedPlayerBonus: boolean;
}

export interface BonusDef {
  key: keyof BonusFlags;
  /** Single bold letter shown as the marker. */
  letter: string;
  /** Tailwind text-color class for the letter (kept in light and dark modes). */
  colorClass: string;
  label: string;
  description: string;
}

export const bonuses: BonusDef[] = [
  {
    key: "firstPlaceBonus",
    letter: "1",
    colorClass: "text-amber-500",
    label: "Winner",
    description: "A pick finished 1st outright — worth a +15 bonus.",
  },
  {
    key: "madeCutBonus",
    letter: "M",
    colorClass: "text-green-500",
    label: "Made cut",
    description: "Made-cut bonus earned (a team earns it only when every pick makes the cut).",
  },
  {
    key: "lowestRankedPlayerBonus",
    letter: "L",
    colorClass: "text-purple-500",
    label: "Lowest ranked",
    description: "The lowest-ranked player to finish inside the top 25 — worth a +15 bonus.",
  },
];

/** The bonus markers a team or player has earned, in display order. */
export function earnedBonuses(flags: BonusFlags): BonusDef[] {
  return bonuses.filter((b) => flags[b.key]);
}
