import { Standing as StandingType } from "@/interfaces/standing.interface";
import Button from "./button";
import { useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import Player from "./player";
export default function Standing({ standing }: { standing: StandingType }) {
  const [isOpen, setIsOpen] = useState(false);
  const [playersRef] = useAutoAnimate();

  return (
    <div className="flex flex-col gap-px">
      <Button
        className="flex items-center justify-between gap-1 bg-white rounded shadow p-2 w-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex flex-col items-center">
            <label className="text-xs text-gray-500">Rank</label>
            <p
              className={`p-1 w-10 text-sm font-bold text-center rounded ${
                standing.rank === 1
                  ? "bg-amber-200 text-amber-800"
                  : standing.rank === 2
                    ? "bg-slate-200 text-slate-800"
                    : standing.rank === 3
                      ? "bg-orange-200 text-orange-800"
                      : "bg-gray-600 text-white"
              }`}
            >
              {`${standing.isTied ? "T" : ""}${standing.rank}`}
            </p>
          </div>
          <p className="text-black truncate">{standing.name}</p>
        </div>
        <div className="flex items-center gap-1">
          {standing.lowestRankedPlayerBonus && (
            <div className="flex flex-col items-center">
              <label className="text-xs text-gray-500">Bonus</label>
              <p className="font-bold text-sm w-10 rounded p-1 text-center bg-purple-200 text-purple-800">
                Low
              </p>
            </div>
          )}
          {standing.firstPlaceBonus && (
            <div className="flex flex-col items-center">
              <label className="text-xs text-gray-500">Bonus</label>
              <p className="font-bold text-sm w-10 rounded p-1 text-center bg-amber-200 text-amber-800">
                1st
              </p>
            </div>
          )}
          {standing.madeCutBonus && (
            <div className="flex flex-col items-center">
              <label className="text-xs text-gray-500">Bonus</label>
              <p className="font-bold text-sm w-10 rounded p-1 text-center bg-green-200 text-green-800">
                MC
              </p>
            </div>
          )}
          <div className="flex flex-col items-center">
            <label className="text-xs text-gray-500">Points</label>
            <p className="font-bold text-sm w-11 bg-gray-200 rounded p-1 text-center text-black">
              {standing.score}
            </p>
          </div>
        </div>
      </Button>

      <div ref={playersRef}>
        {isOpen && (
          <div className="flex flex-col gap-px rounded-b overflow-hidden">
            {standing.players.map((player) => {
              return (
                <Player
                  key={`${player.firstName} ${player.lastName}`}
                  player={player}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
