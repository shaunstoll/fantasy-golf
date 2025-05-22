import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { Standing } from "./interfaces/standing.interface";

export const useStore = create<{
  favoriteTeams: Standing[];
  toggleFavoriteTeam: (team: Standing) => void;
}>()(
  devtools(
    persist(
      (set) => ({
        favoriteTeams: [],
        toggleFavoriteTeam: (team: Standing) =>
          set((state) => ({
            favoriteTeams: state.favoriteTeams.includes(team)
              ? state.favoriteTeams.filter((t) => t.name !== team.name)
              : [...state.favoriteTeams, team].sort((a, b) => a.rank - b.rank),
          })),
      }),
      {
        name: "fantasy-golf-storage",
        partialize: (state) => ({ favoriteTeams: state.favoriteTeams }),
      },
    ),
  ),
);
