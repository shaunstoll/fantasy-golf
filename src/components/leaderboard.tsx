"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

import Button from "@/components/button";
import Footer from "@/components/footer";
import LeaderboardPlayerRow from "@/components/leaderboard-player";
import StandingsSkeleton from "@/components/loaders/standings.skeleton";
import type { LeaderboardPlayer } from "@/interfaces/leaderboard-player.interface";
import { api } from "@/trpc/react";

type SortKey = "score" | "points" | "rank" | "owned";
type SortDir = "asc" | "desc";

const sortOptions: { key: SortKey; label: string; defaultDir: SortDir }[] = [
  { key: "score", label: "Score", defaultDir: "asc" },
  { key: "points", label: "Points", defaultDir: "desc" },
  { key: "rank", label: "Rank", defaultDir: "asc" },
  { key: "owned", label: "Owned", defaultDir: "desc" },
];

function getSortValue(player: LeaderboardPlayer, key: SortKey): number {
  switch (key) {
    case "score":
      return player.place ?? Infinity;
    case "points":
      return player.fantasyScore;
    case "rank":
      return player.rank > 0 ? player.rank : Infinity;
    case "owned":
      return player.ownedPercentage;
  }
}

export default function Leaderboard() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const leaderboardQuery = api.tournament.leaderboard.useQuery(undefined, {
    refetchInterval: 5000,
  });

  if (leaderboardQuery.error)
    return <main className="p-4 text-center">Error loading leaderboard</main>;

  if (leaderboardQuery.isLoading) return <StandingsSkeleton />;

  if (!leaderboardQuery.data) return <main className="p-4 text-center">No leaderboard data</main>;

  const query = search.toLowerCase();
  const filtered = query
    ? leaderboardQuery.data.filter((p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(query),
      )
    : leaderboardQuery.data;

  const sorted = [...filtered].sort((a, b) => {
    const aVal = getSortValue(a, sortKey);
    const bVal = getSortValue(b, sortKey);
    if (aVal === Infinity && bVal === Infinity) return 0;
    if (aVal === Infinity) return 1;
    if (bVal === Infinity) return -1;
    return sortDir === "asc" ? aVal - bVal : bVal - aVal;
  });

  const handleSortClick = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(sortOptions.find((o) => o.key === key)!.defaultDir);
    }
  };

  return (
    <>
      <div className="flex items-center rounded-full bg-white dark:bg-gray-800">
        <Search className="ml-3 size-5 shrink-0 opacity-50" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search players..."
          className="w-full bg-transparent px-3 py-2 text-base outline-none"
        />
        {search && (
          <button type="button" className="pr-3" onClick={() => setSearch("")}>
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
                rounded-full px-2.5 py-1 text-xs font-medium
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
        {sorted.map((player) => (
          <LeaderboardPlayerRow key={`${player.firstName} ${player.lastName}`} player={player} />
        ))}
        <div className="mt-4">
          <Footer />
        </div>
      </main>
    </>
  );
}
