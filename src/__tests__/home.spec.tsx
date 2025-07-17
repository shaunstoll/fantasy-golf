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

vi.mock("@/trpc/react", () => ({
  api: {
    tournament: {
      get: {
        useQuery: vi.fn(() => ({
          data: standingsMock,
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
    expect(
      screen.getByText(standingsMock[0].players[0].lastName),
    ).toBeInTheDocument();
  });
});
