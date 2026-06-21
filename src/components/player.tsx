import { useAutoAnimate } from "@formkit/auto-animate/react";
import Image from "next/image";
import { Fragment, useState } from "react";

import Attribute from "@/components/attribute";
import Button from "@/components/button";
import type { SortDir, SortKey } from "@/components/leaderboard";
import { earnedBonuses } from "@/config/bonuses";
import type { Player as PlayerType } from "@/interfaces/player.interface";
import { flagCode } from "@/utils/nationality.utils";
import { formatPlace } from "@/utils/player.utils";

// Column titles for the player rows, kept in sync with the Attribute order in
// the row below. `sortKey` marks the columns the leaderboard can sort by; Thru
// has none. Rendered once at the top of a list so rows don't repeat the labels.
const PLAYER_COLUMNS: { label: string; sortKey?: SortKey }[] = [
  { label: "Rank", sortKey: "rank" },
  { label: "Owned", sortKey: "owned" },
  { label: "Thru" },
  { label: "Score", sortKey: "score" },
  { label: "Points", sortKey: "points" },
];

interface PlayerColumnsHeaderProps {
  // Left-region content (defaults to a "Player" label). The leaderboard passes
  // its "Hide Unowned" toggle here.
  children?: React.ReactNode;
  // When provided, the matching columns become the sort control: tapping a
  // column sorts by it and the active one shows a direction caret. Omitted for
  // the roster, where the columns are plain titles.
  sortKey?: SortKey;
  sortDir?: SortDir;
  onSort?: (key: SortKey) => void;
}

/**
 * Header row that titles the player columns, aligned with the right-hand
 * Attribute cluster in each Player row (same fixed widths, gaps and padding).
 */
