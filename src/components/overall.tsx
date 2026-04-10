"use client";

import Attribute from "@/components/attribute";
import Footer from "@/components/footer";
import StandingsSkeleton from "@/components/loaders/standings.skeleton";
import { api } from "@/trpc/react";

export default function Overall() {
  const standingsQuery = api.tournament.get.useQuery(undefined, {
    refetchInterval: 5000,
  });

  if (standingsQuery.error) return <main className="p-4 text-center">Error loading overall</main>;

  if (standingsQuery.isLoading) return <StandingsSkeleton />;

  if (!standingsQuery.data) return <main className="p-4 text-center">No data</main>;

  const teams = standingsQuery.data
    .map((s) => ({
      name: s.name,
      masters: s.score,
      pga: 0,
      usOpen: 0,
      open: 0,
      total: s.score,
      rank: 0,
      isTied: false,
    }))
    .sort((a, b) => b.total - a.total);

  let currentRank = 1;
  let currentScore = teams[0]?.total;
  for (const [index, team] of teams.entries()) {
    if (team.total !== currentScore) {
      currentRank = index + 1;
      currentScore = team.total;
    }
    team.rank = currentRank;
    team.isTied =
      (index > 0 && teams[index - 1].total === team.total) ||
      (index < teams.length - 1 && teams[index + 1].total === team.total);
  }

  return (
    <main className="flex flex-col gap-1 pb-20">
      {teams.map((team) => (
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
  );
}
