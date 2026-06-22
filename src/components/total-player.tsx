import { useAutoAnimate } from "@formkit/auto-animate/react";
import Image from "next/image";
import { useState } from "react";

import Attribute from "@/components/attribute";
import Button from "@/components/button";
import type { SortDir, SortKey } from "@/components/leaderboard";
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
}

/** A player's season totals across the majors, for the leaderboard Total view. */
export interface TotalEntry {
  firstName: string;
  lastName: string;
  nationality: string;
  totalPoints: number;
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
}: {
  entry: TotalEntry;
  // Total team-major slots across the majors with data — the ownership %
  // denominator (e.g. 36 teams × 3 majors), so it's a season %, not "x/36".
  slots: number;
  majors: TournamentConfig[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [detailRef] = useAutoAnimate();
  const ownership = slots > 0 ? Math.round((entry.picks / slots) * 100) : 0;

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
            value={entry.totalPoints}
          />
        </div>
      </Button>

      <div ref={detailRef}>
        {isOpen && (
          <div
            data-testid="total-finishes"
            className={`
              flex flex-wrap items-center justify-center gap-3 bg-white/80 p-2
              text-sm
              dark:bg-gray-800/80
            `}
          >
            {majors.map((t) => {
              const finish = entry.finishByMajor[t.name];
              return (
                <span key={t.name} className="flex items-center gap-1.5">
                  <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${t.badgeColor}`}>
                    {t.badgeLabel}
                  </span>
                  <span className="font-semibold">
                    {finish ? (formatPlace(finish) ?? "-") : "—"}
                  </span>
                  {finish && (
                    <span className="rounded bg-gray-600 px-1.5 py-0.5 font-mono text-xs font-bold text-white">
                      {finish.fantasyScore}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
