import { Standing as StandingType } from "@/interfaces/standing.interface";
import Button from "./button";
import { useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import Player from "./player";
import Attribute from "./attribute";
import { Star } from "lucide-react";
import { useStore } from "@/store";

export default function Standing({ standing }: { standing: StandingType }) {
  const { favoriteTeams, toggleFavoriteTeam } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [playersRef] = useAutoAnimate();

  return (
    <div className="flex flex-col gap-px">
      <div className="flex items-center">
        <Button
          className="bg-white dark:bg-gray-800 rounded-l shadow h-full p-2"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavoriteTeam(standing.name);
          }}
        >
          <Star
            className="size-6 text-gray-500 dark:text-white"
            fill={
              favoriteTeams.some((teamName) => teamName === standing.name)
                ? "currentColor"
                : "none"
            }
          />
        </Button>
        <Button
          className="flex items-center justify-between gap-2 w-full bg-white dark:bg-gray-800 p-2 rounded-r shadow"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex gap-3 items-center overflow-hidden">
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
      </div>

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
