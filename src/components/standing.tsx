import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Star } from "lucide-react";
import { useState } from "react";

import Attribute from "@/components/attribute";
import Button from "@/components/button";
import Roster from "@/components/roster";
import { getCurrentTournament, getTournamentConfig, tournaments } from "@/config/tournaments";
import type { TournamentName } from "@/enums/tournament.enum";
import type { Player } from "@/interfaces/player.interface";
import type { Standing as StandingType } from "@/interfaces/standing.interface";
import { useStore } from "@/store";

interface Props {
  standing: StandingType;
  tournamentScores?: Record<TournamentName, number>;
  tournamentRosters?: Record<TournamentName, Player[]>;
  cutLine?: number;
  round?: number;
  liveRound?: number;
}

/**
 * Picks which major's roster to show first when a team is tapped in the Total view.
 *
 * TODO(you): implement this. The interesting cases:
 *   - The "obvious" default is the live/current major: `getCurrentTournament()`.
 *   - But early in a major's week (or for a team that didn't enter one), that
 *     major's roster can be empty — `rosters[major].length === 0`. Showing an
 *     empty roster on first tap is a poor first impression.
 *   - `tournaments` is ordered Masters → PGA → US Open → Open (chronological).
 *
 * We honor the current major when the team has a roster there; otherwise we walk
 * backward through the chronological order to the most recent major they actually
 * fielded a roster for, so the first tap never opens to an empty list.
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
  cutLine,
  round,
  liveRound,
}: Props) {
  const { favoriteTeams, toggleFavoriteTeam } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMajor, setSelectedMajor] = useState<TournamentName>(() =>
    tournamentRosters ? getDefaultMajor(tournamentRosters) : tournaments[0].name,
  );
  const [playersRef] = useAutoAnimate();
  const isTotalView = tournamentScores !== undefined;

  const rankBadge = (
    <Attribute
      labelClassName={isTotalView ? "text-xs" : "text-sm"}
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

  const rightCluster = isTotalView ? (
    <div className="flex shrink-0 items-center gap-1">
      {tournaments.map((t) => (
        <Attribute
          key={t.name}
          labelClassName="text-xs"
          valueClassName={t.badgeColor}
          label={t.badgeLabel}
          value={tournamentScores[t.name]}
        />
      ))}
      <Attribute
        labelClassName="text-xs"
        valueClassName="bg-gray-200 text-black"
        label="Total"
        value={standing.score}
      />
    </div>
  ) : (
    <div className="flex items-center gap-1">
      {standing.lowestRankedPlayerBonus && (
        <Attribute
          labelClassName="text-sm"
          valueClassName="bg-purple-200 text-purple-800"
          label="Bonus"
          value="Low"
        />
      )}
      {standing.firstPlaceBonus && (
        <Attribute
          labelClassName="text-sm"
          valueClassName="bg-amber-200 text-amber-800"
          label="Bonus"
          value="1st"
        />
      )}
      {standing.madeCutBonus && (
        <Attribute
          labelClassName="text-sm"
          valueClassName="bg-green-200 text-green-800"
          label="Bonus"
          value="MC"
        />
      )}
      <Attribute
        labelClassName="text-sm"
        valueClassName="bg-gray-200 text-black"
        label="Points"
        value={standing.score}
      />
    </div>
  );

  const rowContent = (
    <>
      <div className="flex min-w-0 items-center gap-3 overflow-hidden pr-1">
        {rankBadge}
        <p className="truncate">{standing.name}</p>
      </div>
      {rightCluster}
    </>
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
        {isTotalView ? (
          <Button
            className={`
              flex w-full min-w-0 items-center justify-between gap-2 rounded-r
              bg-white p-2 shadow
              dark:bg-gray-800
            `}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={`team ${standing.name}`}
          >
            {rowContent}
          </Button>
        ) : (
          <Button
            className={`
              flex w-full items-center justify-between gap-2 rounded-r bg-white
              p-2 shadow
              dark:bg-gray-800
            `}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={`team ${standing.name}`}
          >
            {rowContent}
          </Button>
        )}
      </div>

      <div ref={playersRef}>
        {isOpen &&
          (isTotalView && tournamentRosters ? (
            <div className="flex flex-col gap-px overflow-hidden rounded-b">
              <div className="flex gap-1 bg-gray-200 p-2 dark:bg-gray-700">
                {tournaments.map((t) => (
                  <Button
                    key={t.name}
                    className={`
                      rounded-full px-3 py-1.5 text-sm font-medium
                      ${
                        selectedMajor === t.name
                          ? "bg-white text-black dark:bg-gray-800 dark:text-white"
                          : "text-gray-500 dark:text-gray-400"
                      }
                    `}
                    onClick={() => setSelectedMajor(t.name)}
                  >
                    {t.sortLabel}
                  </Button>
                ))}
              </div>
              <Roster
                players={tournamentRosters[selectedMajor]}
                cutLine={getTournamentConfig(selectedMajor).cutLine}
                round={selectedMajor === getCurrentTournament() ? (liveRound ?? 4) : 4}
              />
            </div>
          ) : (
            !isTotalView && <Roster players={standing.players} cutLine={cutLine} round={round} />
          ))}
      </div>
    </div>
  );
}
