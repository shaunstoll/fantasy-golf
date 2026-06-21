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

interface Props {
  standing: StandingType;
  tournamentScores: Record<TournamentName, number>;
  tournamentRosters: Record<TournamentName, Player[]>;
  tournamentBonuses: Record<TournamentName, BonusFlags>;
  activeTab: StandingsTab;
  liveRound: number;
}

/**
 * Picks which major's roster to show first when a team is tapped in the Total view.
 *
 * The "obvious" default is the live/current major, but early in a major's week
 * (or for a team that didn't enter one) that roster can be empty. So we honor
 * the current major when the team has a roster there; otherwise we walk backward
 * through the chronological order to the most recent major they actually fielded
 * a roster for, so the first tap never opens to an empty list.
 */
function getDefaultMajor(rosters: Record<TournamentName, Player[]>): TournamentName {
  const current = getCurrentTournament();
  if (rosters[current]?.length) return current;

  const order = tournaments.map((t) => t.name);
  for (let i = order.indexOf(current) - 1; i >= 0; i--) {
    if (rosters[order[i]]?.length) return order[i];
  }
  return current;
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

  // Default the in-roster view to whatever the page is sorted by; the Total tab
  // has no single major, so fall back to the smart "most recent roster" pick.
  // The selector can also switch to "total" for the season-long pick breakdown.
  const defaultView = (): StandingsTab =>
    activeTab === "total" ? getDefaultMajor(tournamentRosters) : activeTab;
  const [selectedView, setSelectedView] = useState<StandingsTab>(defaultView);

  // Re-sync the default whenever the top filter changes. Keyed only on activeTab
  // so the 5s live refetch never clobbers a manual in-roster selection.
  useEffect(() => {
    setSelectedView(defaultView());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Bonus dots shown under the team name reflect the active major filter; Total
  // shows none. Colors and labels come from the shared bonus config.
  const activeBonuses = activeTab === "total" ? undefined : tournamentBonuses[activeTab];
  const bonusDots = activeBonuses ? earnedBonuses(activeBonuses) : [];

  const rankBadge = (
    <Attribute
      labelClassName="text-xs"
      valueClassName={
        standing.rank === 1
          ? "bg-amber-200 text-amber-800"
          : standing.rank === 2
            ? "bg-slate-200 text-slate-800"
            : standing.rank === 3
              ? "bg-orange-200 text-orange-800"
              : "bg-gray-600 text-white"
      }
      label="Rank"
      value={`${standing.isTied ? "T" : ""}${standing.rank}`}
    />
  );

  // The badge for the active sort (a major, or Total) stays solid; the rest fade
  // back so it's clear which column the list is ranked by.
  const scoreCluster = (
    <div className="flex shrink-0 items-center gap-1">
      {tournaments.map((t) => (
        <Attribute
          key={t.name}
          focused={activeTab === t.name}
          labelClassName="text-xs"
          valueClassName={t.badgeColor}
          label={t.badgeLabel}
          value={tournamentScores[t.name]}
        />
      ))}
      <Attribute
        focused={activeTab === "total"}
        labelClassName="text-xs"
        valueClassName="bg-gray-200 text-black"
        label="Total"
        value={standing.score}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-px">
      <div className="flex items-center">
        <Button
          className={`
            self-stretch rounded-l bg-white p-2 shadow
            dark:bg-gray-800
          `}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavoriteTeam(standing.name);
          }}
        >
          <Star
            className="size-6 text-amber-400"
            fill={favoriteTeams.includes(standing.name) ? "currentColor" : "none"}
          />
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
          <div className="flex min-w-0 items-center gap-3 overflow-hidden pr-1">
            {rankBadge}
            <div className="min-w-0">
              <p className="truncate">{standing.name}</p>
              {bonusDots.length > 0 && (
                <div data-testid="team-bonuses" className="mt-1 flex items-center gap-1">
                  {bonusDots.map((d) => (
                    <span
                      key={d.key}
                      title={d.label}
                      className={`text-sm font-bold ${d.colorClass}`}
                    >
                      {d.letter}
                    </span>
                  ))}
                </div>
              )}
            </div>
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
