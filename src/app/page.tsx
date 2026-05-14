"use client";

import { useLayoutEffect, useRef, useState } from "react";

import Leaderboard from "@/components/leaderboard";
import type {
  SortDir as LeaderboardSortDir,
  SortKey as LeaderboardSortKey,
} from "@/components/leaderboard";
import NavBar from "@/components/nav-bar";
import type { Tab } from "@/components/nav-bar";
import Overall from "@/components/overall";
import type { SortDir as OverallSortDir, SortKey as OverallSortKey } from "@/components/overall";
import Standings, { getDefaultTournament } from "@/components/standings";
import { TournamentName } from "@/enums/tournament.enum";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("standings");
  const scrollPositions = useRef({ standings: 0, leaderboard: 0, overall: 0 });

  // Standings state
  const [standingsSearch, setStandingsSearch] = useState("");
  const [standingsTournament, setStandingsTournament] =
    useState<TournamentName>(getDefaultTournament);

  // Leaderboard state
  const [leaderboardSearch, setLeaderboardSearch] = useState("");
  const [leaderboardSortKey, setLeaderboardSortKey] = useState<LeaderboardSortKey>("score");
  const [leaderboardSortDir, setLeaderboardSortDir] = useState<LeaderboardSortDir>("asc");

  // Overall state
  const [overallSearch, setOverallSearch] = useState("");
  const [overallSortKey, setOverallSortKey] = useState<OverallSortKey>("total");
  const [overallSortDir, setOverallSortDir] = useState<OverallSortDir>("desc");

  useLayoutEffect(() => {
    window.scrollTo(0, scrollPositions.current[activeTab]);
  }, [activeTab]);

  const handleTabChange = (tab: Tab) => {
    scrollPositions.current[activeTab] = window.scrollY;
    setActiveTab(tab);
  };

  return (
    <>
      {activeTab === "standings" && (
        <Standings
          search={standingsSearch}
          onSearchChange={setStandingsSearch}
          tournament={standingsTournament}
          onTournamentChange={setStandingsTournament}
        />
      )}
      {activeTab === "leaderboard" && (
        <Leaderboard
          search={leaderboardSearch}
          onSearchChange={setLeaderboardSearch}
          sortKey={leaderboardSortKey}
          setSortKey={setLeaderboardSortKey}
          sortDir={leaderboardSortDir}
          setSortDir={setLeaderboardSortDir}
        />
      )}
      {activeTab === "overall" && (
        <Overall
          search={overallSearch}
          onSearchChange={setOverallSearch}
          sortKey={overallSortKey}
          setSortKey={setOverallSortKey}
          sortDir={overallSortDir}
          setSortDir={setOverallSortDir}
        />
      )}
      <NavBar activeTab={activeTab} setActiveTab={handleTabChange} />
    </>
  );
}
