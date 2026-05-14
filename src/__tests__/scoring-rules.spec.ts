import { describe, expect, it } from "vitest";

import { TournamentName } from "@/enums/tournament.enum";
import { PlayerStatus } from "@/enums/player-status.enum";
import type { Leaderboard } from "@/interfaces/leaderboard.interface";
import type { Standing } from "@/interfaces/standing.interface";
import type { Team } from "@/interfaces/team.interface";
import type { Tournament } from "@/interfaces/tournament.interface";
import ScoringService from "@/services/scoring.service";

interface PlayerSpec {
  firstName: string;
  lastName: string;
  rank: number;
  place?: number;
  isTied?: boolean;
}

function buildScenario(teamSpecs: PlayerSpec[][], round: number = 4) {
  const seen = new Map<string, PlayerSpec>();
  for (const slots of teamSpecs) {
    for (const p of slots) seen.set(`${p.firstName} ${p.lastName}`, p);
  }
  const leaderboard: Leaderboard = {};
  for (const [name, p] of seen) {
    leaderboard[name] = {
      nationality: "USA",
      score: 0,
      thru: "F",
      isTied: p.isTied ?? false,
      place: p.place,
      status: PlayerStatus.PLAYING,
    };
  }
  const teams: Team[] = teamSpecs.map((slots, i) => ({
    name: `team-${i}`,
    players: slots.map((p) => ({ firstName: p.firstName, lastName: p.lastName, rank: p.rank })),
  }));
  const tournament: Tournament = { name: TournamentName.Pga, round, leaderboard };
  return new ScoringService().getStandings(teams, tournament);
}

function find(standings: Standing[], teamName: string) {
  const team = standings.find((s) => s.name === teamName);
  if (!team) throw new Error(`Team ${teamName} not found`);
  return team;
}

function findPlayer(team: Standing, firstName: string) {
  const player = team.players.find((p) => p.firstName === firstName);
  if (!player) throw new Error(`Player ${firstName} not found on ${team.name}`);
  return player;
}

// Filler ranks sit at astronomical values so they can never coincide with a
// decoy's "lowest-rank in top 25" rank. Fillers have no `place`, so they don't
// affect placement scoring, but pass 2's rank-match check (+15) compares ranks
// regardless of place — keeping fillers far away avoids accidental matches.
function pad(slots: PlayerSpec[], idx: number = 0): PlayerSpec[] {
  while (slots.length < 8) {
    slots.push({
      firstName: `Filler${idx}-${slots.length}`,
      lastName: `P`,
      rank: 90000 + idx * 100 + slots.length,
    });
  }
  return slots;
}

// A decoy team that owns the highest-rank-number top-25 finisher in the field,
// soaking up the lowest-ranked-player +15 bonus so test assertions on
// other teams isolate placement/rank/cut scoring cleanly.
const lowestRankSoak: PlayerSpec = {
  firstName: "Soak",
  lastName: "Decoy",
  rank: 500,
  place: 25,
};
const soakTeam = (): PlayerSpec[][] => [pad([lowestRankSoak], 7)];

