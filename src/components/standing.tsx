import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";

import Attribute from "@/components/attribute";
import Button from "@/components/button";
import Roster from "@/components/roster";
import RosterTotal from "@/components/roster-total";
import { earnedBonuses, type BonusFlags } from "@/config/bonuses";
import {
  getCurrentTournament,
  getTournamentConfig,
  tournaments,
  type StandingsTab,
} from "@/config/tournaments";
import type { TournamentName } from "@/enums/tournament.enum";
import type { Player } from "@/interfaces/player.interface";
import type { Standing as StandingType } from "@/interfaces/standing.interface";
import { useStore } from "@/store";

// Explicit [top, bottom] name splits for team names the default first-word
// split gets wrong (e.g. a shared surname on a pair).
const NAME_SPLIT_OVERRIDES: Record<string, readonly [string, string]> = {
  "Josh & Jimmy Shizgal": ["Josh & Jimmy", "Shizgal"],
};

interface Props {
  standing: StandingType;
  tournamentScores: Record<TournamentName, number>;
  tournamentRosters: Record<TournamentName, Player[]>;
  tournamentBonuses: Record<TournamentName, BonusFlags>;
  activeTab: StandingsTab;
  liveRound: number;
}

export default function Standing({
  standing,
  tournamentScores,
  tournamentRosters,
  tournamentBonuses,
  activeTab,
  liveRound,
}: Props) {
  const { favoriteTeams, toggleFavoriteTeam } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [playersRef] = useAutoAnimate();

  // Open the roster to whatever the page is sorted by: a single major, or the
  // season-long Total pick breakdown when the page is sorted by Total.
  const [selectedView, setSelectedView] = useState<StandingsTab>(activeTab);

  // Re-sync the default whenever the top filter changes. Keyed only on activeTab
  // so the 5s live refetch never clobbers a manual in-roster selection.
  useEffect(() => {
    setSelectedView(activeTab);
  }, [activeTab]);

  // Bonus dots reflect the active major filter; Total shows none. Colors and
  // labels come from the shared bonus config.
  const activeBonuses = activeTab === "total" ? undefined : tournamentBonuses[activeTab];
  const bonusDots = activeBonuses ? earnedBonuses(activeBonuses) : [];

  // Split the team name into a small top line + a larger bottom line, mirroring
  // how player names render (first name over surname). By default the first word
  // goes on top and the rest (incl. "& Partner") drops to the larger line; a few
  // names read better with an explicit split.
  const [nameTop, nameBottom] = (() => {
    const override = NAME_SPLIT_OVERRIDES[standing.name];
    if (override) return override;
    const [first, ...rest] = standing.name.split(" ");
    return [first, rest.join(" ")] as const;
  })();

  // Rank sits under the favorite star (like a player's finish under their flag),
  // rendered as plain text — no medal colors — to match the leaderboard.
  const rankText = `${standing.isTied ? "T" : ""}${standing.rank}`;

  // The badge for the active sort (a major, or Total) stays solid; the rest fade
  // back so it's clear which column the list is ranked by. The active filter's
  // earned bonuses sit inline just before the score badges, the way a player's
  // bonuses precede their attribute cluster.
  const scoreCluster = (
    <div className="flex shrink-0 items-center gap-1">
      {bonusDots.length > 0 && (
        <div data-testid="team-bonuses" className="flex items-center gap-1 pr-1">
          {bonusDots.map((d) => (
            <span key={d.key} title={d.label} className={`text-sm font-bold ${d.colorClass}`}>
              {d.letter}
            </span>
          ))}
        </div>
      )}
      {tournaments.map((t) => (
        <Attribute
          key={t.name}
          hideLabel
          widthClassName="w-11"
          focused={activeTab === t.name}
          valueClassName={t.badgeColor}
          label={t.badgeLabel}
          value={tournamentScores[t.name]}
        />
      ))}
      <Attribute
        hideLabel
        widthClassName="w-11"
        focused={activeTab === "total"}
        valueClassName="bg-gray-600 text-white"
        label="Total"
        value={standing.score}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-px">
      <div className="flex items-stretch">
        <Button
          className={`
            flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-l
            bg-white p-2 shadow
            dark:bg-gray-800
          `}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavoriteTeam(standing.name);
          }}
          aria-label={`favorite ${standing.name}`}
        >
          <Star
            className="size-4 text-amber-400"
            fill={favoriteTeams.includes(standing.name) ? "currentColor" : "none"}
          />
          <p className="w-9 rounded text-center text-sm font-bold">{rankText}</p>
        </Button>
        <Button
          className={`
            flex w-full min-w-0 items-center justify-between gap-2 rounded-r
            bg-white p-2 shadow
            dark:bg-gray-800
          `}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={`team ${standing.name}`}
        >
          <div className="min-w-0 overflow-hidden text-left leading-tight">
            {nameBottom ? (
              <>
                <p className="truncate text-sm">{nameTop}</p>
                <p className="truncate">{nameBottom}</p>
              </>
            ) : (
              <p className="truncate">{nameTop}</p>
            )}
          </div>
          {scoreCluster}
        </Button>
      </div>

      <div ref={playersRef}>
        {isOpen && (
          <div className="flex flex-col gap-px overflow-hidden rounded-b">
            <div className="flex gap-1 bg-white p-2 dark:bg-gray-800">
              <Button
                className={`
                  rounded-full px-3 py-1.5 text-sm font-medium
                  ${
                    selectedView === "total"
                      ? "bg-gray-200 text-black dark:bg-gray-700 dark:text-white"
                      : "text-gray-500 dark:text-gray-400"
                  }
                `}
                onClick={() => setSelectedView("total")}
              >
                Total
              </Button>
              {tournaments.map((t) => (
                <Button
                  key={t.name}
                  className={`
                    rounded-full px-3 py-1.5 text-sm font-medium
                    ${
                      selectedView === t.name
                        ? "bg-gray-200 text-black dark:bg-gray-700 dark:text-white"
                        : "text-gray-500 dark:text-gray-400"
                    }
                  `}
                  onClick={() => setSelectedView(t.name)}
                >
                  {t.sortLabel}
                </Button>
              ))}
            </div>
            {selectedView === "total" ? (
              <RosterTotal tournamentRosters={tournamentRosters} />
            ) : (
              <Roster
                players={tournamentRosters[selectedView]}
                cutLine={getTournamentConfig(selectedView).cutLine}
                round={selectedView === getCurrentTournament() ? liveRound : 4}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
