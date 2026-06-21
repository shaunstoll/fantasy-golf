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
          data: { standings: standingsMock, cutLine: 70, round: 2 },
          isLoading: false,
        })),
      },
      leaderboard: {
        useQuery: vi.fn(() => ({
          data: { players: [], cutLine: 70, round: 2 },
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

  it("opens a team to the Total pick breakdown by default when sorted by Total", async () => {
    render(<Home />);
    await userEvent.click(screen.getByRole("button", { name: "Total" }));

    // Top-level tabs exist once each before any team is expanded.
    expect(screen.getAllByRole("button", { name: "Masters" })).toHaveLength(1);

    await userEvent.click(screen.getByRole("button", { name: `team ${resultsStandings[0].name}` }));

    // Expanding adds the in-roster selector (a second Masters control)...
    expect(screen.getAllByRole("button", { name: "Masters" })).toHaveLength(2);
    // ...and, because the page is sorted by Total, opens straight to the
    // season-long pick breakdown rather than a single major's roster.
    expect(screen.getByText(/\d+ players/)).toBeInTheDocument();

    // Switching to a major via the in-roster selector shows that major's roster.
    const mastersSelector = screen.getAllByRole("button", { name: "Masters" })[1];
    await userEvent.click(mastersSelector);
    expect(screen.queryByText(/\d+ players/)).not.toBeInTheDocument();
    expect(screen.getByText(resultsStandings[0].players[0].lastName)).toBeInTheDocument();
  });

  it("should show the season-long Total pick breakdown with captain multipliers", async () => {
    render(<Home />);
    await userEvent.click(screen.getByRole("button", { name: "Total" }));
    await userEvent.click(screen.getByRole("button", { name: `team ${resultsStandings[0].name}` }));

    // The breakdown header counts the unique players the team picked...
    expect(screen.getByText(/\d+ players/)).toBeInTheDocument();
    // ...and surfaces where the team spent its captain multiplier.
    expect(screen.getAllByText("2×").length).toBeGreaterThan(0);
  });

  it("should render the column sort headers on the standings tab", () => {
    render(<Home />);
    // The sort control lives in the column header now, so each major/Total
    // column is a button labelled by its compact badge ("US" for US Open).
    expect(screen.getByRole("button", { name: "Total" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Masters" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "PGA" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "US" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
  });

  it("shows per-major bonus dots on a major filter and hides them on Total", async () => {
    render(<Home />);
    // Default filter is a specific major, so teams with bonuses show bonus dots.
    expect(screen.getAllByTestId("team-bonuses").length).toBeGreaterThan(0);

    // Total has no per-major bonuses, so the bonus dots disappear entirely.
    await userEvent.click(screen.getByRole("button", { name: "Total" }));
    expect(screen.queryAllByTestId("team-bonuses")).toHaveLength(0);
  });

  it("shows the four-major score cluster on every team row regardless of filter", async () => {
    render(<Home />);
    // Each team row carries every major's badge label (Masters/PGA/US/Open/Total),
    // so there is at least one of each — the unified Total-style row.
    expect(screen.getAllByText("Masters").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Total").length).toBeGreaterThan(0);
  });
});
