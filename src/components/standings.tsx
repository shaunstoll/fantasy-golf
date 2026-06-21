"use client";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import Link from "next/link";

import Button from "@/components/button";
import Footer from "@/components/footer";
import StandingsSkeleton from "@/components/loaders/standings.skeleton";
import SearchBar from "@/components/search-bar";
import Standing from "@/components/standing";
import { type BonusFlags } from "@/config/bonuses";
import { getCurrentTournament, tournaments, type StandingsTab } from "@/config/tournaments";
import type { TournamentName } from "@/enums/tournament.enum";
import type { Player } from "@/interfaces/player.interface";
import type { Standing as StandingType } from "@/interfaces/standing.interface";
import { useStore } from "@/store";
import { api } from "@/trpc/react";

// Re-exported for consumers (e.g. page.tsx) that import it from here.
export type { StandingsTab };

// Defensive fallbacks for the rare case a team isn't in the aggregate maps.
const emptyScores = Object.fromEntries(tournaments.map((t) => [t.name, 0])) as Record<
  TournamentName,
  number
>;
const emptyRosters = Object.fromEntries(tournaments.map((t) => [t.name, [] as Player[]])) as Record<
  TournamentName,
  Player[]
>;
const emptyBonuses = Object.fromEntries(
  tournaments.map((t) => [
    t.name,
    { lowestRankedPlayerBonus: false, firstPlaceBonus: false, madeCutBonus: false },
  ]),
) as Record<TournamentName, BonusFlags>;

/**
 * Header row for the team columns, mirroring the team row layout: an empty cell
 * over the favorite-star button, a Rank label, then one cell per major and
 * Total. Those score cells double as the sort control — tapping a column sorts
 * the table by it — so there's no separate filter bar. Each cell lines up with
 * the Attribute value box it titles; the active column is highlighted.
 */
function TeamColumnsHeader({
  tournament,
  onTournamentChange,
}: {
  tournament: StandingsTab;
  onTournamentChange: (t: StandingsTab) => void;
}) {
  const sortCell = (key: StandingsTab, label: string) => (
    <Button
      key={key}
      onClick={() => onTournamentChange(key)}
      aria-pressed={tournament === key}
      className={`
        w-12 rounded py-1.5 text-center
        ${
          tournament === key
            ? "bg-gray-200 text-black dark:bg-gray-700 dark:text-white"
            : "text-gray-500 dark:text-gray-400"
        }
      `}
    >
      {label}
    </Button>
  );

  return (
    <div className="flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400">
      <div className="w-10 shrink-0 self-stretch rounded-l bg-white dark:bg-gray-800" aria-hidden />
      <div
        className={`
          flex w-full min-w-0 items-center justify-between gap-2 rounded-r
          bg-white p-2
          dark:bg-gray-800
        `}
      >
        <div className="flex min-w-0 items-center gap-3 pr-1">
          <span className="w-12 text-center">Rank</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {tournaments.map((t) => sortCell(t.name, t.badgeLabel))}
          {sortCell("total", "Total")}
        </div>
      </div>
    </div>
  );
}

interface Props {
  search: string;
  onSearchChange: (s: string) => void;
  tournament: StandingsTab;
  onTournamentChange: (t: StandingsTab) => void;
}

