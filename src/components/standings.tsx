"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import Link from "next/link";

import Button from "@/components/button";
import Footer from "@/components/footer";
import StandingsSkeleton from "@/components/loaders/standings.skeleton";
import SearchBar from "@/components/search-bar";
import Standing from "@/components/standing";
import { getCurrentTournament, tournaments } from "@/config/tournaments";
import type { TournamentName } from "@/enums/tournament.enum";
import { useStore } from "@/store";
import { api } from "@/trpc/react";

const tournamentOptions = tournaments.map((t) => ({ key: t.name, label: t.sortLabel }));

interface Props {
  search: string;
  onSearchChange: (s: string) => void;
  tournament: TournamentName;
  onTournamentChange: (t: TournamentName) => void;
}

export default function Standings({
  search,
  onSearchChange,
  tournament,
  onTournamentChange,
}: Props) {
  const { favoriteTeams } = useStore();
  const [standingsRef] = useAutoAnimate();
  const isCurrentTournament = tournament === getCurrentTournament();
  const standingsQuery = api.tournament.get.useQuery(undefined, {
    refetchInterval: 5000,
    enabled: isCurrentTournament,
  });
  const resultsQuery = api.tournament.results.useQuery(
    { tournament },
    { enabled: !isCurrentTournament },
  );

  const activeQuery = isCurrentTournament ? standingsQuery : resultsQuery;

  if (activeQuery.error) {
    console.error(activeQuery.error);
    return (
      <main className="flex h-2/3 flex-col items-center justify-center gap-2 text-xl">
        <div className="flex flex-col items-center">
          <p>An error occurred.</p>
          <p>Error: {activeQuery.error.message}</p>
          <p>Please try refreshing the page.</p>
        </div>
        <Link href="/">
          <Button className="rounded bg-orange-500 px-2 py-1 font-bold shadow">Refresh</Button>
        </Link>
      </main>
    );
  }

  if (activeQuery.isLoading) return <StandingsSkeleton />;

  const data = isCurrentTournament
    ? (standingsQuery.data ?? [])
    : (resultsQuery.data?.standings ?? []);

  const query = search.toLowerCase();
  const filtered = query ? data.filter((s) => s.name.toLowerCase().includes(query)) : data;

  const favoriteStandings = filtered.filter((standing) => favoriteTeams.includes(standing.name));

  return (
    <>
      <SearchBar value={search} onChange={onSearchChange} placeholder="Search teams..." />

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
            onClick={() => onTournamentChange(option.key)}
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
