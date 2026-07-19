import type { PlayerStatus } from "@/enums/player-status.enum";

export interface Leaderboard {
  [key: string]: {
    nationality: string;
    score: number;
    thru: string;
    // UTC instant of the player's tee time, present only while `thru` holds a
    // tee-time string; the UI renders it in the viewer's local timezone.
    teeTimeUtc?: string;
    isTied: boolean;
    place?: number;
    status: PlayerStatus;
  };
}
