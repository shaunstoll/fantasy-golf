"use client";

import { useLayoutEffect, useRef, useState } from "react";

import Leaderboard from "@/components/leaderboard";
import NavBar from "@/components/nav-bar";
import Standings from "@/components/standings";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"standings" | "leaderboard">("standings");
  const scrollPositions = useRef({ standings: 0, leaderboard: 0 });

  useLayoutEffect(() => {
    window.scrollTo(0, scrollPositions.current[activeTab]);
  }, [activeTab]);

  const handleTabChange = (tab: "standings" | "leaderboard") => {
    scrollPositions.current[activeTab] = window.scrollY;
    setActiveTab(tab);
  };

  return (
    <>
      {activeTab === "standings" ? <Standings /> : <Leaderboard />}
      <NavBar activeTab={activeTab} setActiveTab={handleTabChange} />
    </>
  );
}
