import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import Player from "@/components/player";
import { PlayerStatus } from "@/enums/player-status.enum";
import type { Player as PlayerType } from "@/interfaces/player.interface";

const basePlayer: PlayerType = {
  firstName: "Justin",
  lastName: "Thomas",
  rank: 45,
  place: 4,
  nationality: "USA",
  status: PlayerStatus.PLAYING,
  score: -5,
  thru: "F",
  lowestRankedPlayerBonus: true,
  madeCutBonus: true,
  firstPlaceBonus: false,
  isTied: true,
  fantasyScore: 45,
  multiplier: 1,
  ownedCount: 3,
  ownedTotal: 36,
  placementPoints: 14,
  rankingBonus: 11,
  madeCutBonusPoints: 5,
  firstPlaceBonusPoints: 0,
  lowestRankedBonusPoints: 15,
};

describe("Player breakdown", () => {
  it("is collapsed until the row is clicked", async () => {
    render(<Player player={basePlayer} />);
    expect(screen.queryByTestId("player-breakdown")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "player Justin Thomas" }));

    // Each scoring category surfaces in the breakdown with its raw point value.
    const breakdown = screen.getByTestId("player-breakdown");
    expect(within(breakdown).getByText("Place")).toBeInTheDocument();
    expect(within(breakdown).getByText("Rank")).toBeInTheDocument();
    expect(within(breakdown).getByText("MC")).toBeInTheDocument();
    expect(within(breakdown).getByText("Low")).toBeInTheDocument();
  });

  it("shows the captain multiplier as a Weight factor in the breakdown", async () => {
    render(<Player player={{ ...basePlayer, multiplier: 2, fantasyScore: 75 }} />);
    await userEvent.click(screen.getByRole("button", { name: "player Justin Thomas" }));
    const breakdown = screen.getByTestId("player-breakdown");
    expect(within(breakdown).getByText("Weight")).toBeInTheDocument();
    expect(within(breakdown).getByText("×")).toBeInTheDocument();
  });

  it("falls back to the total when breakdown parts are absent (frozen results)", async () => {
    const frozen: PlayerType = {
      ...basePlayer,
      placementPoints: undefined,
      rankingBonus: undefined,
      madeCutBonusPoints: undefined,
      firstPlaceBonusPoints: undefined,
      lowestRankedBonusPoints: undefined,
    };
    render(<Player player={frozen} />);
    await userEvent.click(screen.getByRole("button", { name: "player Justin Thomas" }));
    const breakdown = screen.getByTestId("player-breakdown");
    expect(within(breakdown).getByText("Total")).toBeInTheDocument();
    expect(within(breakdown).queryByText("Place")).not.toBeInTheDocument();
  });
});
