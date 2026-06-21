import { describe, expect, it } from "vitest";

import { PlayerStatus } from "@/enums/player-status.enum";
import { TournamentName } from "@/enums/tournament.enum";
import type { Leaderboard } from "@/interfaces/leaderboard.interface";
import type { Ranking } from "@/interfaces/ranking.interface";
import type { Team } from "@/interfaces/team.interface";
import type { Tournament } from "@/interfaces/tournament.interface";
import ScoringService from "@/services/scoring.service";

function entry(place: number) {
  return {
    nationality: "USA",
    score: 0,
    thru: "F",
    isTied: false,
    place,
    status: PlayerStatus.PLAYING,
  };
}

describe("Leaderboard lowest-ranked bonus", () => {
  it("sets the +15 low bonus from the worst-ranked OWNED top-25 player, ignoring unowned players", () => {
    // An unowned long-shot finishes top 25 with a far worse rank than any owned
    // player. It must NOT set the bar — only rostered players can.
    const leaderboard: Leaderboard = {
      "Owned Sleeper": entry(10),
      "Unowned LongShot": entry(5),
    };
    const rankings: Record<string, Ranking> = {
      "Owned Sleeper": { firstName: "Owned", lastName: "Sleeper", rank: 50 },
      "Unowned LongShot": { firstName: "Unowned", lastName: "LongShot", rank: 999 },
    };
    const teams: Team[] = [
      { name: "team-0", players: [{ firstName: "Owned", lastName: "Sleeper", rank: 50 }] },
    ];
    const tournament: Tournament = {
      name: TournamentName.Pga,
      round: 4,
      leaderboard,
    };

    const players = new ScoringService().getLeaderboard(teams, tournament, rankings);
    const owned = players.find((p) => p.lastName === "Sleeper");
    const unowned = players.find((p) => p.lastName === "LongShot");

    expect(owned?.lowestRankedBonusPoints).toBe(15);
    expect(unowned?.lowestRankedBonusPoints).toBe(0);
  });
});

describe("Leaderboard rank source", () => {
  it("uses a rostered player's roster rank, not the rankings map", () => {
    // The rankings map disagrees with the roster (e.g. PGA was once built with
    // the Masters table). The roster is the source standings trusts, so the
    // leaderboard must match it for rostered players.
    const leaderboard: Leaderboard = { "Justin Thomas": entry(4) };
    const rankings: Record<string, Ranking> = {
      "Justin Thomas": { firstName: "Justin", lastName: "Thomas", rank: 36 },
    };
    const teams: Team[] = [
      { name: "team-0", players: [{ firstName: "Justin", lastName: "Thomas", rank: 45 }] },
    ];
    const tournament: Tournament = { name: TournamentName.Pga, round: 4, leaderboard };

    const players = new ScoringService().getLeaderboard(teams, tournament, rankings);
    expect(players.find((p) => p.lastName === "Thomas")?.rank).toBe(45);
  });

  it("falls back to the rankings map for unrostered field players", () => {
    const leaderboard: Leaderboard = { "Some Pro": entry(10) };
    const rankings: Record<string, Ranking> = {
      "Some Pro": { firstName: "Some", lastName: "Pro", rank: 99 },
    };
    const tournament: Tournament = { name: TournamentName.Pga, round: 4, leaderboard };

    const players = new ScoringService().getLeaderboard([], tournament, rankings);
    expect(players.find((p) => p.lastName === "Pro")?.rank).toBe(99);
  });
});
