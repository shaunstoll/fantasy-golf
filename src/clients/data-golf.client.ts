import axios from "axios";
import type { TournamentData } from "../interfaces/tournament.interface";
import type { Leaderboard } from "../interfaces/leaderboard.interface";
import type { Ranking } from "../interfaces/ranking.interface";
import { PlayerStatus } from "@/enums/player-status.enum";

export default class DataGolfClient {
  private cache: {
    leaderboard: Leaderboard;
    timestamp: number;
  } = {
    leaderboard: {},
    timestamp: 0,
  };

  constructor() {
    this.cache = {
      leaderboard: {},
      timestamp: 0,
    };
  }

  async getRankings(): Promise<Record<string, Ranking>> {
    const response = await axios.get("https://datagolf.com/datagolf-rankings");
    const html = response.data;
    const pullDataIndex = html.indexOf("function pull_data()");
    const substring1 = html.substring(pullDataIndex);
    const startIndex =
      substring1.indexOf("JSON.parse('") + "JSON.parse('".length;
    const endIndex = substring1.indexOf(";") - 2;
    const jsonString = substring1.substring(startIndex, endIndex);
    const rankings: Record<string, Ranking> = {};
    JSON.parse(jsonString).data.table_data.data.forEach(
      (p: { last: string; first: string; dg_rank: number }) => {
        const key = p.last.toLowerCase();
        if (rankings[key]) {
          console.error(
            `Duplicate player last name found: ${p.first} ${p.last} and ${rankings[key].firstName} ${rankings[key].lastName}`,
          );
        } else {
          rankings[key] = {
            firstName: p.first,
            lastName: p.last,
            rank: p.dg_rank,
          };
        }
      },
    );
    return rankings;
  }

  async getLeaderboard() {
    if (this.cache.timestamp > Date.now() - 5000) {
      return this.cache.leaderboard;
    }
    const response = await axios.get<TournamentData>(
      "https://letzig.datagolf.com/live-model/get-main-data/mini",
    );
    const leaderboard: Leaderboard = {};
    response.data.pga.lb.forEach((p) => {
      const isCut = p.p === "CUT";
      const withdrawn = p.p === "WD";
      const isTied = p.p.startsWith("T");
      leaderboard[`${p.f} ${p.l}`] = {
        nationality: p.n,
        score: parseInt(p.s),
        thru: parseInt(p.t.toString().replace("R", "")),
        isTied,
        place: isCut || withdrawn ? Infinity : parseInt(p.p.replace("T", "")),
        status: isCut
          ? PlayerStatus.MISSED_CUT
          : withdrawn
            ? PlayerStatus.WITHDRAWN
            : PlayerStatus.PLAYING,
        // TODO: Determine how "Did Not Start" is represented
      };
    });
    this.cache = {
      leaderboard,
      timestamp: Date.now(),
    };
    return leaderboard;
  }
}
