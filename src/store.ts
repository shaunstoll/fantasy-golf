import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export const useStore = create<{
  favoriteTeams: string[];
  toggleFavoriteTeam: (teamName: string) => void;
}>()(
  devtools(
    persist(
      (set) => ({
        favoriteTeams: [],
        toggleFavoriteTeam: (teamName: string) =>
          set((state) => ({
            favoriteTeams: state.favoriteTeams.includes(teamName)
              ? state.favoriteTeams.filter((t) => t !== teamName)
              : [...state.favoriteTeams, teamName],
          })),
      }),
      {
        name: "fantasy-golf-storage",
        partialize: (state) => ({ favoriteTeams: state.favoriteTeams }),
      },
    ),
  ),
);
