import Image from "next/image";

import Attribute from "@/components/attribute";
import { PlayerStatus } from "@/enums/player-status.enum";
import type { Player as PlayerType } from "@/interfaces/player.interface";

export default function Player({ player }: { player: PlayerType }) {
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

  return (
    <div
      className={`
        grid grid-cols-[auto_1fr] gap-1 bg-white p-1 pr-2
        dark:bg-gray-800
      `}
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
    </div>
  );
}
