import { Standing as StandingType } from "@/interfaces/standing.interface";

export default function Standing({ standing }: { standing: StandingType }) {
  return (
    <div className="flex gap-5">
      <p>{standing.name}</p>
      <p>{standing.score}</p>
    </div>
  );
}
