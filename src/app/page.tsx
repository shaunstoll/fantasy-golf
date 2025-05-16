"use client";
import Standing from "@/components/standing";
import { trpc } from "@/utils/trpc.utils";

export default function Home() {
  const standingsQuery = trpc.leaderboard.getStandings.useQuery();

  if (standingsQuery.error) {
    console.error(standingsQuery.error);
    return <main>Error: {standingsQuery.error.message}</main>;
  }

  if (standingsQuery.isLoading) return <main>Loading...</main>;

  if (!standingsQuery.data) return <main>No standings found</main>;

  return (
    <main>
      {standingsQuery.data.map((standing) => (
        <Standing key={standing.name} standing={standing} />
      ))}
    </main>
  );
}
