import { TournamentName } from "@/enums/tournament.enum";

function getTournamentByMonth(): TournamentName {
  const month = new Date().getMonth();
  switch (month) {
    case 3:
      return TournamentName.Masters;
    case 4:
      return TournamentName.Pga;
    case 5:
      return TournamentName.UsOpen;
    case 6:
      return TournamentName.Open;
    default:
      return TournamentName.Open;
  }
}

export const currentTournament = getTournamentByMonth();
