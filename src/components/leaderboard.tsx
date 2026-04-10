"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Search, X } from "lucide-react";
import { useState } from "react";

import Footer from "@/components/footer";
import LeaderboardPlayerRow from "@/components/leaderboard-player";
import StandingsSkeleton from "@/components/loaders/standings.skeleton";
import { api } from "@/trpc/react";

export default function Leaderboard() {
  const [search, setSearch] = useState("");
  const [listRef] = useAutoAnimate();
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

  return (
    <>
      <div className="flex items-center rounded-full bg-white">
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

      <main className="flex flex-col gap-1 pb-20" ref={listRef}>
        {filtered.map((player) => (
          <LeaderboardPlayerRow key={`${player.firstName} ${player.lastName}`} player={player} />
        ))}
        <div className="mt-4">
          <Footer />
        </div>
      </main>
    </>
  );
}
