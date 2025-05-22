import { Player as PlayerType } from "@/interfaces/player.interface";
import { PlayerStatus } from "@/enums/player-status.enum";
import Attribute from "./attribute";
import Image from "next/image";

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
    <div className="flex bg-white dark:bg-gray-800 justify-between p-1 pr-2">
      <div className="flex items-center gap-1">
        <div className="flex items-center flex-col">
          <Image
            src={`https://datagolf.com/static/flags/${player.nationality}.png`}
            alt={player.nationality}
            width={20}
            height={20}
          />
          <p className="font-bold  text-sm rounded w-9 text-center">{place}</p>
        </div>
        <div>
          <p className="text-sm">{player.firstName}</p>
          <p>{player.lastName}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1 justify-end">
        {player.multiplier > 1 && (
          <Attribute
            labelClassName="text-xs"
            valueClassName="bg-blue-200 text-blue-800"
            label="Weight"
            value={`${player.multiplier}x`}
          />
        )}
        {player.lowestRankedPlayerBonus && (
          <Attribute
            labelClassName="text-xs"
            valueClassName="bg-purple-200 text-purple-800"
            label="Bonus"
            value="Low"
          />
        )}
        {player.firstPlaceBonus && (
          <Attribute
            labelClassName="text-xs"
            valueClassName="bg-amber-200 text-amber-800"
            label="Bonus"
            value="1st"
          />
        )}
        {player.madeCutBonus && (
          <Attribute
            labelClassName="text-xs"
            valueClassName="bg-green-200 text-green-800"
            label="Bonus"
            value="MC"
          />
        )}
        <Attribute
          labelClassName="text-xs"
          valueClassName="bg-gray-200 text-black"
          label="Rank"
          value={player.rank}
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
            player.score > 0
              ? "bg-green-700"
              : player.score < 0
                ? "bg-red-700"
                : "bg-gray-600"
          }`}
          label="Score"
          value={
            player.score > 0
              ? `+${player.score}`
              : player.score === 0
                ? "E"
                : player.score
          }
        />
      </div>
    </div>
  );
}
