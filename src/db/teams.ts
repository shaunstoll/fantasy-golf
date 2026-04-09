import { env } from "@/env";
import type { Team } from "@/interfaces/team.interface";
// eslint-disable-next-line import/extensions
import masters from "@data/2026/masters.json";

const teamsByTournament: Record<string, Team[]> = {
  masters,
};

export const teams: Team[] =
  teamsByTournament[env.NEXT_PUBLIC_TOURNAMENT] ?? [];
