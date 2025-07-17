export interface MastersData {
  fileEpoch: string;
  data: {
    currentRound: string;
    wallClockTime: string;
    statusRound: string;
    yardages: RoundsData;
    pars: RoundsData;
    player: MastersPlayer[];
  };
}

interface RoundsData {
  round1: number[];
  round2: number[];
  round3: number[];
  round4: number[];
}

interface MastersPlayer {
  id: string;
  display_name: string;
  display_name2: string;
  first_name: string;
  last_name: string;
  full_name: string;
  countryName: string;
  countryCode: string;
  live: string;
  video: boolean;
  pos: string;
  image: boolean;
  amateur: boolean;
  past: boolean;
  firsttimer: boolean;
  status: string;
  newStatus: string;
  active: boolean;
  us: boolean;
  intl: boolean;
  teetime: string;
  epoch: number;
  tee_order: string;
  sort_order: string;
  start: string;
  group: string;
  today: string;
  thru: string;
  groupHistory: string;
  thruHistory: string;
  lastHoleWithShot: string;
  holeProgress: number;
  topar: string;
  total: string;
  totalUnderPar: string;
  movement: string;
  last_highlight: string;
  round1: RoundDetails;
  round2: RoundDetails;
  round3: RoundDetails;
  round4: RoundDetails;
}

interface RoundDetails {
  prior?: number;
  fantasy: number;
  total?: number;
  roundStatus: string;
  teetime: string;
  scores: Array<number | undefined>;
}
