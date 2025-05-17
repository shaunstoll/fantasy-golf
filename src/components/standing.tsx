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
        className="flex items-center justify-between bg-white rounded shadow p-2 w-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <label className="text-xs text-gray-500">Rank</label>
            <p className="p-1 w-10 text-white text-sm font-bold bg-gray-600 text-center rounded">
              {`${standing.isTied ? "T" : ""}${standing.rank}`}
            </p>
          </div>
          <p className="text-black">{standing.name}</p>
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
                First
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
