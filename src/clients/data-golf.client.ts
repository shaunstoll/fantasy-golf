import axios from "axios";
import type { TournamentData } from "@/interfaces/tournament-data.interface";
import type { Ranking } from "@/interfaces/ranking.interface";
import { PlayerStatus } from "@/enums/player-status.enum";
import { Tournament } from "@/interfaces/tournament.interface";
import { env } from "@/env";
import { TournamentName } from "@/enums/tournament.enum";
import { overrides } from "@/overrides";

export default class DataGolfClient {
  private cache: {
    tournament: Tournament | null;
    timestamp: number;
  };

  constructor() {
    this.cache = {
      tournament: null,
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

  async getTournament(): Promise<Tournament> {
    if (this.cache.timestamp > Date.now() - 5000) {
      if (!this.cache.tournament) {
        throw new Error("Expected tournament to be cached.");
      }
      return this.cache.tournament;
    }
    const response = await axios.get<TournamentData>(
      "https://letzig.datagolf.com/live-model/get-main-data/mini",
    );
    const tournamentData = response.data.pga;
    const tournament: Tournament = {
      name: env.NEXT_PUBLIC_TOURNAMENT as TournamentName,
      round: parseInt(tournamentData.info.current_round),
      leaderboard: {},
    };
    tournamentData.lb.forEach((player) => {
      const isCut = player.p === "CUT";
      const withdrawn = player.p === "WD";
      const isTied = player.p.startsWith("T");
      const didNotStart = player.p === "-";
      const isEvenPar = player.s === "E";
      tournament.leaderboard[`${player.f} ${player.l}`] = {
        nationality: player.n,
        score: isEvenPar ? 0 : parseInt(player.s),
        thru: player.t.toString(),
        isTied,
        place: overrides.get(`${player.f} ${player.l}`)?.madeCut
          ? Infinity
          : isCut || withdrawn || didNotStart
            ? null
            : parseInt(player.p.replace("T", "")),
        status: isCut
          ? PlayerStatus.MISSED_CUT
          : withdrawn
            ? PlayerStatus.WITHDRAWN
            : didNotStart
              ? PlayerStatus.DID_NOT_START
              : PlayerStatus.PLAYING,
      };
    });
    this.cache = {
      tournament,
      timestamp: Date.now(),
    };
    return tournament;
  }
}
