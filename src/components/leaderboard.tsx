"use client";

import { Fragment } from "react";

import Button from "@/components/button";
import Footer from "@/components/footer";
import Player, { PlayerColumnsHeader } from "@/components/player";
import LeaderboardSkeleton from "@/components/loaders/leaderboard.skeleton";
import SearchBar from "@/components/search-bar";
import TotalPlayer, { TotalColumnsHeader, type TotalEntry } from "@/components/total-player";
import { getCurrentTournament, getTournamentConfig, tournaments } from "@/config/tournaments";
import type { TournamentName } from "@/enums/tournament.enum";
import type { LeaderboardPlayer } from "@/interfaces/leaderboard-player.interface";
import { api } from "@/trpc/react";
import { leaderboardPlayerToPlayer } from "@/utils/player.utils";

export type SortKey = "score" | "points" | "rank" | "owned";
export type SortDir = "asc" | "desc";

/** A leaderboard tab: one major, or the season Total across all majors. */
export type LeaderboardTab = TournamentName | "total";

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
  tournament: LeaderboardTab;
  onTournamentChange: (t: LeaderboardTab) => void;
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
  tournament,
  onTournamentChange,
}: Props) {
  // The current major streams live (5s polling); past majors come from their
  // frozen results. Either source is a LeaderboardPlayer[].
  const live = getCurrentTournament();
  const isTotal = tournament === "total";

  const liveQuery = api.tournament.leaderboard.useQuery(undefined, {
    refetchInterval: 5000,
  });
  const resultsQueries = tournaments.map((t) =>
    api.tournament.results.useQuery({ tournament: t.name }, { enabled: t.name !== live }),
  );

  // Per-major leaderboard: the live major from polling, the rest from results.
  const leaderboardFor = (name: TournamentName): LeaderboardPlayer[] =>
    name === live
      ? (liveQuery.data?.players ?? [])
      : (resultsQueries[tournaments.findIndex((t) => t.name === name)].data?.leaderboard ?? []);

  const handleSortClick = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(sortOptions.find((o) => o.key === key)!.defaultDir);
    }
  };

  const tabPill = (key: LeaderboardTab, label: string) => (
    <Button
      key={key}
      className={`
        rounded-full px-3 py-1.5 text-sm font-medium
        ${
          tournament === key
            ? "bg-white text-black dark:bg-gray-700 dark:text-white"
            : "text-gray-500 dark:text-gray-400"
        }
      `}
      onClick={() => onTournamentChange(key)}
    >
      {label}
    </Button>
  );

  const header = (
    <>
      <SearchBar value={search} onChange={onSearchChange} placeholder="Search players..." />
      <div className="flex gap-1">
        {tabPill("total", "Total")}
        {tournaments.map((t) => tabPill(t.name, t.sortLabel))}
      </div>
    </>
  );

  const hideUnownedButton = (
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
  );

  const query = search.toLowerCase();
  const matchesSearch = (firstName: string, lastName: string) =>
    !query || `${firstName} ${lastName}`.toLowerCase().includes(query);

  // ----- Season Total view: aggregate every major into one row per player -----
  if (isTotal) {
    const activeQueries = [liveQuery, ...resultsQueries].filter((q) => q.fetchStatus !== "idle");
    if (activeQueries.find((q) => q.error))
      return <main className="p-4 text-center">Error loading leaderboard</main>;
    if (activeQueries.some((q) => q.isLoading)) return <LeaderboardSkeleton />;

    const majorsWithData = tournaments.filter((t) => leaderboardFor(t.name).length > 0);
    // Ownership denominator: every team-major slot (e.g. 36 teams × majors played).
    const slots = majorsWithData.reduce(
      (sum, t) => sum + (leaderboardFor(t.name)[0]?.ownedTotal ?? 0),
      0,
    );

    const byPlayer = new Map<string, TotalEntry>();
    for (const t of majorsWithData) {
      for (const p of leaderboardFor(t.name)) {
        const key = `${p.firstName} ${p.lastName}`;
        let entry = byPlayer.get(key);
        if (!entry) {
          entry = {
            firstName: p.firstName,
            lastName: p.lastName,
            nationality: p.nationality,
            totalPoints: 0,
            picks: 0,
            finishByMajor: {},
          };
          byPlayer.set(key, entry);
        }
        entry.totalPoints += p.fantasyScore;
        entry.picks += p.ownedCount;
        entry.finishByMajor[t.name] = {
          place: p.place,
          isTied: p.isTied,
          status: p.status,
          fantasyScore: p.fantasyScore,
          rank: p.rank,
          ownedCount: p.ownedCount,
          ownedTotal: p.ownedTotal,
          firstPlaceBonus: p.firstPlaceBonusPoints > 0,
          madeCutBonus: p.madeCutBonusPoints > 0,
          lowestRankedPlayerBonus: p.lowestRankedBonusPoints > 0,
        };
      }
    }

    // Total sorts by points or ownership; it defaults to points descending,
    // ignoring the per-major place/rank sorts that don't apply to a season total.
    const totalKey = sortKey === "owned" ? "owned" : "points";
    const totalDir: SortDir = sortKey === "owned" || sortKey === "points" ? sortDir : "desc";
    const sortValue = (e: TotalEntry) => (totalKey === "owned" ? e.picks : e.totalPoints);
    const entries = [...byPlayer.values()]
      .filter((e) => matchesSearch(e.firstName, e.lastName) && (!hideUnowned || e.picks > 0))
      .sort((a, b) =>
        totalDir === "asc" ? sortValue(a) - sortValue(b) : sortValue(b) - sortValue(a),
      );

    return (
      <>
        {header}
        <main className="flex flex-col gap-1 pb-20">
          <TotalColumnsHeader activeKey={totalKey} sortDir={totalDir} onSort={handleSortClick}>
            {hideUnownedButton}
          </TotalColumnsHeader>
          {entries.map((entry) => (
            <TotalPlayer
              key={`${entry.firstName} ${entry.lastName}`}
              entry={entry}
              slots={slots}
              majors={majorsWithData}
            />
          ))}
          <div className="mt-4">
            <Footer />
          </div>
        </main>
      </>
    );
  }

  // ----- Single-major view -----
  const isLive = tournament === live;
  const selectedResultsQuery = resultsQueries[tournaments.findIndex((t) => t.name === tournament)];
  const activeQuery = isLive ? liveQuery : selectedResultsQuery;

  if (activeQuery.error) return <main className="p-4 text-center">Error loading leaderboard</main>;

  if (activeQuery.isLoading) return <LeaderboardSkeleton />;

  const players: LeaderboardPlayer[] = leaderboardFor(tournament);
  // Frozen majors are final (round 4); the live cut line comes from the query.
  const cutLine = isLive
    ? (liveQuery.data?.cutLine ?? getTournamentConfig(tournament).cutLine)
    : getTournamentConfig(tournament).cutLine;
  const round = isLive ? (liveQuery.data?.round ?? 4) : 4;

  const filtered = players.filter((p: LeaderboardPlayer) => {
    if (!matchesSearch(p.firstName, p.lastName)) return false;
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

  return (
    <>
      {header}

      <main className="flex flex-col gap-1 pb-20">
        <PlayerColumnsHeader sortKey={sortKey} sortDir={sortDir} onSort={handleSortClick}>
          {hideUnownedButton}
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
