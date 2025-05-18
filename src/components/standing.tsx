import { Standing as StandingType } from "@/interfaces/standing.interface";
import Button from "./button";
import { useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import Player from "./player";
import Attribute from "./attribute";
export default function Standing({ standing }: { standing: StandingType }) {
  const [isOpen, setIsOpen] = useState(false);
  const [playersRef] = useAutoAnimate();

  return (
    <div className="flex flex-col gap-px">
      <Button
        className="flex items-center justify-between gap-1 bg-white dark:bg-gray-800 rounded shadow p-2 w-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <Attribute
            labelClassName="text-sm"
            valueClassName={
              standing.rank === 1
                ? "bg-amber-200 text-amber-800"
                : standing.rank === 2
                  ? "bg-slate-200 text-slate-800"
                  : standing.rank === 3
                    ? "bg-orange-200 text-orange-800"
                    : "bg-gray-600 text-white"
            }
            label="Rank"
            value={`${standing.isTied ? "T" : ""}${standing.rank}`}
          />
          <p className="truncate">{standing.name}</p>
        </div>
        <div className="flex items-center gap-1">
          {standing.lowestRankedPlayerBonus && (
            <Attribute
              labelClassName="text-sm"
              valueClassName="bg-purple-200 text-purple-800"
              label="Bonus"
              value="Low"
            />
          )}
          {standing.firstPlaceBonus && (
            <Attribute
              labelClassName="text-sm"
              valueClassName="bg-amber-200 text-amber-800"
              label="Bonus"
              value="1st"
            />
          )}
          {standing.madeCutBonus && (
            <Attribute
              labelClassName="text-sm"
              valueClassName="bg-green-200 text-green-800"
              label="Bonus"
              value="MC"
            />
          )}
          <Attribute
            labelClassName="text-sm"
            valueClassName="bg-gray-200 text-black"
            label="Points"
            value={standing.score}
          />
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
