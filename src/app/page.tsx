"use client";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import Link from "next/link";

import Button from "@/components/button";
import Footer from "@/components/footer";
import StandingsSkeleton from "@/components/loaders/standings.skeleton";
import Standing from "@/components/standing";
import { useStore } from "@/store";
import { api } from "@/trpc/react";

export default function Home() {
  const { favoriteTeams } = useStore();
  const [standingsRef] = useAutoAnimate();
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

  const favoriteStandings = standingsQuery.data.filter((standing) =>
    favoriteTeams.includes(standing.name),
  );

  return (
    <main className="flex flex-col gap-1 overflow-auto" ref={standingsRef}>
      {favoriteStandings.map((standing) => (
        <Standing key={standing.name} standing={standing} />
      ))}
      {standingsQuery.data.map((standing) => (
        <Standing key={standing.name} standing={standing} />
      ))}
      <Footer />
    </main>
  );
}
