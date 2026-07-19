export interface TournamentData {
  active: string[];
  pga: PGAData; // the tour not the tournament
}

export interface PGAData {
  info: PGAInfo;
  lb: PlayerLeaderboardEntry[];
}

export interface PGAInfo {
  complete: string; // "yes" | "no"
  current_round: string; // "1" | "2" | "3" | "4"
  event_name: string; // "The Open Championship"
  iso: string; // ISO timestamp
}

export interface PlayerLeaderboardEntry {
  d: number; // player ID
  f: string; // first name
  l: string; // last name
  n: string; // nationality
  p: string; // position (e.g., '1', 'T2', 'CUT', 'WD')
  s: string; // score
  t: string; // thru (e.g., 'F', '2:30', '-', 9)
  w: string; // win probability
}
