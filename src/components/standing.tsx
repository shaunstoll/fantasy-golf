import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Star } from "lucide-react";
import { useState } from "react";

import Attribute from "@/components/attribute";
import Button from "@/components/button";
import Player from "@/components/player";
import type { Standing as StandingType } from "@/interfaces/standing.interface";
import { useStore } from "@/store";

export default function Standing({ standing }: { standing: StandingType }) {
  const { favoriteTeams, toggleFavoriteTeam } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [playersRef] = useAutoAnimate();

  return (
    <div className="flex flex-col gap-px">
      <div className="flex items-center">
        <Button
          className={`
            self-stretch rounded-l bg-white p-2 shadow
            dark:bg-gray-800
          `}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavoriteTeam(standing.name);
          }}
        >
          <Star
            className="size-6 text-amber-400"
            fill={favoriteTeams.includes(standing.name) ? "currentColor" : "none"}
          />
        </Button>
        <Button
          className={`
            flex w-full items-center justify-between gap-2 rounded-r bg-white
            p-2 shadow
            dark:bg-gray-800
          `}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={`team ${standing.name}`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
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
          <div className="flex flex-col gap-px overflow-hidden rounded-b">
            {standing.players.map((player) => {
              return <Player key={`${player.firstName} ${player.lastName}`} player={player} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
