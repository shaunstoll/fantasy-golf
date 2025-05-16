export interface TournamentData {
  active: string[];
  pga: PGAData;
}

export interface PGAData {
  info: PGAInfo;
  lb: PlayerLeaderboardEntry[];
}

export interface PGAInfo {
  complete: string; // "yes" | "no" might be better as a union type
  current_round: string;
  event_name: string;
  iso: string; // ISO timestamp
}

export interface PlayerLeaderboardEntry {
  d: number; // player ID?
  f: string; // first name
  l: string; // last name
  n: string; // nationality
  p: string; // round/position?
  s: string; // score
  t: string; // status (e.g., 'F' = finished)
  w: string; // win probability
}