describe("Scoring rules contract", () => {
  it("captain winning outright multiplies the +15 winner bonus to +30", () => {
    const captain: PlayerSpec = {
      firstName: "Winner",
      lastName: "One",
      rank: 10,
      place: 1,
      isTied: false,
    };
    const standings = buildScenario([pad([captain]), ...soakTeam()]);
    const player = findPlayer(find(standings, "team-0"), "Winner");
    // Base: +15 (winner) + 10 (top10) + 4 (top15) + 3 (top25) + 5 (made cut) = 37
    // Captain multiplier 2x → 74
    expect(player.fantasyScore).toBe(74);
    expect(player.firstPlaceBonus).toBe(true);
    expect(player.lowestRankedPlayerBonus).toBe(false);
  });

  it("captain owning the lowest-ranked top-25 finisher gets flat +15, not multiplied", () => {
    // Captain is rank 1000 (worst in field) and finishes top 25.
    const captain: PlayerSpec = {
      firstName: "Sleeper",
      lastName: "Pick",
      rank: 1000,
      place: 20,
    };
    const standings = buildScenario([pad([captain])]);
    const team = find(standings, "team-0");
    const player = findPlayer(team, "Sleeper");
    // (top25 base 3 + tier 11 + made-cut 5) × 2 + 15 flat = 19 × 2 + 15 = 53
    expect(player.fantasyScore).toBe(53);
    expect(player.lowestRankedPlayerBonus).toBe(true);
    expect(team.score).toBe(53);
  });

  it("rank exactly 10 making top 25 gets no rank-tier bonus", () => {
    // Slot 2 (1x multiplier) so multiplier doesn't muddy the math.
    const ranked10: PlayerSpec = { firstName: "Ranked", lastName: "Ten", rank: 10, place: 20 };
    const standings = buildScenario([
      pad([
        { firstName: "x", lastName: "y", rank: 1 },
        { firstName: "a", lastName: "b", rank: 2 },
        ranked10,
      ]),
      ...soakTeam(),
    ]);
    const player = findPlayer(find(standings, "team-0"), "Ranked");
    // Top 25 base 3 + made cut 5 = 8 (no rank tier bonus)
    expect(player.fantasyScore).toBe(8);
  });

  it("rank 11 making top 25 gets the +6 rank-tier bonus", () => {
    const ranked11: PlayerSpec = { firstName: "Ranked", lastName: "Eleven", rank: 11, place: 20 };
    const standings = buildScenario([
      pad([
        { firstName: "x", lastName: "y", rank: 1 },
        { firstName: "a", lastName: "b", rank: 2 },
        ranked11,
      ]),
      ...soakTeam(),
    ]);
    const player = findPlayer(find(standings, "team-0"), "Ranked");
    // Top 25 base 3 + tier 6 + made cut 5 = 14
    expect(player.fantasyScore).toBe(14);
  });

  it("rank 20 → +6 and rank 21 → +11", () => {
    const ranked20: PlayerSpec = { firstName: "Twenty", lastName: "P", rank: 20, place: 22 };
    const ranked21: PlayerSpec = { firstName: "TwentyOne", lastName: "P", rank: 21, place: 23 };
    const standings = buildScenario([
      pad([
        { firstName: "x", lastName: "y", rank: 1 },
        { firstName: "a", lastName: "b", rank: 2 },
        ranked20,
        ranked21,
      ]),
      ...soakTeam(),
    ]);
    const team = find(standings, "team-0");
    // rank 20: top25 3 + tier 6 + made-cut 5 = 14
    expect(findPlayer(team, "Twenty").fantasyScore).toBe(14);
    // rank 21: top25 3 + tier 11 + made-cut 5 = 19
    expect(findPlayer(team, "TwentyOne").fantasyScore).toBe(19);
  });

  it("top-5 ranked player making cut does NOT get the +5 made-cut bonus", () => {
    const star: PlayerSpec = { firstName: "Star", lastName: "Player", rank: 1, place: 30 };
    const standings = buildScenario([pad([star]), ...soakTeam()]);
    const player = findPlayer(find(standings, "team-0"), "Star");
    // Captain (2x), place 30 → outside top 25, rank ≤ 5 → no made-cut bonus
    expect(player.fantasyScore).toBe(0);
    expect(player.madeCutBonus).toBe(false);
  });

  it("tied for 1st place yields no +15 winner bonus", () => {
    const tiedA: PlayerSpec = {
      firstName: "TiedA",
      lastName: "P",
      rank: 10,
      place: 1,
      isTied: true,
    };
    const tiedB: PlayerSpec = {
      firstName: "TiedB",
      lastName: "P",
      rank: 11,
      place: 1,
      isTied: true,
    };
    const standings = buildScenario([pad([tiedA, tiedB]), ...soakTeam()]);
    const team = find(standings, "team-0");
    expect(findPlayer(team, "TiedA").firstPlaceBonus).toBe(false);
    expect(findPlayer(team, "TiedB").firstPlaceBonus).toBe(false);
    expect(team.firstPlaceBonus).toBe(false);
  });

  it("two teams both owning the highest-rank-number top-25 finisher each get +15", () => {
    // Two different teams, each owning a different rank-1000 player in top 25.
    // The code uses a single integer for lowestRankedPlayerInTop25, so both match.
    const aSlot: PlayerSpec = {
      firstName: "RankHundredA",
      lastName: "P",
      rank: 1000,
      place: 15,
    };
    const bSlot: PlayerSpec = {
      firstName: "RankHundredB",
      lastName: "P",
      rank: 1000,
      place: 16,
    };
    const standings = buildScenario([pad([aSlot], 1), pad([bSlot], 2)]);
    const a = find(standings, "team-0");
    const b = find(standings, "team-1");
    expect(a.lowestRankedPlayerBonus).toBe(true);
    expect(b.lowestRankedPlayerBonus).toBe(true);
    expect(findPlayer(a, "RankHundredA").lowestRankedPlayerBonus).toBe(true);
    expect(findPlayer(b, "RankHundredB").lowestRankedPlayerBonus).toBe(true);
  });

  it("all-cut team bonus applies even when the roster includes a top-5 ranked player", () => {
    // Eight players, all with a place (so allPlayersMadeCutBonus stays true).
    // Slot 0 is rank 1 (no individual +5), slots 1-7 are rank > 5 (each +5).
    const team: PlayerSpec[] = [
      { firstName: "TopFive", lastName: "Star", rank: 1, place: 30 },
      { firstName: "P", lastName: "Two", rank: 50, place: 40 },
      { firstName: "P", lastName: "Three", rank: 51, place: 41 },
      { firstName: "P", lastName: "Four", rank: 52, place: 42 },
      { firstName: "P", lastName: "Five", rank: 53, place: 43 },
      { firstName: "P", lastName: "Six", rank: 54, place: 44 },
      { firstName: "P", lastName: "Seven", rank: 55, place: 45 },
      { firstName: "P", lastName: "Eight", rank: 56, place: 46 },
    ];
    const standings = buildScenario([team, ...soakTeam()]);
    const t = find(standings, "team-0");
    expect(t.madeCutBonus).toBe(true);
    // Slot 0 (TopFive): 0 × 2 = 0
    // Slot 1 (Two): 5 × 1.5 = 7.5
    // Slots 2-7: 5 × 1 × 6 = 30
    // Team all-cut bonus: +15 flat → 52.5
    expect(t.score).toBe(52.5);
  });
});
