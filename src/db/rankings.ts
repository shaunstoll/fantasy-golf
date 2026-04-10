import type { Ranking } from "@/interfaces/ranking.interface";
import rankings from "@data/2026/masters-rankings.json";

export const allRankings: Record<string, Ranking> = rankings;
