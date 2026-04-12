import { describe, it, expect } from "vitest";

import { getResults } from "@/db/results";
import { TournamentName } from "@/enums/tournament.enum";

describe("Results", () => {
  it("should return masters results", () => {
    const results = getResults(TournamentName.Masters);
    expect(results).toBeDefined();
    expect(results!.standings.length).toBeGreaterThan(0);
    expect(results!.leaderboard.length).toBeGreaterThan(0);
  });

  it("should have valid standings structure", () => {
    const results = getResults(TournamentName.Masters)!;
    const first = results.standings[0];
    expect(first).toHaveProperty("name");
    expect(first).toHaveProperty("score");
    expect(first).toHaveProperty("rank");
    expect(first).toHaveProperty("players");
    expect(first.players.length).toBeGreaterThan(0);
  });

  it("should have valid leaderboard structure", () => {
    const results = getResults(TournamentName.Masters)!;
    const first = results.leaderboard[0];
    expect(first).toHaveProperty("firstName");
    expect(first).toHaveProperty("lastName");
    expect(first).toHaveProperty("fantasyScore");
    expect(first).toHaveProperty("placementPoints");
  });

  it("should have standings sorted by score descending", () => {
    const results = getResults(TournamentName.Masters)!;
    for (let i = 1; i < results.standings.length; i++) {
      expect(results.standings[i - 1].score).toBeGreaterThanOrEqual(results.standings[i].score);
    }
  });

  it("should have ranks assigned correctly", () => {
    const results = getResults(TournamentName.Masters)!;
    expect(results.standings[0].rank).toBe(1);
    for (const standing of results.standings) {
      expect(standing.rank).toBeGreaterThan(0);
    }
  });

  it("should return undefined for tournaments without results", () => {
    expect(getResults(TournamentName.Pga)).toBeUndefined();
    expect(getResults(TournamentName.UsOpen)).toBeUndefined();
    expect(getResults(TournamentName.Open)).toBeUndefined();
  });
});
