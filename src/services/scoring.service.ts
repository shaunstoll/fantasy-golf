import { getTournamentConfig } from "@/config/tournaments";
import type { LeaderboardPlayer } from "@/interfaces/leaderboard-player.interface";
import type { Player } from "@/interfaces/player.interface";
import type { Ranking } from "@/interfaces/ranking.interface";
import type { Standing } from "@/interfaces/standing.interface";
import type { Team } from "@/interfaces/team.interface";
import type { Tournament } from "@/interfaces/tournament.interface";

export default class ScoringService {
  getStandings(teams: Team[], tournament: Tournament) {
    const standings: Standing[] = [];
    let lowestRankedPlayerInTop25 = 0;
    const totalTeams = teams.length;
    const ownershipCounts = new Map<string, number>();
    for (const team of teams) {
      for (const player of team.players) {
        const key = `${player.firstName} ${player.lastName}`;
        ownershipCounts.set(key, (ownershipCounts.get(key) ?? 0) + 1);
      }
    }
    for (const team of teams) {
      let allPlayersMadeCutBonus = true;
      let hasFirstPlaceBonus = false;
      const players: Player[] = [];
      let score = 0;
      for (const [index, player] of team.players.entries()) {
        const p = tournament.leaderboard[`${player.firstName} ${player.lastName}`];
        if (!p) {
          console.error(`Player ${player.firstName} ${player.lastName} not found in leaderboard`);
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
          if (tournament.round < 3 && p.place > getTournamentConfig(tournament.name).cutLine) {
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
          ownedCount: ownershipCounts.get(`${player.firstName} ${player.lastName}`) ?? 0,
          ownedTotal: totalTeams,
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
        (index < standings.length - 1 && standings[index + 1].score === standing.score);
    }
    return standings;
  }

  getLeaderboard(
    teams: Team[],
    tournament: Tournament,
    rankings: Record<string, Ranking>,
  ): LeaderboardPlayer[] {
    const ownershipCounts = new Map<string, number>();
    for (const team of teams) {
      for (const player of team.players) {
        const key = `${player.firstName} ${player.lastName}`;
        ownershipCounts.set(key, (ownershipCounts.get(key) ?? 0) + 1);
      }
    }

    let lowestRankedInTop25 = 0;
    for (const [name, entry] of Object.entries(tournament.leaderboard)) {
      const rank = rankings[name]?.rank;
      if (rank && entry.place && entry.place <= 25 && rank > lowestRankedInTop25) {
        lowestRankedInTop25 = rank;
      }
    }

    const totalTeams = teams.length;
    const leaderboard: LeaderboardPlayer[] = [];

    for (const [name, p] of Object.entries(tournament.leaderboard)) {
      const rank = rankings[name]?.rank ?? 0;

      let placementPoints = 0;
      let rankingBonus = 0;
      let madeCutBonusPoints = 0;
      let firstPlaceBonusPoints = 0;

      if (p.place) {
        if (p.place === 1 && !p.isTied) {
          firstPlaceBonusPoints = 15;
        }
        if (p.place <= 10) {
          placementPoints += 11 - p.place;
        }
        if (p.place <= 15) {
          placementPoints += 4;
        }
        if (p.place <= 25) {
          placementPoints += 3;
          if (rank > 10 && rank <= 20) {
            rankingBonus = 6;
          }
          if (rank > 20) {
            rankingBonus = 11;
          }
        }
        const outsideCutLine =
          tournament.round < 3 && p.place > getTournamentConfig(tournament.name).cutLine;
        if (!outsideCutLine && rank > 5) {
          madeCutBonusPoints = 5;
        }
      }

      const lowestRankedBonusPoints = rank === lowestRankedInTop25 ? 15 : 0;
      const [firstName, ...lastParts] = name.split(" ");
      const lastName = lastParts.join(" ");

      leaderboard.push({
        firstName,
        lastName,
        rank,
        place: p.place,
        nationality: p.nationality,
        status: p.status,
        score: p.score,
        thru: p.thru,
        isTied: p.isTied,
        placementPoints,
        rankingBonus,
        madeCutBonusPoints,
        firstPlaceBonusPoints,
        lowestRankedBonusPoints,
        fantasyScore:
          placementPoints +
          rankingBonus +
          madeCutBonusPoints +
          firstPlaceBonusPoints +
          lowestRankedBonusPoints,
        ownedCount: ownershipCounts.get(name) ?? 0,
        ownedTotal: totalTeams,
      });
    }

    leaderboard.sort((a, b) => {
      const placeA = a.place ?? Infinity;
      const placeB = b.place ?? Infinity;
      if (placeA !== placeB) return placeA - placeB;
      return b.fantasyScore - a.fantasyScore;
    });

    return leaderboard;
  }
}
