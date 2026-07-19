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
  // First (`f`) and last (`l`) tee times per round as UTC instants, keyed by
  // round number ("1".."4"). These anchor the event-local tee-time strings in
  // `t` to real instants — see src/utils/tee-time.utils.ts.
  times?: Record<string, RoundTeeTimes>;
}

export interface RoundTeeTimes {
  f: string; // first tee time of the round, UTC ISO
  l: string; // last tee time of the round, UTC ISO
}

export interface PlayerLeaderboardEntry {
  d: number; // player ID
  f: string; // first name
  l: string; // last name
  n: string; // nationality
  p: string; // position (e.g., '1', 'T2', 'CUT', 'WD')
  s: string; // score
  // thru — a bare number for holes completed (e.g. 9), or a string: 'F', '-',
  // or an event-local tee time like '2:30'. Always stringify before use.
  t: string | number;
  w: string; // win probability
}
