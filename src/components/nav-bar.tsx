import { Flag, Trophy } from "lucide-react";

import Button from "@/components/button";

export default function NavBar({
  activeTab,
  setActiveTab,
}: {
  activeTab: "standings" | "leaderboard";
  setActiveTab: (tab: "standings" | "leaderboard") => void;
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
    </nav>
  );
}
