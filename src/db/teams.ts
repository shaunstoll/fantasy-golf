import { currentTournament } from "@/env";
import type { Team } from "@/interfaces/team.interface";
import masters from "@data/2026/masters.json";

const teamsByTournament: Record<string, Team[]> = {
  masters,
};

export const teams: Team[] = teamsByTournament[currentTournament] ?? [];
