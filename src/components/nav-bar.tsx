import { Flag, Trophy } from "lucide-react";

import Button from "@/components/button";

export type Tab = "standings" | "leaderboard";

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
        fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 gap-1
        rounded-full bg-white/15 px-4 py-2 shadow-2xl backdrop-blur-sm
      `}
    >
      <Button
        className={`
          flex w-24 flex-col items-center gap-0.5 rounded-full py-1.5 text-xs
          text-black
          dark:text-white
          ${activeTab === "standings" ? "bg-black/10 dark:bg-white/15" : ""}
        `}
        onClick={() => setActiveTab("standings")}
      >
        <Trophy className="size-5" />
        Standings
      </Button>
      <Button
        className={`
          flex w-24 flex-col items-center gap-0.5 rounded-full py-1.5 text-xs
          text-black
          dark:text-white
          ${activeTab === "leaderboard" ? "bg-black/10 dark:bg-white/15" : ""}
        `}
        onClick={() => setActiveTab("leaderboard")}
      >
        <Flag className="size-5" />
        Leaderboard
      </Button>
    </nav>
  );
}
