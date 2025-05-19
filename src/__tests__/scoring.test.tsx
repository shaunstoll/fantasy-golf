import { describe, it, expect } from "vitest";
import ScoringService from "@/services/scoring.service";
import { mockTeams } from "./mocks/teams.mock";
import { mockTournament } from "./mocks/tournament.mock";
import { standingsSnapshot } from "./snapshots/standings.snapshot";

describe("Scoring Test", () => {
  it("should score standings correctly", () => {
    const scoringService = new ScoringService();
    const standings = scoringService.getStandings(mockTeams, mockTournament);
    expect(standings).toEqual(standingsSnapshot);
  });
});
