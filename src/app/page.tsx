"use client";
import Footer from "@/components/footer";
import StandingsSkeleton from "@/components/loaders/standings.skeleton";
import Standing from "@/components/standing";
import { api } from "@/trpc/react";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export default function Home() {
  const [standingsRef] = useAutoAnimate();
  const standingsQuery = api.leaderboard.get.useQuery(undefined, {
    refetchInterval: 5000,
  });

  if (standingsQuery.error) {
    console.error(standingsQuery.error);
    return <main>Error: {standingsQuery.error.message}</main>;
  }

  if (standingsQuery.isLoading) return <StandingsSkeleton />;

  if (!standingsQuery.data) return <main>No standings found</main>;

  return (
    <main className="flex flex-col gap-1 overflow-auto" ref={standingsRef}>
      {standingsQuery.data.map((standing) => (
        <Standing key={standing.name} standing={standing} />
      ))}
      <Footer />
    </main>
  );
}
