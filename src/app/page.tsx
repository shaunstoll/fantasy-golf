"use client";

import { useLayoutEffect, useRef, useState } from "react";

import Leaderboard from "@/components/leaderboard";
import type {
  SortDir as LeaderboardSortDir,
  SortKey as LeaderboardSortKey,
} from "@/components/leaderboard";
import NavBar from "@/components/nav-bar";
import type { Tab } from "@/components/nav-bar";
import Standings from "@/components/standings";
import type { StandingsTab } from "@/components/standings";
import { getCurrentTournament } from "@/config/tournaments";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("standings");
  const scrollPositions = useRef({ standings: 0, leaderboard: 0 });

  // Standings state
  const [standingsSearch, setStandingsSearch] = useState("");
  const [standingsTournament, setStandingsTournament] =
    useState<StandingsTab>(getCurrentTournament);

  // Leaderboard state
  const [leaderboardSearch, setLeaderboardSearch] = useState("");
  const [leaderboardSortKey, setLeaderboardSortKey] = useState<LeaderboardSortKey>("score");
  const [leaderboardSortDir, setLeaderboardSortDir] = useState<LeaderboardSortDir>("asc");

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
      <NavBar activeTab={activeTab} setActiveTab={handleTabChange} />
    </>
  );
}
