"use client";

import { Fragment } from "react";

import Button from "@/components/button";
import Footer from "@/components/footer";
import Player, { PlayerColumnsHeader } from "@/components/player";
import StandingsSkeleton from "@/components/loaders/standings.skeleton";
import SearchBar from "@/components/search-bar";
import type { LeaderboardPlayer } from "@/interfaces/leaderboard-player.interface";
import { api } from "@/trpc/react";
import { leaderboardPlayerToPlayer } from "@/utils/player.utils";

export type SortKey = "score" | "points" | "rank" | "owned";
export type SortDir = "asc" | "desc";

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
      return player.ownedCount;
  }
}

interface Props {
  search: string;
  onSearchChange: (s: string) => void;
  sortKey: SortKey;
  setSortKey: (k: SortKey) => void;
  sortDir: SortDir;
  setSortDir: (d: SortDir) => void;
  hideUnowned: boolean;
  setHideUnowned: (h: boolean) => void;
}

export default function Leaderboard({
  search,
  onSearchChange,
  sortKey,
  setSortKey,
  sortDir,
  setSortDir,
  hideUnowned,
  setHideUnowned,
}: Props) {
  const leaderboardQuery = api.tournament.leaderboard.useQuery(undefined, {
    refetchInterval: 5000,
  });

  if (leaderboardQuery.error)
    return <main className="p-4 text-center">Error loading leaderboard</main>;

  if (leaderboardQuery.isLoading) return <StandingsSkeleton />;

  if (!leaderboardQuery.data) return <main className="p-4 text-center">No leaderboard data</main>;

  const { players, cutLine, round } = leaderboardQuery.data;

  const query = search.toLowerCase();
  const filtered = players.filter((p: LeaderboardPlayer) => {
    if (query && !`${p.firstName} ${p.lastName}`.toLowerCase().includes(query)) return false;
    if (hideUnowned && p.ownedCount === 0) return false;
    return true;
  });

  const sorted = [...filtered].sort((a: LeaderboardPlayer, b: LeaderboardPlayer) => {
    const aVal = getSortValue(a, sortKey);
    const bVal = getSortValue(b, sortKey);
    return sortDir === "asc" ? aVal - bVal : bVal - aVal;
  });

  const cutLabel = round < 3 ? "Projected Cut" : "Cut";
  const cutInsertIndex = (() => {
    if (sortKey !== "score" || query) return -1;
    if (round < 3) {
      return sorted.findIndex((p: LeaderboardPlayer) => (p.place ?? Infinity) > cutLine);
    }
    return sorted.findIndex((p: LeaderboardPlayer) => p.place === undefined);
  })();

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
      <SearchBar value={search} onChange={onSearchChange} placeholder="Search players..." />

      <main className="flex flex-col gap-1 pb-20">
        <PlayerColumnsHeader sortKey={sortKey} sortDir={sortDir} onSort={handleSortClick}>
          <Button
            className={`
              rounded-full px-3 py-1 text-sm font-medium
              ${
                hideUnowned
                  ? "bg-gray-200 text-black dark:bg-gray-700 dark:text-white"
                  : "text-gray-500 dark:text-gray-400"
              }
            `}
            onClick={() => setHideUnowned(!hideUnowned)}
          >
            Hide Unowned
          </Button>
        </PlayerColumnsHeader>
        {sorted.map((player: LeaderboardPlayer, index: number) => (
          <Fragment key={`${player.firstName} ${player.lastName}`}>
            {index === cutInsertIndex && (
              <div className="flex items-center gap-2 py-1">
                <div className="h-px flex-1 bg-red-500/60" />
                <span className="text-xs font-semibold tracking-wide text-red-500">{cutLabel}</span>
                <div className="h-px flex-1 bg-red-500/60" />
              </div>
            )}
            <Player player={leaderboardPlayerToPlayer(player)} />
          </Fragment>
        ))}
        <div className="mt-4">
          <Footer />
        </div>
      </main>
    </>
  );
}