export default function Standings({
  search,
  onSearchChange,
  tournament,
  onTournamentChange,
}: Props) {
  const { favoriteTeams } = useStore();
  const [standingsRef] = useAutoAnimate();
  const live = getCurrentTournament();
  const isTotal = tournament === "total";

  // The unified page always shows every major's score, so every major's data
  // must load regardless of the active tab: the live major from the polling
  // endpoint, the rest from their frozen results.
  const liveQuery = api.tournament.get.useQuery(undefined, {
    refetchInterval: 5000,
  });
  const resultsQueries = tournaments.map((t) =>
    api.tournament.results.useQuery({ tournament: t.name }, { enabled: t.name !== live }),
  );

  const activeQueries = [liveQuery, ...resultsQueries].filter((q) => q.fetchStatus !== "idle");
  const errorQuery = activeQueries.find((q) => q.error);

  if (errorQuery) {
    console.error(errorQuery.error);
    return (
      <main className="flex h-2/3 flex-col items-center justify-center gap-2 text-xl">
        <div className="flex flex-col items-center">
          <p>An error occurred.</p>
          <p>Error: {errorQuery.error?.message}</p>
          <p>Please try refreshing the page.</p>
        </div>
        <Link href="/">
          <Button className="rounded bg-orange-500 px-2 py-1 font-bold shadow">Refresh</Button>
        </Link>
      </main>
    );
  }

  if (activeQueries.some((q) => q.isLoading)) return <StandingsSkeleton />;

  const liveRound = liveQuery.data?.round ?? 4;

  const standingsByTournament = new Map<TournamentName, StandingType[]>();
  for (const [i, t] of tournaments.entries()) {
    const standings =
      t.name === live
        ? (liveQuery.data?.standings ?? [])
        : (resultsQueries[i].data?.standings ?? []);
    standingsByTournament.set(t.name, standings);
  }

  // One unified data path for every filter. We always aggregate each team's
  // per-major scores, rosters, and bonus flags across all majors; the active
  // tab only decides the sort key (a major's score, or the season total) and
  // which major's bonus row each team shows.
  const standingByTournament = new Map<TournamentName, Map<string, StandingType>>();
  const teamNames = new Set<string>();
  for (const t of tournaments) {
    const standingMap = new Map((standingsByTournament.get(t.name) ?? []).map((s) => [s.name, s]));
    standingByTournament.set(t.name, standingMap);
    for (const name of standingMap.keys()) teamNames.add(name);
  }

  const aggregated = [...teamNames].map((name) => {
    const scores = Object.fromEntries(
      tournaments.map((t) => [t.name, standingByTournament.get(t.name)?.get(name)?.score ?? 0]),
    ) as Record<TournamentName, number>;
    const rosters = Object.fromEntries(
      tournaments.map((t) => [t.name, standingByTournament.get(t.name)?.get(name)?.players ?? []]),
    ) as Record<TournamentName, Player[]>;
    const bonuses = Object.fromEntries(
      tournaments.map((t) => {
        const s = standingByTournament.get(t.name)?.get(name);
        return [
          t.name,
          {
            lowestRankedPlayerBonus: s?.lowestRankedPlayerBonus ?? false,
            firstPlaceBonus: s?.firstPlaceBonus ?? false,
            madeCutBonus: s?.madeCutBonus ?? false,
          },
        ];
      }),
    ) as Record<TournamentName, BonusFlags>;
    const total = Object.values(scores).reduce((sum, v) => sum + v, 0);
    return { name, scores, rosters, bonuses, total };
  });

  const sortScore = (team: { scores: Record<TournamentName, number>; total: number }) =>
    isTotal ? team.total : team.scores[tournament as TournamentName];

  aggregated.sort((a, b) => sortScore(b) - sortScore(a));

  let currentRank = 1;
  let currentScore = aggregated[0] ? sortScore(aggregated[0]) : 0;
  const ranked = aggregated.map((team, index) => {
    const s = sortScore(team);
    if (s !== currentScore) {
      currentRank = index + 1;
      currentScore = s;
    }
    return { ...team, rank: currentRank };
  });

  const tournamentScoresByTeam = new Map(ranked.map((t) => [t.name, t.scores]));
  const tournamentRostersByTeam = new Map(ranked.map((t) => [t.name, t.rosters]));
  const tournamentBonusesByTeam = new Map(ranked.map((t) => [t.name, t.bonuses]));

  const data: StandingType[] = ranked.map((team, i) => ({
    name: team.name,
    score: team.total,
    rank: team.rank,
    isTied:
      (i > 0 && sortScore(ranked[i - 1]) === sortScore(team)) ||
      (i < ranked.length - 1 && sortScore(ranked[i + 1]) === sortScore(team)),
    lowestRankedPlayerBonus: false,
    madeCutBonus: false,
    firstPlaceBonus: false,
    players: [],
  }));

  const query = search.toLowerCase();
  const filtered = query ? data.filter((s) => s.name.toLowerCase().includes(query)) : data;

  const favoriteStandings = filtered.filter((standing) => favoriteTeams.includes(standing.name));

  return (
    <>
      <SearchBar value={search} onChange={onSearchChange} placeholder="Search teams..." />

      <main className="flex flex-col gap-1 pb-20" ref={standingsRef}>
        <TeamColumnsHeader tournament={tournament} onTournamentChange={onTournamentChange} />
        {favoriteStandings.map((standing) => (
          <Standing
            key={standing.name}
            standing={standing}
            tournamentScores={tournamentScoresByTeam.get(standing.name) ?? emptyScores}
            tournamentRosters={tournamentRostersByTeam.get(standing.name) ?? emptyRosters}
            tournamentBonuses={tournamentBonusesByTeam.get(standing.name) ?? emptyBonuses}
            activeTab={tournament}
            liveRound={liveRound}
          />
        ))}
        {favoriteStandings.length > 0 && (
          <div className="my-1 border-t border-gray-400 dark:border-gray-600" />
        )}
        {filtered.map((standing) => (
          <Standing
            key={standing.name}
            standing={standing}
            tournamentScores={tournamentScoresByTeam.get(standing.name) ?? emptyScores}
            tournamentRosters={tournamentRostersByTeam.get(standing.name) ?? emptyRosters}
            tournamentBonuses={tournamentBonusesByTeam.get(standing.name) ?? emptyBonuses}
            activeTab={tournament}
            liveRound={liveRound}
          />
        ))}
        <div className="mt-4">
          <Footer />
        </div>
      </main>
    </>
  );
}
