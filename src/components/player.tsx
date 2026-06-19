import { useAutoAnimate } from "@formkit/auto-animate/react";
import Image from "next/image";
import { Fragment, useState } from "react";

import Attribute from "@/components/attribute";
import Button from "@/components/button";
import { PlayerStatus } from "@/enums/player-status.enum";
import type { Player as PlayerType } from "@/interfaces/player.interface";

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

  const place =
    player.status === PlayerStatus.MISSED_CUT
      ? "MC"
      : player.status === PlayerStatus.WITHDRAWN
        ? "WD"
        : player.status === PlayerStatus.DID_NOT_START
          ? "-"
          : player.isTied
            ? `T${player.place}`
            : player.place;

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
          grid w-full grid-cols-[auto_1fr] gap-1 bg-white p-1 pr-2 text-left
          dark:bg-gray-800
        `}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`player ${player.firstName} ${player.lastName}`}
      >
        <div className="row-span-2 flex items-center gap-1">
          <div className="flex flex-col items-center">
            <Image
              src={`https://datagolf.com/static/flags/${player.nationality}.png`}
              alt={player.nationality}
              width={20}
              height={20}
            />
            <p className="w-9 rounded text-center text-sm font-bold">{place}</p>
          </div>
          <div>
            <p className="text-sm">{player.firstName}</p>
            <p>{player.lastName}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-1">
          {player.multiplier > 1 && (
            <Attribute
              labelClassName="hidden"
              valueClassName="bg-amber-100 text-amber-900"
              label="Weight"
              value={`${player.multiplier}x`}
            />
          )}
          <Attribute
            labelClassName="hidden"
            valueClassName="bg-blue-200 text-blue-800"
            label="Owned"
            value={`${player.ownedCount}/${player.ownedTotal}`}
          />
          <Attribute
            labelClassName="hidden"
            valueClassName="bg-gray-200 text-black"
            label="Rank"
            value={player.rank > 0 ? `#${player.rank}` : "-"}
          />
          <Attribute
            labelClassName="hidden"
            valueClassName="bg-gray-600 text-white"
            label="Points"
            value={player.fantasyScore}
          />
        </div>
        <div className="flex items-center justify-end gap-1">
          {player.lowestRankedPlayerBonus && (
            <Attribute
              labelClassName="hidden"
              valueClassName="bg-purple-200 text-purple-800"
              label="Bonus"
              value="Low"
            />
          )}
          {player.firstPlaceBonus && (
            <Attribute
              labelClassName="hidden"
              valueClassName="bg-amber-200 text-amber-800"
              label="Bonus"
              value="1st"
            />
          )}
          {player.madeCutBonus && (
            <Attribute
              labelClassName="hidden"
              valueClassName="bg-green-200 text-green-800"
              label="Bonus"
              value="MC"
            />
          )}
          <Attribute
            labelClassName="hidden"
            valueClassName="bg-gray-200 text-black"
            label="Thru"
            value={player.thru}
          />
          <Attribute
            labelClassName="hidden"
            valueClassName={`font-bold text-sm w-10 text-white rounded p-1 text-center ${
              player.score > 0 ? "bg-green-700" : player.score < 0 ? "bg-red-700" : "bg-gray-600"
            }`}
            label="Score"
            value={player.score > 0 ? `+${player.score}` : player.score === 0 ? "E" : player.score}
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
