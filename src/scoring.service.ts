import type { Leaderboard } from "./interfaces/leaderboard.interface";
import { Player } from "./interfaces/player.interface";
import type { Ranking } from "./interfaces/ranking.interface";

export default class ScoringService {
  static getStandings(
    teams: { name: string; players: string[] }[],
    leaderboard: Leaderboard,
    rankings: Record<string, Ranking>,
    cutLine: number,
  ) {
    const standings: { name: string; score: number; players: Player[] }[] = [];
    let lowestRankedPlayerInTop25 = 0;
    teams.forEach((team) => {
      let hasCutBonus = true;
      const players: Player[] = [];
      let score = team.players.reduce((acc, playerName, index) => {
        const rank = rankings[playerName];
        if (rank.rank > lowestRankedPlayerInTop25) {
          lowestRankedPlayerInTop25 = rank.rank;
        }
        const p = leaderboard[rank.firstName + " " + rank.lastName];
        if (!p) {
          console.error(`Player ${playerName} not found in leaderboard`);
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
          if (rank.rank > 10 && rank.rank <= 20) {
            playerTotal += 6;
          }
          // Bonus for player outside top 20
          if (rank.rank > 20) {
            playerTotal += 11;
          }
        }
        if (p.place <= 25) {
          playerTotal += 3;
        }
        if (p.place > cutLine) {
          hasCutBonus = false;
          // Made Cut Bonus
        } else if (rank.rank > 5) {
          playerTotal += 5;
        }
        players.push({
          firstName: rank.firstName,
          lastName: rank.lastName,
          rank: rank.rank,
          score: playerTotal * multiplier,
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
        players: players.sort((a, b) => b.score - a.score),
      });
    });
    standings.forEach((team) => {
      team.players.forEach((player) => {
        if (player.rank === lowestRankedPlayerInTop25) {
          player.score += 15;
          team.score += 15;
        }
      });
    });
    standings.sort((a, b) => b.score - a.score);
    return standings;
  }
}
