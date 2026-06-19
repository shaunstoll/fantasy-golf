import { useAutoAnimate } from "@formkit/auto-animate/react";
import Image from "next/image";
import { Fragment, useState } from "react";

import Attribute from "@/components/attribute";
import Button from "@/components/button";
import { earnedBonuses, type BonusFlags } from "@/config/bonuses";
import type { LeaderboardPlayer } from "@/interfaces/leaderboard-player.interface";
import { flagCode } from "@/utils/nationality.utils";
import { formatPlace } from "@/utils/player.utils";

export default function LeaderboardPlayerRow({ player }: { player: LeaderboardPlayer }) {
  const [isOpen, setIsOpen] = useState(false);
  const [detailRef] = useAutoAnimate();

  const place = formatPlace(player);

  // The leaderboard carries bonus points (not booleans); derive the dot flags.
  const bonusFlags: BonusFlags = {
    firstPlaceBonus: player.firstPlaceBonusPoints > 0,
    madeCutBonus: player.madeCutBonusPoints > 0,
    lowestRankedPlayerBonus: player.lowestRankedBonusPoints > 0,
  };

  const parts: { label: string; value: number }[] = [];
  if (player.firstPlaceBonusPoints > 0)
    parts.push({ label: "1st", value: player.firstPlaceBonusPoints });
  if (player.placementPoints > 0) parts.push({ label: "Place", value: player.placementPoints });
  if (player.rankingBonus > 0) parts.push({ label: "Rank", value: player.rankingBonus });
  if (player.madeCutBonusPoints > 0) parts.push({ label: "MC", value: player.madeCutBonusPoints });
  if (player.lowestRankedBonusPoints > 0)
    parts.push({ label: "Low", value: player.lowestRankedBonusPoints });

  return (
    <div className="flex flex-col">
      <Button
        className={`
          flex items-center justify-between bg-white p-1 pr-2
          dark:bg-gray-800
        `}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex min-w-0 items-center gap-1 pr-1">
          <div className="flex shrink-0 flex-col items-center">
            <Image
              src={`https://datagolf.com/static/flags/${flagCode(player.nationality)}.png`}
              alt={player.nationality}
              width={20}
              height={20}
            />
            <p className="w-9 rounded text-center text-sm font-bold">{place}</p>
          </div>
          <div className="min-w-0 text-left">
            <p className="truncate text-sm">{player.firstName}</p>
            <p className="truncate">{player.lastName}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
          {earnedBonuses(bonusFlags).map((b) => (
            <span key={b.key} title={b.label} className={`size-2 rounded-full ${b.dotColor}`} />
          ))}
          <Attribute
            labelClassName="text-xs"
            valueClassName="bg-blue-200 text-blue-800"
            label="Owned"
            value={`${player.ownedCount}/${player.ownedTotal}`}
          />
          <Attribute
            labelClassName="text-xs"
            valueClassName="bg-gray-200 text-black"
            label="Rank"
            value={player.rank > 0 ? player.rank : "-"}
          />
          <Attribute
            labelClassName="text-xs"
            valueClassName="bg-gray-600 text-white"
            label="Points"
            value={player.fantasyScore}
          />
          <Attribute
            labelClassName="text-xs"
            valueClassName="bg-gray-200 text-black"
            label="Thru"
            value={player.thru}
          />
          <Attribute
            labelClassName="text-xs"
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
            className={`
              flex items-center justify-center gap-2 bg-white/80 p-2 text-sm
              dark:bg-gray-800/80
            `}
          >
            {parts.length > 0 ? (
              <>
                {parts.map((part, i) => (
                  <Fragment key={part.label}>
                    {i > 0 && <span className="text-gray-400">+</span>}
                    <span className="flex items-center gap-0.5">
                      <span
                        className={`
                          rounded bg-gray-100 px-1.5 py-0.5 font-mono font-bold
                          dark:bg-gray-700
                        `}
                      >
                        {part.value}
                      </span>
                      <span className="text-xs text-gray-500">{part.label}</span>
                    </span>
                  </Fragment>
                ))}
                <span className="text-gray-400">=</span>
                <span className="rounded bg-gray-600 px-1.5 py-0.5 font-mono font-bold text-white">
                  {player.fantasyScore}
                </span>
              </>
            ) : (
              <span className="text-gray-500">No fantasy points</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
