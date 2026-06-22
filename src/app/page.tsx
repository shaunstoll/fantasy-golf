"use client";

import { useLayoutEffect, useRef } from "react";

import Leaderboard from "@/components/leaderboard";
import type {
  LeaderboardTab,
  SortDir as LeaderboardSortDir,
  SortKey as LeaderboardSortKey,
} from "@/components/leaderboard";
import NavBar from "@/components/nav-bar";
import type { Tab } from "@/components/nav-bar";
import Standings from "@/components/standings";
import type { StandingsTab } from "@/components/standings";
import { getCurrentTournament } from "@/config/tournaments";
import { useSessionState } from "@/hooks/use-session-state";

export default function Home() {
  const [activeTab, setActiveTab] = useSessionState<Tab>("fg.activeTab", "standings");
  const scrollPositions = useRef({ standings: 0, leaderboard: 0 });

  // Standings state
  const [standingsSearch, setStandingsSearch] = useSessionState("fg.standings.search", "");
  const [standingsTournament, setStandingsTournament] = useSessionState<StandingsTab>(
    "fg.standings.tournament",
    getCurrentTournament(),
  );

  // Leaderboard state
  const [leaderboardSearch, setLeaderboardSearch] = useSessionState("fg.leaderboard.search", "");
  const [leaderboardSortKey, setLeaderboardSortKey] = useSessionState<LeaderboardSortKey>(
    "fg.leaderboard.sortKey",
    "score",
  );
  const [leaderboardSortDir, setLeaderboardSortDir] = useSessionState<LeaderboardSortDir>(
    "fg.leaderboard.sortDir",
    "asc",
  );
  const [leaderboardHideUnowned, setLeaderboardHideUnowned] = useSessionState(
    "fg.leaderboard.hideUnowned",
    false,
  );
  const [leaderboardTournament, setLeaderboardTournament] = useSessionState<LeaderboardTab>(
    "fg.leaderboard.tournament",
    getCurrentTournament(),
  );
  const [leaderboardLowBonus, setLeaderboardLowBonus] = useSessionState(
    "fg.leaderboard.lowBonus",
    true,
  );

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
          hideUnowned={leaderboardHideUnowned}
          setHideUnowned={setLeaderboardHideUnowned}
          tournament={leaderboardTournament}
          onTournamentChange={setLeaderboardTournament}
          lowBonus={leaderboardLowBonus}
          setLowBonus={setLeaderboardLowBonus}
        />
      )}
      <NavBar activeTab={activeTab} setActiveTab={handleTabChange} />
    </>
  );
}
