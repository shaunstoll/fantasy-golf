import { currentTournament } from "@/config/tournaments";
import type { Team } from "@/interfaces/team.interface";
import masters from "@data/2026/masters.json";
import pga from "@data/2026/pga.json";

const teamsByTournament: Record<string, Team[]> = {
  masters,
  pga,
};

export const teams: Team[] = teamsByTournament[currentTournament] ?? [];
