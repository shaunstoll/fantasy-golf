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
import type { Player } from "@/interfaces/player.interface";
import type { Standing as StandingType } from "@/interfaces/standing.interface";
import { useStore } from "@/store";
import { api } from "@/trpc/react";

export type StandingsTab = TournamentName | "total";

const tabOptions: { key: StandingsTab; label: string }[] = [
  { key: "total", label: "Total" },
  ...tournaments.map((t) => ({ key: t.name, label: t.sortLabel })),
];

interface Props {
  search: string;
  onSearchChange: (s: string) => void;
  tournament: StandingsTab;
  onTournamentChange: (t: StandingsTab) => void;
}

export default function Standings({
  search,
  onSearchChange,
  tournament,
  onTournamentChange,
}: Props) {
  const { favoriteTeams } = useStore();
  const [standingsRef] = useAutoAnimate();
  const live = getCurrentTournament();
  const isTotal = tournament === "total";

  const liveQuery = api.tournament.get.useQuery(undefined, {
    refetchInterval: 5000,
    enabled: isTotal || tournament === live,
  });
  const resultsQueries = tournaments.map((t) =>
    api.tournament.results.useQuery(
      { tournament: t.name },
      {
        enabled: isTotal ? t.name !== live : tournament === t.name && t.name !== live,
      },
    ),
  );

  const activeQueries = [liveQuery, ...resultsQueries].filter((q) => q.fetchStatus !== "idle");
  const errorQuery = activeQueries.find((q) => q.error);

  if (errorQuery) {
    console.error(errorQuery.error);
    return (
      <main className="flex h-2/3 flex-col items-center justify-center gap-2 text-xl">
        <div className="flex flex-col items-center">
          <p>An error occurred.</p>
          <p>Error: {errorQuery.error?.message}</p>
          <p>Please try refreshing the page.</p>
        </div>
        <Link href="/">
          <Button className="rounded bg-orange-500 px-2 py-1 font-bold shadow">Refresh</Button>
        </Link>
      </main>
    );
  }

  if (activeQueries.some((q) => q.isLoading)) return <StandingsSkeleton />;

  const standingsByTournament = new Map<TournamentName, StandingType[]>();
  for (const [i, t] of tournaments.entries()) {
    const standings =
      t.name === live ? (liveQuery.data ?? []) : (resultsQueries[i].data?.standings ?? []);
    standingsByTournament.set(t.name, standings);
  }

  let data: StandingType[];
  let tournamentScoresByTeam: Map<string, Record<TournamentName, number>> | undefined;
  let tournamentRostersByTeam: Map<string, Record<TournamentName, Player[]>> | undefined;

  if (isTotal) {
    const standingByTournament = new Map<TournamentName, Map<string, StandingType>>();
    const teamNames = new Set<string>();
    for (const t of tournaments) {
      const standingMap = new Map(
        (standingsByTournament.get(t.name) ?? []).map((s) => [s.name, s]),
      );
      standingByTournament.set(t.name, standingMap);
      for (const name of standingMap.keys()) teamNames.add(name);
    }

    const aggregated = [...teamNames].map((name) => {
      const scores = Object.fromEntries(
        tournaments.map((t) => [t.name, standingByTournament.get(t.name)?.get(name)?.score ?? 0]),
      ) as Record<TournamentName, number>;
      const rosters = Object.fromEntries(
        tournaments.map((t) => [
          t.name,
          standingByTournament.get(t.name)?.get(name)?.players ?? [],
        ]),
      ) as Record<TournamentName, Player[]>;
      const total = Object.values(scores).reduce((sum, v) => sum + v, 0);
      return { name, scores, rosters, total };
    });

    aggregated.sort((a, b) => b.total - a.total);

    let currentRank = 1;
    let currentScore = aggregated[0]?.total;
    const ranked = aggregated.map((team, index) => {
      if (team.total !== currentScore) {
        currentRank = index + 1;
        currentScore = team.total;
      }
      return { ...team, rank: currentRank };
    });

    tournamentScoresByTeam = new Map(ranked.map((t) => [t.name, t.scores]));
    tournamentRostersByTeam = new Map(ranked.map((t) => [t.name, t.rosters]));
    data = ranked.map((team, i) => ({
      name: team.name,
      score: team.total,
      rank: team.rank,
      isTied:
        (i > 0 && ranked[i - 1].total === team.total) ||
        (i < ranked.length - 1 && ranked[i + 1].total === team.total),
      lowestRankedPlayerBonus: false,
      madeCutBonus: false,
      firstPlaceBonus: false,
      players: [],
    }));
  } else {
    data = standingsByTournament.get(tournament) ?? [];
  }

  const query = search.toLowerCase();
  const filtered = query ? data.filter((s) => s.name.toLowerCase().includes(query)) : data;

  const favoriteStandings = filtered.filter((standing) => favoriteTeams.includes(standing.name));

  return (
    <>
      <SearchBar value={search} onChange={onSearchChange} placeholder="Search teams..." />

      <div className="flex gap-1">
        {tabOptions.map((option) => (
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
          <Standing
            key={standing.name}
            standing={standing}
            tournamentScores={tournamentScoresByTeam?.get(standing.name)}
            tournamentRosters={tournamentRostersByTeam?.get(standing.name)}
          />
        ))}
        {favoriteStandings.length > 0 && (
          <div className="my-1 border-t border-gray-400 dark:border-gray-600" />
        )}
        {filtered.map((standing) => (
          <Standing
            key={standing.name}
            standing={standing}
            tournamentScores={tournamentScoresByTeam?.get(standing.name)}
            tournamentRosters={tournamentRostersByTeam?.get(standing.name)}
          />
        ))}
        <div className="mt-4">
          <Footer />
        </div>
      </main>
    </>
  );
}
