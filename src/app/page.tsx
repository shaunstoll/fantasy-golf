"use client";

import { useLayoutEffect, useRef, useState } from "react";

import Leaderboard from "@/components/leaderboard";
import NavBar from "@/components/nav-bar";
import type { Tab } from "@/components/nav-bar";
import Overall from "@/components/overall";
import Standings from "@/components/standings";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("standings");
  const scrollPositions = useRef({ standings: 0, leaderboard: 0, overall: 0 });

  useLayoutEffect(() => {
    window.scrollTo(0, scrollPositions.current[activeTab]);
  }, [activeTab]);

  const handleTabChange = (tab: Tab) => {
    scrollPositions.current[activeTab] = window.scrollY;
    setActiveTab(tab);
  };

  return (
    <>
      {activeTab === "standings" && <Standings />}
      {activeTab === "leaderboard" && <Leaderboard />}
      {activeTab === "overall" && <Overall />}
      <NavBar activeTab={activeTab} setActiveTab={handleTabChange} />
    </>
  );
}
