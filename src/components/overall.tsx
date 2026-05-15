"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Star } from "lucide-react";

import Attribute from "@/components/attribute";
import Button from "@/components/button";
import Footer from "@/components/footer";
import StandingsSkeleton from "@/components/loaders/standings.skeleton";
import SearchBar from "@/components/search-bar";
import { getCurrentTournament, tournaments } from "@/config/tournaments";
import type { TournamentName } from "@/enums/tournament.enum";
import { useStore } from "@/store";
import { api } from "@/trpc/react";

export type SortKey = TournamentName | "total";
export type SortDir = "asc" | "desc";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "total", label: "Total" },
  ...tournaments.map((t) => ({ key: t.name, label: t.sortLabel })),
];

interface OverallTeam {
  name: string;
  scores: Record<TournamentName, number>;
  total: number;
  rank: number;
  isTied: boolean;
}

function getSortValue(team: OverallTeam, key: SortKey): number {
  return key === "total" ? team.total : team.scores[key];
}

interface Props {
  search: string;
  onSearchChange: (s: string) => void;
  sortKey: SortKey;
  setSortKey: (k: SortKey) => void;
  sortDir: SortDir;
  setSortDir: (d: SortDir) => void;
}

export default function Overall({
  search,
  onSearchChange,
  sortKey,
  setSortKey,
  sortDir,
  setSortDir,
}: Props) {
  const { favoriteTeams, toggleFavoriteTeam } = useStore();
  const [teamsRef] = useAutoAnimate();
  const live = getCurrentTournament();

  const liveQuery = api.tournament.get.useQuery(undefined, { refetchInterval: 5000 });
  const resultsQueries = tournaments.map((t) =>
    api.tournament.results.useQuery({ tournament: t.name }, { enabled: live !== t.name }),
  );

  const activeQueries = [liveQuery, ...resultsQueries].filter((q) => q.fetchStatus !== "idle");
  if (activeQueries.some((q) => q.error))
    return <main className="p-4 text-center">Error loading overall</main>;
  if (activeQueries.some((q) => q.isLoading)) return <StandingsSkeleton />;

  const scoresByTournament = new Map<TournamentName, Map<string, number>>();
  for (const [i, t] of tournaments.entries()) {
    const standings =
      t.name === live ? (liveQuery.data ?? []) : (resultsQueries[i].data?.standings ?? []);
    scoresByTournament.set(t.name, new Map(standings.map((s) => [s.name, s.score])));
  }

  const teamNames = new Set<string>();
  for (const scoreMap of scoresByTournament.values()) {
    for (const name of scoreMap.keys()) teamNames.add(name);
  }

  const teams: OverallTeam[] = [...teamNames].map((name) => {
    const scores = Object.fromEntries(
      tournaments.map((t) => [t.name, scoresByTournament.get(t.name)?.get(name) ?? 0]),
    ) as Record<TournamentName, number>;
    const total = Object.values(scores).reduce((sum, v) => sum + v, 0);
    return { name, scores, total, rank: 0, isTied: false };
  });

  const teamsByTotal = [...teams].sort((a, b) => b.total - a.total);
  let currentRank = 1;
  let currentScore = teamsByTotal[0]?.total;
  for (const [index, team] of teamsByTotal.entries()) {
    if (team.total !== currentScore) {
      currentRank = index + 1;
      currentScore = team.total;
    }
    team.rank = currentRank;
    team.isTied =
      (index > 0 && teamsByTotal[index - 1].total === team.total) ||
      (index < teamsByTotal.length - 1 && teamsByTotal[index + 1].total === team.total);
  }

  const query = search.toLowerCase();
  const filteredTeams = query ? teams.filter((t) => t.name.toLowerCase().includes(query)) : teams;

  filteredTeams.sort((a, b) => {
    const aVal = getSortValue(a, sortKey);
    const bVal = getSortValue(b, sortKey);
    return sortDir === "asc" ? aVal - bVal : bVal - aVal;
  });

  const handleSortClick = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const favoriteFilteredTeams = filteredTeams.filter((t) => favoriteTeams.includes(t.name));

  const renderTeam = (team: OverallTeam) => (
    <div key={team.name} className="flex items-center gap-px">
      <Button
        className={`
          self-stretch rounded-l bg-white p-2
          dark:bg-gray-800
        `}
        onClick={() => toggleFavoriteTeam(team.name)}
        aria-label={`favorite ${team.name}`}
      >
        <Star
          className="size-5 text-amber-400"
          fill={favoriteTeams.includes(team.name) ? "currentColor" : "none"}
        />
      </Button>
      <div
        className={`
          flex w-full items-center justify-between rounded-r bg-white p-2
          dark:bg-gray-800
        `}
      >
        <div className="flex min-w-0 items-center gap-2 overflow-hidden pr-1">
          <Attribute
            labelClassName="text-xs"
            valueClassName={
              team.rank === 1
                ? "bg-amber-200 text-amber-800"
                : team.rank === 2
                  ? "bg-slate-200 text-slate-800"
                  : team.rank === 3
                    ? "bg-orange-200 text-orange-800"
                    : "bg-gray-600 text-white"
            }
            label="Rank"
            value={`${team.isTied ? "T" : ""}${team.rank}`}
          />
          <p className="truncate">{team.name}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {tournaments.map((t) => (
            <Attribute
              key={t.name}
              labelClassName="text-xs"
              valueClassName={t.badgeColor}
              label={t.badgeLabel}
              value={team.scores[t.name]}
            />
          ))}
          <Attribute
            labelClassName="text-xs"
            valueClassName="bg-gray-200 text-black"
            label="Total"
            value={team.total}
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <SearchBar value={search} onChange={onSearchChange} placeholder="Search teams..." />

      <div className="flex gap-1">
        {sortOptions.map((option) => {
          const isActive = sortKey === option.key;
          return (
            <Button
              key={option.key}
              className={`
                rounded-full px-3 py-1.5 text-sm font-medium
                ${
                  isActive
                    ? "bg-white text-black dark:bg-gray-700 dark:text-white"
                    : "text-gray-500 dark:text-gray-400"
                }
              `}
              onClick={() => handleSortClick(option.key)}
            >
              {option.label}
              {isActive && (sortDir === "asc" ? " ↑" : " ↓")}
            </Button>
          );
        })}
      </div>

      <main className="flex flex-col gap-1 pb-20" ref={teamsRef}>
        {favoriteFilteredTeams.map(renderTeam)}
        {favoriteFilteredTeams.length > 0 && (
          <div className="my-1 border-t border-gray-400 dark:border-gray-600" />
        )}
        {filteredTeams.map(renderTeam)}
        <div className="mt-4">
          <Footer />
        </div>
      </main>
    </>
  );
}
