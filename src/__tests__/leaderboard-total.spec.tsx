import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import Leaderboard from "@/components/leaderboard";
import { PlayerStatus } from "@/enums/player-status.enum";
import type { LeaderboardPlayer } from "@/interfaces/leaderboard-player.interface";

// Pin the "current" major to US Open so the live query feeds it deterministically,
// regardless of the month the test runs in.
vi.mock("@/config/tournaments", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/config/tournaments")>();
  return { ...actual, getCurrentTournament: () => actual.tournaments[2].name };
});

function lp(
  over: Partial<LeaderboardPlayer> & Pick<LeaderboardPlayer, "firstName" | "lastName">,
): LeaderboardPlayer {
  return {
    rank: 1,
    place: 1,
    nationality: "USA",
    status: PlayerStatus.PLAYING,
    score: 0,
    thru: "F",
    isTied: false,
    placementPoints: 0,
    rankingBonus: 0,
    madeCutBonusPoints: 0,
    firstPlaceBonusPoints: 0,
    lowestRankedBonusPoints: 0,
    fantasyScore: 0,
    ownedCount: 0,
    ownedTotal: 36,
    ...over,
  };
}

const usOpenPlayers = [
  lp({ firstName: "Scottie", lastName: "Scheffler", place: 4, fantasyScore: 14, ownedCount: 31 }),
];
const mastersPlayers = [
  lp({
    firstName: "Scottie",
    lastName: "Scheffler",
    place: 2,
    fantasyScore: 32,
    ownedCount: 30,
    madeCutBonusPoints: 5,
    lowestRankedBonusPoints: 15,
  }),
];

vi.mock("@/trpc/react", () => ({
  api: {
    tournament: {
      leaderboard: {
        useQuery: () => ({
          data: { players: usOpenPlayers, cutLine: 60, round: 4 },
          isLoading: false,
          fetchStatus: "fetched",
          error: null,
        }),
      },
      results: {
        useQuery: ({ tournament }: { tournament: string }) => ({
          data: { standings: [], leaderboard: tournament === "masters" ? mastersPlayers : [] },
          isLoading: false,
          fetchStatus: "fetched",
          error: null,
        }),
      },
    },
  },
}));

const noop = () => {};

describe("Leaderboard Total view", () => {
  it("sums points and ownership across majors and expands to per-major finishes", async () => {
    render(
      <Leaderboard
        search=""
        onSearchChange={noop}
        sortKey="points"
        setSortKey={noop}
        sortDir="desc"
        setSortDir={noop}
        hideUnowned={false}
        setHideUnowned={noop}
        tournament="total"
        onTournamentChange={noop}
      />,
    );

    // Combined points (14 + 32) and season ownership ((31 + 30) / (36 * 2) = 85%).
    expect(screen.getByText("46")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();

    // Clicking the row reveals a row per major with its finish and points.
    await userEvent.click(screen.getByRole("button", { name: "player Scottie Scheffler" }));
    const finishes = screen.getByTestId("total-finishes");
    expect(within(finishes).getByText("Masters")).toBeInTheDocument();
    expect(within(finishes).getByText("US Open")).toBeInTheDocument();
    // Per-major points (Masters 32, US Open 14) appear in the breakdown.
    expect(within(finishes).getByText("32")).toBeInTheDocument();
    expect(within(finishes).getByText("14")).toBeInTheDocument();
    // Per-major bonus markers render (Masters: made cut "M" + lowest ranked "L").
    expect(within(finishes).getByText("M")).toBeInTheDocument();
    expect(within(finishes).getByText("L")).toBeInTheDocument();
  });
});
