import Image from "next/image";

import { tournaments } from "@/config/tournaments";
import type { TournamentName } from "@/enums/tournament.enum";
import type { Player } from "@/interfaces/player.interface";
import { flagCode } from "@/utils/nationality.utils";

interface Props {
  tournamentRosters: Record<TournamentName, Player[]>;
}

interface Appearance {
  multiplier: number;
  fantasyScore: number;
}

interface PlayerSummary {
  firstName: string;
  lastName: string;
  rank: number;
  nationality: string;
  appearances: Map<TournamentName, Appearance>;
  count: number;
  totalPoints: number;
}

/**
 * Season-long view of a single team: which players they kept picking across the
 * four majors, how many of the four they appeared in, and where the team spent
 * its captain/vice multipliers. One row per unique player, columns per major.
 */
export default function RosterTotal({ tournamentRosters }: Props) {
  const byPlayer = new Map<string, PlayerSummary>();
  for (const t of tournaments) {
    for (const p of tournamentRosters[t.name] ?? []) {
      const key = `${p.firstName} ${p.lastName}`;
      let summary = byPlayer.get(key);
      if (!summary) {
        summary = {
          firstName: p.firstName,
          lastName: p.lastName,
          rank: p.rank,
          nationality: p.nationality,
          appearances: new Map(),
          count: 0,
          totalPoints: 0,
        };
        byPlayer.set(key, summary);
      }
      summary.appearances.set(t.name, { multiplier: p.multiplier, fantasyScore: p.fantasyScore });
      summary.count += 1;
      summary.totalPoints += p.fantasyScore;
      // Keep the best (lowest) rank seen across the majors for sorting/display.
      if (p.rank > 0 && (summary.rank <= 0 || p.rank < summary.rank)) summary.rank = p.rank;
    }
  }

  const summaries = [...byPlayer.values()].sort(
    (a, b) => b.count - a.count || b.totalPoints - a.totalPoints || a.rank - b.rank,
  );

  if (summaries.length === 0) {
    return (
      <div className="bg-white p-4 text-center text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        No rosters yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-px overflow-hidden rounded-b">
      {/* Header: a column per major (chronological), plus a pick-count column. */}
      <div className="flex items-center gap-1 bg-white px-2 py-1 dark:bg-gray-800">
        <span className="flex-1 text-xs text-gray-500 dark:text-gray-400">
          {summaries.length} players
        </span>
        <span className="w-8 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
          ×
        </span>
        <div className="flex shrink-0">
          {tournaments.map((t) => (
            <span
              key={t.name}
              className="w-9 text-center text-xs font-semibold text-gray-500 dark:text-gray-400"
            >
              {t.badgeLabel}
            </span>
          ))}
        </div>
      </div>

      {summaries.map((s) => (
        <div
          key={`${s.firstName} ${s.lastName}`}
          className="flex items-center gap-1 bg-white p-1 pr-2 dark:bg-gray-800"
        >
          <div className="flex min-w-0 flex-1 items-center gap-1">
            <Image
              src={`https://datagolf.com/static/flags/${flagCode(s.nationality)}.png`}
              alt={s.nationality}
              width={20}
              height={20}
            />
            <div className="min-w-0">
              <p className="truncate text-sm">{s.firstName}</p>
              <p className="truncate">{s.lastName}</p>
            </div>
          </div>

          <span
            className="w-8 text-center text-sm font-bold"
            title={`Picked in ${s.count} of ${tournaments.length} majors`}
          >
            {s.count}
          </span>

          <div className="flex shrink-0">
            {tournaments.map((t) => {
              const a = s.appearances.get(t.name);
              return (
                <span key={t.name} className="flex w-9 items-center justify-center">
                  {!a ? (
                    <span className="text-gray-300 dark:text-gray-600">–</span>
                  ) : a.multiplier > 1 ? (
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      {a.multiplier}×
                    </span>
                  ) : (
                    <span className={`inline-block size-2.5 rounded-full ${t.badgeColor}`} />
                  )}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
