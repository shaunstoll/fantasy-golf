import { Standing as StandingType } from "@/interfaces/standing.interface";
import Button from "./button";
import { useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
export default function Standing({ standing }: { standing: StandingType }) {
  const [isOpen, setIsOpen] = useState(false);
  const [playersRef] = useAutoAnimate();

  return (
    <div className="flex flex-col gap-1">
      <Button
        className="flex items-center justify-between bg-white rounded shadow p-2 w-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <p className="p-1 w-10 text-white text-sm font-bold bg-gray-600 text-center rounded">{`${standing.isTied ? "T" : ""}${standing.rank}`}</p>
          <p>{standing.name}</p>
        </div>
        <p className="font-bold text-sm w-14 bg-gray-200 rounded p-1">
          {standing.score}
        </p>
      </Button>

      <div ref={playersRef}>
        {isOpen && (
          <div className="flex flex-col gap-px">
            {standing.players.map((player) => {
              const name = `${player.firstName} ${player.lastName}`;
              return (
                <div
                  key={name}
                  className="flex bg-white items-center justify-between p-1"
                >
                  <div className="flex items-center gap-1">
                    <p className="font-bold bg-gray-200 text-sm rounded p-1 w-10 text-center">
                      {`${player.isTied ? "T" : ""}${player.place}`}
                    </p>
                    <p className="font-bold bg-gray-200 text-sm rounded-full p-1 size-7 text-center">
                      {player.rank}
                    </p>
                    <p>{name}</p>
                  </div>
                  <p className="font-bold text-sm w-14 bg-gray-200 rounded p-1 text-center">
                    {player.fantasyScore}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
