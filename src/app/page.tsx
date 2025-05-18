"use client";
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

  if (standingsQuery.isLoading) return <main>Loading...</main>;

  if (!standingsQuery.data) return <main>No standings found</main>;

  return (
    <main className="p-2 bg-gray-200">
      <div className="flex flex-col gap-1" ref={standingsRef}>
        {standingsQuery.data.map((standing) => (
          <Standing key={standing.name} standing={standing} />
        ))}
      </div>
    </main>
  );
}
