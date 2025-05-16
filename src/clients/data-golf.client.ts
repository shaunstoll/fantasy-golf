import axios from "axios";
import type { TournamentData } from "../interfaces/tournament.interface";
import type { Leaderboard } from "../interfaces/leaderboard.interface";
import type { Ranking } from "../interfaces/ranking.interface";

export default class DataGolfClient {
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
        rankings[p.last.toLowerCase()] = {
          firstName: p.first,
          lastName: p.last,
          rank: p.dg_rank,
        };
      },
    );
    return rankings;
  }

  async getLeaderboard() {
    const response = await axios.get<TournamentData>(
      "https://letzig.datagolf.com/live-model/get-main-data/mini",
    );
    const leaderboard: Leaderboard = {};
    response.data.pga.lb.forEach((p) => {
      const isTied = p.p.startsWith("T");
      leaderboard[`${p.f} ${p.l}`] = {
        isTied,
        place: isTied ? parseInt(p.p.substring(1)) : parseInt(p.p),
      };
    });
    return leaderboard;
  }
}
