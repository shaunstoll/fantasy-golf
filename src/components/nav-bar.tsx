import { BarChart3, Flag, Trophy } from "lucide-react";

import Button from "@/components/button";

export type Tab = "standings" | "leaderboard" | "overall";

export default function NavBar({
  activeTab,
  setActiveTab,
}: {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}) {
  return (
    <nav
      className={`
        fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 gap-8
        rounded-full bg-white/15 px-8 py-2 shadow-2xl backdrop-blur-sm
      `}
    >
      <Button
        className={`
          flex flex-col items-center gap-0.5 text-xs text-black
          dark:text-white
          ${activeTab !== "standings" ? "opacity-50" : ""}
        `}
        onClick={() => setActiveTab("standings")}
      >
        <Trophy className="size-5" />
        Standings
      </Button>
      <Button
        className={`
          flex flex-col items-center gap-0.5 text-xs text-black
          dark:text-white
          ${activeTab !== "leaderboard" ? "opacity-50" : ""}
        `}
        onClick={() => setActiveTab("leaderboard")}
      >
        <Flag className="size-5" />
        Leaderboard
      </Button>
      <Button
        className={`
          flex flex-col items-center gap-0.5 text-xs text-black
          dark:text-white
          ${activeTab !== "overall" ? "opacity-50" : ""}
        `}
        onClick={() => setActiveTab("overall")}
      >
        <BarChart3 className="size-5" />
        Overall
      </Button>
    </nav>
  );
}
