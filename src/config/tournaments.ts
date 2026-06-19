import { TournamentName } from "@/enums/tournament.enum";

/** A standings filter: one major, or the season-long aggregate. */
export type StandingsTab = TournamentName | "total";

export interface TournamentConfig {
  name: TournamentName;
  month: number;
  sortLabel: string;
  badgeLabel: string;
  badgeColor: string;
  cutLine: number;
}

export const tournaments: TournamentConfig[] = [
  {
    name: TournamentName.Masters,
    month: 3,
    sortLabel: "Masters",
    badgeLabel: "Masters",
    badgeColor: "bg-green-800 text-white",
    cutLine: 50,
  },
  {
    name: TournamentName.Pga,
    month: 4,
    sortLabel: "PGA",
    badgeLabel: "PGA",
    badgeColor: "bg-blue-800 text-white",
    cutLine: 70,
  },
  {
    name: TournamentName.UsOpen,
    month: 5,
    sortLabel: "US Open",
    badgeLabel: "US",
    badgeColor: "bg-red-800 text-white",
    cutLine: 60,
  },
  {
    name: TournamentName.Open,
    month: 6,
    sortLabel: "Open",
    badgeLabel: "Open",
    badgeColor: "bg-yellow-700 text-white",
    cutLine: 70,
  },
];

export function getTournamentConfig(name: TournamentName): TournamentConfig {
  const config = tournaments.find((t) => t.name === name);
  if (!config) throw new Error(`Unknown tournament: ${name}`);
  return config;
}

export function getCurrentTournament(): TournamentName {
  const month = new Date().getMonth();
  return tournaments.find((t) => t.month === month)?.name ?? TournamentName.Open;
}

export const currentTournament = getCurrentTournament();
