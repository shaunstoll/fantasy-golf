import { Player as PlayerType } from "@/interfaces/player.interface";
import { PlayerStatus } from "@/enums/player-status.enum";

export default function Player({ player }: { player: PlayerType }) {
  const place =
    player.status === PlayerStatus.MISSED_CUT
      ? "MC"
      : player.status === PlayerStatus.WITHDRAWN
        ? "WD"
        : player.isTied
          ? `T${player.place}`
          : player.place;
  return (
    <div className="flex bg-white items-center justify-between p-1 pr-2">
      <div className="flex items-center gap-1">
        <p className="font-bold text-black text-sm rounded p-1 w-10 text-center">
          {place}
        </p>
        <div>
          <p className="text-black text-sm">{player.firstName}</p>
          <p className="text-black">{player.lastName}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {player.multiplier > 1 && (
          <div className="flex flex-col items-center">
            <label className="text-xs text-gray-500">Weight</label>
            <p className="font-bold text-sm w-10 rounded p-1 text-center bg-blue-200 text-blue-800">
              {player.multiplier}x
            </p>
          </div>
        )}
        {player.lowestRankedPlayerBonus && (
          <div className="flex flex-col items-center">
            <label className="text-xs text-gray-500">Bonus</label>
            <p className="font-bold text-sm w-10 rounded p-1 text-center bg-purple-200 text-purple-800">
              Low
            </p>
          </div>
        )}
        {player.firstPlaceBonus && (
          <div className="flex flex-col items-center">
            <label className="text-xs text-gray-500">Bonus</label>
            <p className="font-bold text-sm w-10 rounded p-1 text-center bg-amber-200 text-amber-800">
              First
            </p>
          </div>
        )}
        {player.madeCutBonus && (
          <div className="flex flex-col items-center">
            <label className="text-xs text-gray-500">Bonus</label>
            <p className="font-bold text-sm w-10 rounded p-1 text-center bg-green-200 text-green-800">
              MC
            </p>
          </div>
        )}
        <div className="flex flex-col items-center">
          <label className="text-xs text-gray-500">Rank</label>
          <p className="text-gray-800 font-bold text-sm w-10 bg-gray-200 rounded p-1 text-center">
            {player.rank}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <label className="text-xs text-gray-500">Points</label>
          <p className="text-white font-bold text-sm w-10 bg-gray-600 rounded p-1 text-center">
            {player.fantasyScore}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <label className="text-xs text-gray-500">Score</label>
          <p
            className={`font-bold text-sm w-10 text-white rounded p-1 text-center ${
              player.score > 0
                ? "bg-green-700"
                : player.score < 0
                  ? "bg-red-700"
                  : "bg-gray-700"
            }`}
          >
            {player.score > 0
              ? `+${player.score}`
              : player.score === 0
                ? "E"
                : player.score}
          </p>
        </div>
      </div>
    </div>
  );
}
