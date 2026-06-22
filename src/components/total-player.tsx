import { useAutoAnimate } from "@formkit/auto-animate/react";
import Image from "next/image";
import { useState } from "react";

import Attribute from "@/components/attribute";
import Button from "@/components/button";
import type { SortDir, SortKey } from "@/components/leaderboard";
import { earnedBonuses } from "@/config/bonuses";
import { type TournamentConfig } from "@/config/tournaments";
import type { PlayerStatus } from "@/enums/player-status.enum";
import type { TournamentName } from "@/enums/tournament.enum";
import { flagCode } from "@/utils/nationality.utils";
import { formatPlace } from "@/utils/player.utils";

export interface MajorFinish {
  place?: number;
  isTied: boolean;
  status: PlayerStatus;
  fantasyScore: number;
  rank: number;
  ownedCount: number;
  ownedTotal: number;
  // Bonus flags for this major, so the breakdown shows the same markers
  // (Winner / Made cut / Lowest ranked) as the rest of the app. The
  // lowest-ranked +15 is kept as points so the Total view can toggle it off.
  firstPlaceBonus: boolean;
  madeCutBonus: boolean;
  lowestRankedBonusPoints: number;
}

/** A player's season totals across the majors, for the leaderboard Total view. */
export interface TotalEntry {
  firstName: string;
  lastName: string;
  nationality: string;
  totalPoints: number;
  // The portion of totalPoints from lowest-ranked +15 bonuses, so it can be
  // removed when the Low toggle is off.
  lowPoints: number;
  // Total picks across every major (a team-major slot), and the per-major finish.
  picks: number;
  finishByMajor: Partial<Record<TournamentName, MajorFinish>>;
}

/** Total-view columns are season aggregates (ownership %, total points), not the
 *  per-major Rank/Owned/Thru/Score/Points — so it needs its own header. */
export function TotalColumnsHeader({
  activeKey,
  sortDir,
  onSort,
  children,
}: {
  activeKey: Extract<SortKey, "owned" | "points">;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  children?: React.ReactNode;
}) {
  const columns: { label: string; key: Extract<SortKey, "owned" | "points"> }[] = [
    { label: "Own%", key: "owned" },
    { label: "Points", key: "points" },
  ];
  return (
    <div
      className={`
        flex items-center justify-between gap-1 bg-white p-1 pr-2 text-xs
        font-semibold text-gray-500
        dark:bg-gray-800 dark:text-gray-400
      `}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1 pl-1">
        {children ?? <span className="truncate">Player</span>}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {columns.map((column) => {
          const isActive = activeKey === column.key;
          return (
            <Button
              key={column.key}
              onClick={() => onSort(column.key)}
              aria-pressed={isActive}
              className={`
                flex w-10 flex-col items-center rounded py-1.5 leading-tight
                ${
                  isActive
                    ? "bg-gray-200 text-black dark:bg-gray-700 dark:text-white"
                    : "text-gray-500 dark:text-gray-400"
                }
              `}
            >
              <span>{column.label}</span>
              {isActive && (
                <span className="text-[10px] leading-none">{sortDir === "asc" ? "▲" : "▼"}</span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * A leaderboard row for the season Total view: a player's combined fantasy
 * points and ownership across all majors. Tapping the row expands to show the
 * player's finish (and points) in each major.
 */
export default function TotalPlayer({
  entry,
  slots,
  majors,
  lowEnabled,
}: {
  entry: TotalEntry;
  // Total team-major slots across the majors with data — the ownership %
  // denominator (e.g. 36 teams × 3 majors), so it's a season %, not "x/36".
  slots: number;
  majors: TournamentConfig[];
  // When false, the lowest-ranked +15 is excluded from points and the "L" marker.
  lowEnabled: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [detailRef] = useAutoAnimate();
  const ownership = slots > 0 ? Math.round((entry.picks / slots) * 100) : 0;
  const totalPoints = entry.totalPoints - (lowEnabled ? 0 : entry.lowPoints);

  return (
    <div className="flex flex-col gap-px">
      <Button
        className={`
          flex w-full items-center justify-between gap-1 bg-white p-1 pr-2
          text-left
          dark:bg-gray-800
        `}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`player ${entry.firstName} ${entry.lastName}`}
      >
        <div className="flex min-w-0 items-center gap-1">
          <div className="flex w-9 shrink-0 flex-col items-center">
            <Image
              src={`https://datagolf.com/static/flags/${flagCode(entry.nationality)}.png`}
              alt={entry.nationality}
              width={20}
              height={20}
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm">{entry.firstName}</p>
            <p className="truncate">{entry.lastName}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Attribute
            hideLabel
            valueClassName="bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            label="Ownership"
            value={`${ownership}%`}
          />
          <Attribute
            hideLabel
            valueClassName="bg-gray-600 text-white dark:bg-gray-200 dark:text-black"
            label="Points"
            value={totalPoints}
          />
        </div>
      </Button>

      <div ref={detailRef}>
        {isOpen && (
          <div
            data-testid="total-finishes"
            className="flex flex-col gap-px bg-white/80 py-1 dark:bg-gray-800/80"
          >
            {/* Column header for the per-major breakdown. */}
            <div
              className={`
                flex items-center justify-between gap-1 px-1 pr-2 text-xs
                font-semibold text-gray-500
                dark:text-gray-400
              `}
            >
              <span className="flex-1 pl-1">Major</span>
              <div className="flex shrink-0 items-center gap-1.5">
                <span className="w-10 text-center">Rank</span>
                <span className="w-10 text-center">Owned</span>
                <span className="w-10 text-center">Finish</span>
                <span className="w-10 text-center">Points</span>
              </div>
            </div>
            {/* One row per major: name on the left, finish + points on the right. */}
            {majors.map((t) => {
              const finish = entry.finishByMajor[t.name];
              const lowOn = lowEnabled && (finish?.lowestRankedBonusPoints ?? 0) > 0;
              const markers = finish
                ? earnedBonuses({
                    firstPlaceBonus: finish.firstPlaceBonus,
                    madeCutBonus: finish.madeCutBonus,
                    lowestRankedPlayerBonus: lowOn,
                  })
                : [];
              const points = finish
                ? finish.fantasyScore - (lowEnabled ? 0 : finish.lowestRankedBonusPoints)
                : undefined;
              return (
                <div key={t.name} className="flex items-center justify-between gap-1 px-1 pr-2">
                  <span className="flex-1 truncate pl-1 text-sm font-medium">{t.sortLabel}</span>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {markers.map((b) => (
                      <span
                        key={b.key}
                        title={b.label}
                        className={`text-sm font-bold ${b.colorClass}`}
                      >
                        {b.letter}
                      </span>
                    ))}
                    <Attribute
                      hideLabel
                      valueClassName="bg-gray-200 text-black dark:bg-gray-600 dark:text-white"
                      label="Rank"
                      value={finish ? (finish.rank > 0 ? `#${finish.rank}` : "-") : "—"}
                    />
                    <Attribute
                      hideLabel
                      valueClassName="bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      label="Owned"
                      value={finish ? `${finish.ownedCount}/${finish.ownedTotal}` : "—"}
                    />
                    <Attribute
                      hideLabel
                      valueClassName="bg-gray-200 text-black dark:bg-gray-600 dark:text-white"
                      label="Finish"
                      value={finish ? (formatPlace(finish) ?? "-") : "—"}
                    />
                    <Attribute
                      hideLabel
                      valueClassName="bg-gray-600 text-white dark:bg-gray-200 dark:text-black"
                      label="Points"
                      value={points ?? "—"}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
