import { describe, expect, it } from "vitest";

import { PlayerStatus } from "@/enums/player-status.enum";
import { TournamentName } from "@/enums/tournament.enum";
import type { Leaderboard } from "@/interfaces/leaderboard.interface";
import type { Ranking } from "@/interfaces/ranking.interface";
import type { Team } from "@/interfaces/team.interface";
import type { Tournament } from "@/interfaces/tournament.interface";
import { computePlayerPoints } from "@/services/scoring-rules";
import ScoringService from "@/services/scoring.service";

describe("computePlayerPoints", () => {
  it("awards the winner, placement, and made-cut points for an outright win", () => {
    const pts = computePlayerPoints({ place: 1, isTied: false, rank: 10, round: 4, cutLine: 70 });
    // 11-1 (top10) + 4 (top15) + 3 (top25) = 17 placement; rank 10 → no tier bonus.
    expect(pts).toEqual({
      placementPoints: 17,
      rankingBonus: 0,
      madeCutBonusPoints: 5,
      firstPlaceBonusPoints: 15,
      outsideCutLine: false,
    });
  });

  it("gives the +11 rank tier to a low-ranked top-25 finisher", () => {
    const pts = computePlayerPoints({
      place: 20,
      isTied: false,
      rank: 1000,
      round: 4,
      cutLine: 70,
    });
    expect(pts).toMatchObject({ placementPoints: 3, rankingBonus: 11, madeCutBonusPoints: 5 });
  });

  it("flags a missed projected cut and withholds the made-cut bonus", () => {
    const pts = computePlayerPoints({ place: 30, isTied: false, rank: 10, round: 2, cutLine: 25 });
    expect(pts.outsideCutLine).toBe(true);
    expect(pts.madeCutBonusPoints).toBe(0);
  });

  it("withholds the made-cut bonus from a top-5 ranked player", () => {
    const pts = computePlayerPoints({ place: 12, isTied: false, rank: 1, round: 4, cutLine: 70 });
    expect(pts.madeCutBonusPoints).toBe(0);
  });
});

describe("getStandings and getLeaderboard agree on the shared point categories", () => {
  it("produces identical per-player placement/rank/made-cut/winner points", () => {
    const roster = [
      { firstName: "Alpha", lastName: "One", rank: 3, place: 1, isTied: false },
      { firstName: "Bravo", lastName: "Two", rank: 15, place: 8, isTied: true },
      { firstName: "Charlie", lastName: "Three", rank: 40, place: 20, isTied: false },
      { firstName: "Delta", lastName: "Four", rank: 2, place: 50, isTied: false },
    ];

    const leaderboard: Leaderboard = {};
    const rankings: Record<string, Ranking> = {};
    for (const p of roster) {
      const name = `${p.firstName} ${p.lastName}`;
      leaderboard[name] = {
        nationality: "USA",
        score: 0,
        thru: "F",
        isTied: p.isTied,
        place: p.place,
        status: PlayerStatus.PLAYING,
      };
      rankings[name] = { firstName: p.firstName, lastName: p.lastName, rank: p.rank };
    }

    const teams: Team[] = [{ name: "team-0", players: roster.map((p) => ({ ...p })) }];
    const tournament: Tournament = { name: TournamentName.Pga, round: 4, leaderboard };
    const service = new ScoringService();

    const standings = service.getStandings(teams, tournament);
    const board = service.getLeaderboard(teams, tournament, rankings);

    for (const player of standings[0].players) {
      const entry = board.find(
        (b) => b.firstName === player.firstName && b.lastName === player.lastName,
      );
      expect(entry, `${player.firstName} on leaderboard`).toBeDefined();
      expect({
        placementPoints: player.placementPoints,
        rankingBonus: player.rankingBonus,
        madeCutBonusPoints: player.madeCutBonusPoints,
        firstPlaceBonusPoints: player.firstPlaceBonusPoints,
      }).toEqual({
        placementPoints: entry?.placementPoints,
        rankingBonus: entry?.rankingBonus,
        madeCutBonusPoints: entry?.madeCutBonusPoints,
        firstPlaceBonusPoints: entry?.firstPlaceBonusPoints,
      });
    }
  });
});
