import { Player } from "../interfaces/player.interface";
import { Team } from "../interfaces/team.interface";
import { Standing } from "../interfaces/standing.interface";
import { TournamentName } from "@/enums/tournament.enum";
import { Tournament } from "@/interfaces/tournament.interface";

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
    teams.forEach((team) => {
      let allPlayersMadeCutBonus = true;
      let hasFirstPlaceBonus = false;
      const players: Player[] = [];
      let score = team.players.reduce((acc, player, index) => {
        const p =
          tournament.leaderboard[player.firstName + " " + player.lastName];
        if (!p) {
          console.error(
            `Player ${player.firstName} ${player.lastName} not found in leaderboard`,
          );
          return acc;
        }
        const multiplier = index === 0 ? 2 : index === 1 ? 1.5 : 1;
        let playerTotal = 0;
        let insideCutLineOrMadCutBonus = false;
        let firstPlaceBonus = false;

        if (!p.place) {
          allPlayersMadeCutBonus = false;
        } else {
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
          firstPlaceBonus: firstPlaceBonus,
          multiplier: multiplier,
        });
        return acc + playerTotal * multiplier;
      }, 0);
      if (allPlayersMadeCutBonus) {
        score += 15;
      }
      standings.push({
        name: team.name,
        score,
        players: players.sort((a, b) => b.fantasyScore - a.fantasyScore),
        rank: 0,
        isTied: false,
        lowestRankedPlayerBonus: false,
        madeCutBonus: allPlayersMadeCutBonus,
        firstPlaceBonus: hasFirstPlaceBonus,
      });
    });
    standings.forEach((team) => {
      team.players.forEach((player) => {
        if (player.rank === lowestRankedPlayerInTop25) {
          player.fantasyScore += 15;
          team.score += 15;
          player.lowestRankedPlayerBonus = true;
          team.lowestRankedPlayerBonus = true;
        }
      });
      team.players.sort(
        (a, b) => (a.place ?? Infinity) - (b.place ?? Infinity),
      );
    });
    standings.sort((a, b) => b.score - a.score);
    let currentRank = 1;
    let currentScore = standings[0]?.score;
    standings.forEach((standing, index) => {
      if (standing.score !== currentScore) {
        currentRank = index + 1;
        currentScore = standing.score;
      }
      standing.rank = currentRank;
      standing.isTied =
        (index > 0 && standings[index - 1].score === standing.score) ||
        (index < standings.length - 1 &&
          standings[index + 1].score === standing.score);
    });
    return standings;
  }
}
