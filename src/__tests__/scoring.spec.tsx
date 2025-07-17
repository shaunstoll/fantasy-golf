import { describe, it, expect } from "vitest";

import { standingsMock } from "@/__tests__/mocks/standings.mock";
import { mockTeams } from "@/__tests__/mocks/teams.mock";
import { mockTournament } from "@/__tests__/mocks/tournament.mock";
import type { Standing } from "@/interfaces/standing.interface";
import ScoringService from "@/services/scoring.service";

function getNamesAndScores(standings: Standing[]) {
  return standings
    .map((standing) => {
      return {
        name: standing.name,
        score: standing.score,
      };
    })
    .sort((a, b) => b.score - a.score);
}

describe("Scoring Test", () => {
  it("should score standings correctly", () => {
    const expectedResults = getNamesAndScores(standingsMock);
    const scoringService = new ScoringService();
    const standings = scoringService.getStandings(mockTeams, mockTournament);
    const actualResults = getNamesAndScores(standings);
    expect(actualResults).toEqual(expectedResults);
  });
});
