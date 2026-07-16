import { describe, expect, it } from "vitest";

import { getRankings } from "@/db/rankings";
import { TournamentName } from "@/enums/tournament.enum";

describe("Rankings", () => {
  it("returns the US Open rankings for the US Open", () => {
    const rankings = getRankings(TournamentName.UsOpen);
    expect(Object.keys(rankings).length).toBeGreaterThan(0);
    expect(rankings["Jon Rahm"]?.rank).toBe(3);
  });

  it("returns the Masters rankings for the Masters", () => {
    const rankings = getRankings(TournamentName.Masters);
    expect(Object.keys(rankings).length).toBeGreaterThan(0);
    expect(rankings["Jon Rahm"]?.rank).toBe(2);
  });

  it("returns the Open rankings for the Open", () => {
    const rankings = getRankings(TournamentName.Open);
    expect(Object.keys(rankings).length).toBeGreaterThan(0);
    expect(rankings["Jon Rahm"]?.rank).toBe(5);
  });

  it("serves different rankings per tournament", () => {
    const masters = getRankings(TournamentName.Masters);
    const usOpen = getRankings(TournamentName.UsOpen);
    expect(usOpen["Xander Schauffele"]?.rank).not.toBe(masters["Xander Schauffele"]?.rank);
  });

  it("returns an empty record for a tournament without a rankings file", () => {
    expect(getRankings(TournamentName.Pga)).toEqual({});
  });
});
