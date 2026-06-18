import { currentTournament } from "@/config/tournaments";
import type { Team } from "@/interfaces/team.interface";
import masters from "@data/2026/masters.json";
import pga from "@data/2026/pga.json";
import usOpen from "@data/2026/us-open.json";

const teamsByTournament: Record<string, Team[]> = {
  masters,
  pga,
  "us-open": usOpen,
};

export const teams: Team[] = teamsByTournament[currentTournament] ?? [];
