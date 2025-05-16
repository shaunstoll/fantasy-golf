import { Standing as StandingType } from "@/interfaces/standing.interface";

export default function Standing({ standing }: { standing: StandingType }) {
  return (
    <div className="flex items-center justify-between bg-white rounded shadow p-2">
      <div className="flex items-center gap-2">
        <p className="p-1 w-10 text-white text-sm font-bold bg-gray-600 text-center rounded">{`${standing.isTied ? "T" : ""}${standing.rank}`}</p>
        <p>{standing.name}</p>
      </div>
      <p>{standing.score}</p>
    </div>
  );
}
