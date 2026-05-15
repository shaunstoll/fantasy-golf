import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import { standingsMock } from "@/__tests__/mocks/standings.mock";
import Home from "@/app/page";

vi.mock("@/store", () => ({
  useStore: vi.fn(() => ({
    favoriteTeams: [],
  })),
}));

const resultsStandings = standingsMock.slice(0, 2);

vi.mock("@/trpc/react", () => ({
  api: {
    tournament: {
      get: {
        useQuery: vi.fn(() => ({
          data: standingsMock,
          isLoading: false,
        })),
      },
      leaderboard: {
        useQuery: vi.fn(() => ({
          data: [],
          isLoading: false,
        })),
      },
      results: {
        useQuery: vi.fn(() => ({
          data: { standings: resultsStandings, leaderboard: [] },
          isLoading: false,
        })),
      },
    },
  },
}));

describe("Home Component", () => {
  it("should render the home component", async () => {
    render(<Home />);
    const standingButton = screen.getByRole("button", {
      name: `team ${standingsMock[0].name}`,
    });
    await userEvent.click(standingButton);
    expect(screen.getByText(standingsMock[0].players[0].lastName)).toBeInTheDocument();
  });

  it("should render total tab with aggregated standings", async () => {
    render(<Home />);
    const totalButton = screen.getByRole("button", { name: "Total" });
    await userEvent.click(totalButton);
    expect(screen.getByText(resultsStandings[0].name)).toBeInTheDocument();
    expect(screen.getByText(resultsStandings[1].name)).toBeInTheDocument();
  });

  it("should render tournament filter buttons on standings tab", () => {
    render(<Home />);
    expect(screen.getByRole("button", { name: "Total" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Masters" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "PGA" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "US Open" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
  });
});
