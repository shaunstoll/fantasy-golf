"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import Button from "@/components/button";
import Footer from "@/components/footer";
import StandingsSkeleton from "@/components/loaders/standings.skeleton";
import Standing from "@/components/standing";
import { TournamentName } from "@/enums/tournament.enum";
import { useStore } from "@/store";
import { api } from "@/trpc/react";

const tournamentOptions: { key: TournamentName; label: string }[] = [
  { key: TournamentName.Masters, label: "Masters" },
  { key: TournamentName.Pga, label: "PGA" },
  { key: TournamentName.UsOpen, label: "US Open" },
  { key: TournamentName.Open, label: "Open" },
];

function getDefaultTournament(): TournamentName {
  const month = new Date().getMonth();
  switch (month) {
    case 3:
      return TournamentName.Masters;
    case 4:
      return TournamentName.Pga;
    case 5:
      return TournamentName.UsOpen;
    case 6:
      return TournamentName.Open;
    default:
      return TournamentName.Open;
  }
}

export default function Standings() {
  const { favoriteTeams } = useStore();
  const [standingsRef] = useAutoAnimate();
  const [search, setSearch] = useState("");
  const [tournament, setTournament] = useState(getDefaultTournament);
  const standingsQuery = api.tournament.get.useQuery(undefined, {
    refetchInterval: 5000,
  });

  if (standingsQuery.error) {
    console.error(standingsQuery.error);
    return (
      <main className="flex h-2/3 flex-col items-center justify-center gap-2 text-xl">
        <div className="flex flex-col items-center">
          <p>An error occurred.</p>
          <p>Error: {standingsQuery.error.message}</p>
          <p>Please try refreshing the page.</p>
        </div>
        <Link href="/">
          <Button className="rounded bg-orange-500 px-2 py-1 font-bold shadow">Refresh</Button>
        </Link>
      </main>
    );
  }

  if (standingsQuery.isLoading) return <StandingsSkeleton />;

  if (!standingsQuery.data) return <main>No Standings Found</main>;

  const isCurrentTournament = tournament === getDefaultTournament();
  const data = isCurrentTournament ? standingsQuery.data : [];

  const query = search.toLowerCase();
  const filtered = query ? data.filter((s) => s.name.toLowerCase().includes(query)) : data;

  const favoriteStandings = filtered.filter((standing) => favoriteTeams.includes(standing.name));

  return (
    <>
      <div className="flex items-center rounded-full bg-white dark:bg-gray-800">
        <Search className="ml-3 size-5 shrink-0 opacity-50" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search teams..."
          className="w-full bg-transparent px-3 py-2 text-base outline-none"
        />
        {search && (
          <button type="button" className="pr-3" onClick={() => setSearch("")}>
            <X className="size-5 shrink-0 opacity-50" />
          </button>
        )}
      </div>

      <div className="flex gap-1">
        {tournamentOptions.map((option) => (
          <Button
            key={option.key}
            className={`
              rounded-full px-3 py-1.5 text-sm font-medium
              ${
                tournament === option.key
                  ? "bg-white text-black dark:bg-gray-700 dark:text-white"
                  : "text-gray-500 dark:text-gray-400"
              }
            `}
            onClick={() => setTournament(option.key)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <main className="flex flex-col gap-1 pb-20" ref={standingsRef}>
        {favoriteStandings.map((standing) => (
          <Standing key={standing.name} standing={standing} />
        ))}
        {favoriteStandings.length > 0 && (
          <div className="my-1 border-t border-gray-400 dark:border-gray-600" />
        )}
        {filtered.map((standing) => (
          <Standing key={standing.name} standing={standing} />
        ))}
        <div className="mt-4">
          <Footer />
        </div>
      </main>
    </>
  );
}
