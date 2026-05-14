"use client";

import { Search, X } from "lucide-react";

import Attribute from "@/components/attribute";
import Button from "@/components/button";
import Footer from "@/components/footer";
import StandingsSkeleton from "@/components/loaders/standings.skeleton";
import { getDefaultTournament } from "@/components/standings";
import { TournamentName } from "@/enums/tournament.enum";
import type { Standing } from "@/interfaces/standing.interface";
import { api } from "@/trpc/react";

export type SortKey = "masters" | "pga" | "us" | "open" | "total";
export type SortDir = "asc" | "desc";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "total", label: "Total" },
  { key: "masters", label: "Masters" },
  { key: "pga", label: "PGA" },
  { key: "us", label: "US Open" },
  { key: "open", label: "Open" },
];

interface OverallTeam {
  name: string;
  masters: number;
  pga: number;
  usOpen: number;
  open: number;
  total: number;
  rank: number;
  isTied: boolean;
}

function getSortValue(team: OverallTeam, key: SortKey): number {
  switch (key) {
    case "masters":
      return team.masters;
    case "pga":
      return team.pga;
    case "us":
      return team.usOpen;
    case "open":
      return team.open;
    case "total":
      return team.total;
  }
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
  const live = getDefaultTournament();

  const liveQuery = api.tournament.get.useQuery(undefined, { refetchInterval: 5000 });
  const mastersResults = api.tournament.results.useQuery(
    { tournament: TournamentName.Masters },
    { enabled: live !== TournamentName.Masters },
  );
  const pgaResults = api.tournament.results.useQuery(
    { tournament: TournamentName.Pga },
    { enabled: live !== TournamentName.Pga },
  );
  const usOpenResults = api.tournament.results.useQuery(
    { tournament: TournamentName.UsOpen },
    { enabled: live !== TournamentName.UsOpen },
  );
  const openResults = api.tournament.results.useQuery(
    { tournament: TournamentName.Open },
    { enabled: live !== TournamentName.Open },
  );

  const activeQueries = [liveQuery, mastersResults, pgaResults, usOpenResults, openResults].filter(
    (q) => q.fetchStatus !== "idle",
  );
  if (activeQueries.some((q) => q.error))
    return <main className="p-4 text-center">Error loading overall</main>;
  if (activeQueries.some((q) => q.isLoading)) return <StandingsSkeleton />;

  const getStandingsFor = (t: TournamentName): Standing[] => {
    if (t === live) return liveQuery.data ?? [];
    switch (t) {
      case TournamentName.Masters:
        return mastersResults.data?.standings ?? [];
      case TournamentName.Pga:
        return pgaResults.data?.standings ?? [];
      case TournamentName.UsOpen:
        return usOpenResults.data?.standings ?? [];
      case TournamentName.Open:
        return openResults.data?.standings ?? [];
    }
  };

  const mastersScores = new Map(
    getStandingsFor(TournamentName.Masters).map((s) => [s.name, s.score]),
  );
  const pgaScores = new Map(getStandingsFor(TournamentName.Pga).map((s) => [s.name, s.score]));
  const usOpenScores = new Map(
    getStandingsFor(TournamentName.UsOpen).map((s) => [s.name, s.score]),
  );
  const openScores = new Map(getStandingsFor(TournamentName.Open).map((s) => [s.name, s.score]));

  const teamNames = new Set<string>([
    ...mastersScores.keys(),
    ...pgaScores.keys(),
    ...usOpenScores.keys(),
    ...openScores.keys(),
  ]);

  const teams: OverallTeam[] = [...teamNames].map((name) => {
    const masters = mastersScores.get(name) ?? 0;
    const pga = pgaScores.get(name) ?? 0;
    const usOpen = usOpenScores.get(name) ?? 0;
    const open = openScores.get(name) ?? 0;
    return {
      name,
      masters,
      pga,
      usOpen,
      open,
      total: masters + pga + usOpen + open,
      rank: 0,
      isTied: false,
    };
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

  return (
    <>
      <div className="flex items-center rounded-full bg-white dark:bg-gray-800">
        <Search className="ml-3 size-5 shrink-0 opacity-50" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search teams..."
          className="w-full bg-transparent px-3 py-2 text-base outline-none"
        />
        {search && (
          <button type="button" className="pr-3" onClick={() => onSearchChange("")}>
            <X className="size-5 shrink-0 opacity-50" />
          </button>
        )}
      </div>

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

      <main className="flex flex-col gap-1 pb-20">
        {filteredTeams.map((team) => (
          <div
            key={team.name}
            className={`
              flex items-center justify-between bg-white p-2
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
              <Attribute
                labelClassName="text-xs"
                valueClassName="bg-green-800 text-white"
                label="Masters"
                value={team.masters}
              />
              <Attribute
                labelClassName="text-xs"
                valueClassName="bg-blue-800 text-white"
                label="PGA"
                value={team.pga}
              />
              <Attribute
                labelClassName="text-xs"
                valueClassName="bg-red-800 text-white"
                label="US"
                value={team.usOpen}
              />
              <Attribute
                labelClassName="text-xs"
                valueClassName="bg-yellow-700 text-white"
                label="Open"
                value={team.open}
              />
              <Attribute
                labelClassName="text-xs"
                valueClassName="bg-gray-200 text-black"
                label="Total"
                value={team.total}
              />
            </div>
          </div>
        ))}
        <div className="mt-4">
          <Footer />
        </div>
      </main>
    </>
  );
}
