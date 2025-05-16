import type { Leaderboard } from "../interfaces/leaderboard.interface";
import { Player } from "../interfaces/player.interface";
import { Team } from "../interfaces/team.interface";
import { Standing } from "../interfaces/standing.interface";
import { TournamentType } from "@/enums/tournament.enum";

export default class ScoringService {
  private static cutLine = {
    [TournamentType.Masters]: 50,
    [TournamentType.UsOpen]: 60,
    [TournamentType.Pga]: 70,
    [TournamentType.Open]: 70,
  };

  getStandings(
    teams: Team[],
    leaderboard: Leaderboard,
    tournament: TournamentType,
  ) {
    const standings: Standing[] = [];
    let lowestRankedPlayerInTop25 = 0;
    teams.forEach((team) => {
      let hasCutBonus = true;
      const players: Player[] = [];
      let score = team.players.reduce((acc, player, index) => {
        if (player.rank > lowestRankedPlayerInTop25) {
          lowestRankedPlayerInTop25 = player.rank;
        }
        const p = leaderboard[player.firstName + " " + player.lastName];
        if (!p) {
          console.error(
            `Player ${player.firstName} ${player.lastName} not found in leaderboard`,
          );
          return acc;
        }
        const multiplier = index === 0 ? 2 : index === 1 ? 1.5 : 1;
        let playerTotal = 0;
        if (p.place === 1) {
          playerTotal += 15;
        }
        if (p.place <= 10) {
          playerTotal += 11 - p.place;
        }
        if (p.place <= 15) {
          playerTotal += 4;
          // Bonus for player outside top 10
          if (player.rank > 10 && player.rank <= 20) {
            playerTotal += 6;
          }
          // Bonus for player outside top 20
          if (player.rank > 20) {
            playerTotal += 11;
          }
        }
        if (p.place <= 25) {
          playerTotal += 3;
        }
        if (p.place > ScoringService.cutLine[tournament]) {
          hasCutBonus = false;
          // Made Cut Bonus
        } else if (player.rank > 5) {
          playerTotal += 5;
        }
        players.push({
          firstName: player.firstName,
          lastName: player.lastName,
          rank: player.rank,
          fantasyScore: playerTotal * multiplier,
          place: p.place,
          isTied: p.isTied,
        });
        return acc + playerTotal * multiplier;
      }, 0);
      if (hasCutBonus) {
        score += 15;
      }
      standings.push({
        name: team.name,
        score,
        players: players.sort((a, b) => b.fantasyScore - a.fantasyScore),
        rank: 0,
        isTied: false,
      });
    });
    standings.forEach((team) => {
      team.players.forEach((player) => {
        if (player.rank === lowestRankedPlayerInTop25) {
          player.fantasyScore += 15;
          team.score += 15;
        }
      });
      team.players.sort((a, b) => a.place - b.place);
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
