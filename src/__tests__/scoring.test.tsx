import { describe, it, expect } from "vitest";
import ScoringService from "@/services/scoring.service";
import { mockTeams } from "./mocks/teams.mock";
import { mockTournament } from "./mocks/tournament.mock";
import { standingsSnapshot } from "./snapshots/standings.snapshot";
import { Standing } from "@/interfaces/standing.interface";

function getNamesAndScores(standings: Standing[]) {
  return standings.map((standing) => {
    return {
      name: standing.name,
      score: standing.score,
    };
  });
}

describe("Scoring Test", () => {
  it("should score standings correctly", () => {
    const expectedResults = getNamesAndScores(standingsSnapshot);
    const scoringService = new ScoringService();
    const standings = scoringService.getStandings(mockTeams, mockTournament);
    const actualResults = getNamesAndScores(standings);
    expect(actualResults).toEqual(expectedResults);
  });
});
