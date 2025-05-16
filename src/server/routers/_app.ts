import { router } from "../trpc";
import { leaderboardRouter } from "./leaderboard.router";

export const appRouter = router({
  leaderboard: leaderboardRouter,
});

export type AppRouter = typeof appRouter;
