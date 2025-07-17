import { TournamentName } from "@/enums/tournament.enum";
import type { Player } from "@/interfaces/player.interface";
import type { Standing } from "@/interfaces/standing.interface";
import type { Team } from "@/interfaces/team.interface";
import type { Tournament } from "@/interfaces/tournament.interface";

export default class ScoringService {
  private static cutLine = {
    [TournamentName.Masters]: 50,
    [TournamentName.UsOpen]: 60,
    [TournamentName.Pga]: 70,
    [TournamentName.Open]: 70,
  };

  getStandings(teams: Team[], tournament: Tournament) {
    const standings: Standing[] = [];
    let lowestRankedPlayerInTop25 = 0;
    for (const team of teams) {
      let allPlayersMadeCutBonus = true;
      let hasFirstPlaceBonus = false;
      const players: Player[] = [];
      let score = 0;
      for (const [index, player] of team.players.entries()) {
        const p =
          tournament.leaderboard[`${player.firstName} ${player.lastName}`];
        if (!p) {
          console.error(
            `Player ${player.firstName} ${player.lastName} not found in leaderboard`,
          );
          continue;
        }
        const multiplier = index === 0 ? 2 : index === 1 ? 1.5 : 1;
        let playerTotal = 0;
        let insideCutLineOrMadCutBonus = false;
        let firstPlaceBonus = false;

        if (p.place) {
          if (p.place === 1 && !p.isTied) {
            playerTotal += 15;
            firstPlaceBonus = true;
            hasFirstPlaceBonus = true;
          }
          if (p.place <= 10) {
            playerTotal += 11 - p.place;
          }
          if (p.place <= 15) {
            playerTotal += 4;
          }
          if (p.place <= 25) {
            playerTotal += 3;
            if (player.rank > 10 && player.rank <= 20) {
              playerTotal += 6;
            }
            if (player.rank > 20) {
              playerTotal += 11;
            }
            if (player.rank > lowestRankedPlayerInTop25) {
              lowestRankedPlayerInTop25 = player.rank;
            }
          }
          if (
            tournament.round < 3 &&
            p.place > ScoringService.cutLine[tournament.name]
          ) {
            allPlayersMadeCutBonus = false;
          } else if (player.rank > 5) {
            playerTotal += 5;
            insideCutLineOrMadCutBonus = true;
          }
        } else {
          allPlayersMadeCutBonus = false;
        }
        players.push({
          firstName: player.firstName,
          lastName: player.lastName,
          rank: player.rank,
          fantasyScore: playerTotal * multiplier,
          place: p.place,
          isTied: p.isTied,
          nationality: p.nationality,
          status: p.status,
          score: p.score,
          thru: p.thru,
          lowestRankedPlayerBonus: false,
          madeCutBonus: insideCutLineOrMadCutBonus,
          firstPlaceBonus,
          multiplier,
        });
        score += playerTotal * multiplier;
      }
      if (allPlayersMadeCutBonus) {
        score += 15;
      }
      standings.push({
        name: team.name,
        score,
        players,
        rank: 0,
        isTied: false,
        lowestRankedPlayerBonus: false,
        madeCutBonus: allPlayersMadeCutBonus,
        firstPlaceBonus: hasFirstPlaceBonus,
      });
    }
    for (const team of standings) {
      for (const player of team.players) {
        if (player.rank === lowestRankedPlayerInTop25) {
          player.fantasyScore += 15;
          team.score += 15;
          player.lowestRankedPlayerBonus = true;
          team.lowestRankedPlayerBonus = true;
        }
      }
      team.players.sort((a, b) => {
        const placeA = a.place ?? Infinity;
        const placeB = b.place ?? Infinity;
        if (placeA === placeB) {
          return b.fantasyScore - a.fantasyScore;
        }
        return placeA - placeB;
      });
    }
    standings.sort((a, b) => b.score - a.score);
    let currentRank = 1;
    let currentScore = standings[0]?.score;
    for (const [index, standing] of standings.entries()) {
      if (standing.score !== currentScore) {
        currentRank = index + 1;
        currentScore = standing.score;
      }
      standing.rank = currentRank;
      standing.isTied =
        (index > 0 && standings[index - 1].score === standing.score) ||
        (index < standings.length - 1 &&
          standings[index + 1].score === standing.score);
    }
    return standings;
  }
}
