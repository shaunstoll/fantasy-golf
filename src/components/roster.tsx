import Player from "@/components/player";
import type { Player as PlayerType } from "@/interfaces/player.interface";

const brackets = [
  { label: "1-5", min: 1, max: 5 },
  { label: "6-10", min: 6, max: 10 },
  { label: "11-20", min: 11, max: 20 },
  { label: "21+", min: 21, max: Infinity },
] as const;

export default function Roster({ players }: { players: PlayerType[] }) {
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
      {players.map((player) => (
        <Player key={`${player.firstName} ${player.lastName}`} player={player} />
      ))}
    </div>
  );
}