export function PlayerColumnsHeader({
  children,
  sortKey,
  sortDir,
  onSort,
}: PlayerColumnsHeaderProps) {
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
        {PLAYER_COLUMNS.map((column) => {
          if (!onSort || !column.sortKey) {
            return (
              <span key={column.label} className="w-10 text-center">
                {column.label}
              </span>
            );
          }
          const isActive = sortKey === column.sortKey;
          return (
            <Button
              key={column.label}
              onClick={() => onSort(column.sortKey!)}
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

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={`
        rounded bg-gray-100 px-1.5 py-0.5 font-mono font-bold
        dark:bg-gray-700
      `}
    >
      {children}
    </span>
  );
}

export default function Player({ player }: { player: PlayerType }) {
  const [isOpen, setIsOpen] = useState(false);
  const [detailRef] = useAutoAnimate();

  const place = formatPlace(player);

  // Pre-multiplier point categories. `hasBreakdown` is false for results frozen
  // before these fields existed (e.g. masters-results.json), where we can only
  // fall back to the final total.
  const hasBreakdown = player.placementPoints !== undefined;
  const firstPlacePoints = player.firstPlaceBonusPoints ?? 0;
  const placementPoints = player.placementPoints ?? 0;
  const rankingBonus = player.rankingBonus ?? 0;
  const madeCutBonusPoints = player.madeCutBonusPoints ?? 0;
  const lowestRankedBonusPoints = player.lowestRankedBonusPoints ?? 0;

  const parts: { label: string; value: number }[] = [];
  if (firstPlacePoints > 0) parts.push({ label: "1st", value: firstPlacePoints });
  if (placementPoints > 0) parts.push({ label: "Place", value: placementPoints });
  if (rankingBonus > 0) parts.push({ label: "Rank", value: rankingBonus });
  if (madeCutBonusPoints > 0) parts.push({ label: "MC", value: madeCutBonusPoints });

  return (
    <div className="flex flex-col gap-px">
      <Button
        className={`
          flex w-full items-center justify-between gap-1 bg-white p-1 pr-2
          text-left
          dark:bg-gray-800
        `}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`player ${player.firstName} ${player.lastName}`}
      >
        <div className="flex min-w-0 items-center gap-1">
          <div className="flex flex-col items-center">
            <Image
              src={`https://datagolf.com/static/flags/${flagCode(player.nationality)}.png`}
              alt={player.nationality}
              width={20}
              height={20}
            />
            <p className="w-9 rounded text-center text-sm font-bold">{place}</p>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm">{player.firstName}</p>
            <p className="truncate">{player.lastName}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {player.multiplier > 1 && (
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              {player.multiplier}×
            </span>
          )}
          {earnedBonuses(player).map((b) => (
            <span key={b.key} title={b.label} className={`text-sm font-bold ${b.colorClass}`}>
              {b.letter}
            </span>
          ))}
          <Attribute
            hideLabel
            valueClassName="bg-gray-200 text-black dark:bg-gray-600 dark:text-white"
            label="Rank"
            value={player.rank > 0 ? `#${player.rank}` : "-"}
          />
          <Attribute
            hideLabel
            valueClassName="bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            label="Owned"
            value={`${player.ownedCount}/${player.ownedTotal}`}
          />
          <Attribute
            hideLabel
            valueClassName="bg-gray-200 text-black dark:bg-gray-600 dark:text-white"
            label="Thru"
            value={player.thru}
          />
          <Attribute
            hideLabel
            valueClassName={`font-bold text-sm w-10 text-white rounded p-1 text-center ${
              player.score > 0 ? "bg-green-700" : player.score < 0 ? "bg-red-700" : "bg-gray-600"
            }`}
            label="Score"
            value={player.score > 0 ? `+${player.score}` : player.score === 0 ? "E" : player.score}
          />
          <Attribute
            hideLabel
            valueClassName="bg-gray-600 text-white dark:bg-gray-200 dark:text-black"
            label="Points"
            value={player.fantasyScore}
          />
        </div>
      </Button>

      <div ref={detailRef}>
        {isOpen && (
          <div
            data-testid="player-breakdown"
            className={`
              flex flex-wrap items-center justify-center gap-2 bg-white/80 p-2
              text-sm
              dark:bg-gray-800/80
            `}
          >
            {hasBreakdown && parts.length > 0 ? (
              <>
                {/* (parts) × multiplier captures the captain weighting; the
                    lowest-ranked +15 is added flat, outside the multiplier. */}
                {player.multiplier > 1 && <span className="text-gray-400">(</span>}
                {parts.map((part, i) => (
                  <Fragment key={part.label}>
                    {i > 0 && <span className="text-gray-400">+</span>}
                    <span className="flex items-center gap-0.5">
                      <Chip>{part.value}</Chip>
                      <span className="text-xs text-gray-500">{part.label}</span>
                    </span>
                  </Fragment>
                ))}
                {player.multiplier > 1 && (
                  <>
                    <span className="text-gray-400">)</span>
                    <span className="text-gray-400">×</span>
                    <span className="flex items-center gap-0.5">
                      <Chip>{player.multiplier}</Chip>
                      <span className="text-xs text-gray-500">Weight</span>
                    </span>
                  </>
                )}
                {lowestRankedBonusPoints > 0 && (
                  <>
                    <span className="text-gray-400">+</span>
                    <span className="flex items-center gap-0.5">
                      <Chip>{lowestRankedBonusPoints}</Chip>
                      <span className="text-xs text-gray-500">Low</span>
                    </span>
                  </>
                )}
                <span className="text-gray-400">=</span>
                <span className="rounded bg-gray-600 px-1.5 py-0.5 font-mono font-bold text-white">
                  {player.fantasyScore}
                </span>
              </>
            ) : (
              <span className="text-gray-500">
                {player.fantasyScore > 0 ? (
                  <span className="flex items-center gap-1">
                    Total
                    <span className="rounded bg-gray-600 px-1.5 py-0.5 font-mono font-bold text-white">
                      {player.fantasyScore}
                    </span>
                  </span>
                ) : (
                  "No fantasy points"
                )}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
