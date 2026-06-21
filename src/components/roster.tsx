import { Fragment } from "react";

import Player, { PlayerColumnsHeader } from "@/components/player";
import type { Player as PlayerType } from "@/interfaces/player.interface";

const brackets = [
  { label: "1-5", min: 1, max: 5 },
  { label: "6-10", min: 6, max: 10 },
  { label: "11-20", min: 11, max: 20 },
  { label: "21+", min: 21, max: Infinity },
] as const;

interface Props {
  players: PlayerType[];
  cutLine?: number;
  round?: number;
}

export default function Roster({ players, cutLine, round }: Props) {
  const cutLabel = round !== undefined && round < 3 ? "Projected Cut" : "Cut";
  const cutInsertIndex = (() => {
    if (round !== undefined && round < 3 && cutLine !== undefined) {
      return players.findIndex((p) => (p.place ?? Infinity) > cutLine);
    }
    return players.findIndex((p) => p.place === undefined);
  })();

  return (
    <div className="flex flex-col gap-px overflow-hidden rounded-b">
      <div className="flex justify-around bg-white p-2 dark:bg-gray-800">
        {brackets.map((bracket) => {
          const count = players.filter(
            (p) => p.rank >= bracket.min && p.rank <= bracket.max,
          ).length;
          return (
            <div key={bracket.label} className="flex flex-col items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">{bracket.label}</span>
              <span className="text-sm font-bold">{count}</span>
            </div>
          );
        })}
      </div>
      <PlayerColumnsHeader />
      {players.map((player, index) => (
        <Fragment key={`${player.firstName} ${player.lastName}`}>
          {index === cutInsertIndex && cutInsertIndex >= 0 && (
            <div className="flex items-center gap-2 bg-white px-2 py-1 dark:bg-gray-800">
              <div className="h-px flex-1 bg-red-500/60" />
              <span className="text-xs font-semibold tracking-wide text-red-500">{cutLabel}</span>
              <div className="h-px flex-1 bg-red-500/60" />
            </div>
          )}
          <Player player={player} />
        </Fragment>
      ))}
    </div>
  );
}
