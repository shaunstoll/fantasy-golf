export interface Leaderboard {
  [key: string]: {
    isTied: boolean;
    place: number;
  };
}
