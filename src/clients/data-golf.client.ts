import axios from "axios";

import { PlayerStatus } from "@/enums/player-status.enum";
import { currentTournament } from "@/env";
import type { Ranking } from "@/interfaces/ranking.interface";
import type { TournamentData } from "@/interfaces/tournament-data.interface";
import type { Tournament } from "@/interfaces/tournament.interface";
import { overrides } from "@/overrides";

export default class DataGolfClient {
  private cache: {
    tournament?: Tournament;
    timestamp: number;
  };

  constructor() {
    this.cache = {
      tournament: undefined,
      timestamp: 0,
    };
  }

  async getRankings(): Promise<Record<string, Ranking>> {
    const response = await axios.get("https://datagolf.com/datagolf-rankings");
    const html = response.data;
    const pullDataIndex = html.indexOf("function pull_data()");
    const substring1 = html.slice(Math.max(0, pullDataIndex));
    const startIndex = substring1.indexOf("JSON.parse('") + "JSON.parse('".length;
    const endIndex = substring1.indexOf(";") - 2;
    const jsonString = substring1.slice(startIndex, endIndex);
    const rankings: Record<string, Ranking> = {};
    for (const p of JSON.parse(jsonString).data.table_data.data) {
      const key = `${p.first} ${p.last}`;
      if (rankings[key]) {
        console.error(`Duplicate player name found: ${key}`);
      } else {
        rankings[key] = {
          firstName: p.first,
          lastName: p.last,
          rank: p.dg_rank,
        };
      }
    }
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
      name: currentTournament,
      round: Number.parseInt(tournamentData.info.current_round),
      leaderboard: {},
    };
    for (const player of tournamentData.lb) {
      const isCut = player.p === "CUT";
      const withdrawn = player.p === "WD";
      const isTied = player.p.startsWith("T");
      const didNotStart = player.p === "-";
      const isEvenPar = player.s === "E";
      tournament.leaderboard[`${player.f} ${player.l}`] = {
        nationality: player.n,
        score: isEvenPar ? 0 : Number.parseInt(player.s),
        thru: player.t.toString(),
        isTied,
        place: overrides.get(`${player.f} ${player.l}`)?.madeCut
          ? Infinity
          : isCut || withdrawn || didNotStart
            ? undefined
            : Number.parseInt(player.p.replace("T", "")),
        status: isCut
          ? PlayerStatus.MISSED_CUT
          : withdrawn
            ? PlayerStatus.WITHDRAWN
            : didNotStart
              ? PlayerStatus.DID_NOT_START
              : PlayerStatus.PLAYING,
      };
    }
    this.cache = {
      tournament,
      timestamp: Date.now(),
    };
    return tournament;
  }
}
