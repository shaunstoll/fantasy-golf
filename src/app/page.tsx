"use client";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import Button from "@/components/button";
import Footer from "@/components/footer";
import StandingsSkeleton from "@/components/loaders/standings.skeleton";
import Standing from "@/components/standing";
import { useStore } from "@/store";
import { api } from "@/trpc/react";

export default function Home() {
  const { favoriteTeams } = useStore();
  const [standingsRef] = useAutoAnimate();
  const [search, setSearch] = useState("");
  const standingsQuery = api.tournament.get.useQuery(undefined, {
    refetchInterval: 5000,
  });

  if (standingsQuery.error) {
    console.error(standingsQuery.error);
    return (
      <main
        className={`
          flex h-2/3 flex-col items-center justify-center gap-2 text-xl
        `}
      >
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

  const query = search.toLowerCase();
  const filtered = query
    ? standingsQuery.data.filter((s) => s.name.toLowerCase().includes(query))
    : standingsQuery.data;

  const favoriteStandings = filtered.filter((standing) => favoriteTeams.includes(standing.name));

  return (
    <>
      <div className="flex items-center rounded-full bg-white">
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

      <main className="flex flex-col gap-1" ref={standingsRef}>
        {favoriteStandings.map((standing) => (
          <Standing key={standing.name} standing={standing} />
        ))}
        {favoriteStandings.length > 0 && (
          <div className="my-1 border-t border-gray-400 dark:border-gray-600" />
        )}
        {filtered.map((standing) => (
          <Standing key={standing.name} standing={standing} />
        ))}
        <Footer />
      </main>
    </>
  );
}
