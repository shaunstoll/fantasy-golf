import fs from "node:fs/promises";
import path from "node:path";

import { getRankings } from "@/db/rankings";
import { PlayerStatus } from "@/enums/player-status.enum";
import { TournamentName } from "@/enums/tournament.enum";
import type { Team } from "@/interfaces/team.interface";
import type { Tournament } from "@/interfaces/tournament.interface";
import ScoringService from "@/services/scoring.service";
import pga from "@data/2026/pga.json";

/**
 * Reconstructs the final 2026 PGA Championship results from the archived
 * Wikipedia leaderboard and freezes them to data/2026/pga-results.json.
 *
 * The live datagolf endpoint that `save-results.ts` uses has long since rolled
 * over to the current event, so we cannot regenerate PGA from the API. Wikipedia
 * is a stable record of a completed major, so we parse its final leaderboard
 * table and run it through the same ScoringService the live app uses.
 */

const WIKI_API =
  "https://en.wikipedia.org/w/api.php?action=parse&page=2026_PGA_Championship&prop=wikitext&format=json";

// Wikipedia display names -> exact roster names (player matching is by exact string).
const NAME_ALIASES: Record<string, string> = {
  "Kim Si-woo": "Si Woo Kim",
  "Im Sung-jae": "Sungjae Im",
  "Ludvig Åberg": "Ludvig Aberg",
  "Nicolai Højgaard": "Nicolai Hojgaard",
  "J. J. Spaun": "J.J. Spaun",
};

interface ParsedPlayer {
  name: string;
  nationality: string;
  place?: number;
  isTied: boolean;
  score: number;
  status: PlayerStatus;
  thru: string;
}

function parseToPar(value: string): number {
  if (value === "E") return 0;
  // Wikipedia uses a unicode minus sign (U+2212) for under-par scores.
  return Number.parseInt(value.replace("−", "-"), 10);
}

function extractName(playerCell: string): { name: string; nationality: string } {
  const nationality = /\{\{flagicon\|([A-Za-z]{2,3})/.exec(playerCell)?.[1] ?? "";
  const link = /\[\[([^\]]+)\]\]/.exec(playerCell)?.[1] ?? "";
  // [[Target (golfer)|Display]] -> Display; [[Name]] -> Name
  const display = link.includes("|") ? link.slice(link.indexOf("|") + 1) : link;
  const name = display
    .replace(/'''/g, "")
    .replace(/\s*\(c\)\s*$/, "")
    .trim();
  return { name: NAME_ALIASES[name] ?? name, nationality };
}

function parseLeaderboard(wikitext: string): ParsedPlayer[] {
  const start = wikitext.indexOf("====Final leaderboard====");
  const end = wikitext.indexOf("Source:", start);
  const region = wikitext.slice(start, end);

  const players: ParsedPlayer[] = [];
  let currentPlace: string | undefined;
  let currentToPar = 0;

  for (const raw of region.split("\n")) {
    const line = raw.trim();
    if (!line.startsWith("|") || !line.includes("flagicon")) continue;

    const cells = line.split("||").map((c) => c.trim());
    let playerCell: string | undefined;

    for (const cell of cells) {
      const placeMatch = /\|(T?\d+|CUT)$/.exec(cell);
      const toParMatch = /\|(−\d+|\+\d+|E)$/.exec(cell);
      if (cell.includes("flagicon")) {
        playerCell = cell;
      } else if (placeMatch) {
        currentPlace = placeMatch[1];
      } else if (toParMatch) {
        currentToPar = parseToPar(toParMatch[1]);
      }
    }

    if (!playerCell || !currentPlace) continue;
    const { name, nationality } = extractName(playerCell);
    const missedCut = currentPlace === "CUT";

    players.push({
      name,
      nationality,
      place: missedCut ? undefined : Number.parseInt(currentPlace.replace("T", ""), 10),
      isTied: !missedCut && currentPlace.startsWith("T"),
      score: currentToPar,
      status: missedCut ? PlayerStatus.MISSED_CUT : PlayerStatus.PLAYING,
      thru: missedCut ? "-" : "F",
    });
  }

  return players;
}

async function main() {
  const response = await fetch(WIKI_API);
  const json = (await response.json()) as { parse: { wikitext: { "*": string } } };
  const parsed = parseLeaderboard(json.parse.wikitext["*"]);
  console.info(`Parsed ${parsed.length} players from the final leaderboard`);

  const tournament: Tournament = {
    name: TournamentName.Pga,
    round: 4,
    leaderboard: {},
  };
  for (const p of parsed) {
    tournament.leaderboard[p.name] = {
      nationality: p.nationality,
      score: p.score,
      thru: p.thru,
      isTied: p.isTied,
      place: p.place,
      status: p.status,
    };
  }

  const teams = pga as Team[];
  const scoringService = new ScoringService();
  const standings = scoringService.getStandings(teams, tournament);
  const leaderboard = scoringService.getLeaderboard(
    teams,
    tournament,
    getRankings(TournamentName.Masters),
  );

  const dir = path.join(process.cwd(), "data", "2026");
  const filePath = path.join(dir, "pga-results.json");
  await fs.writeFile(filePath, JSON.stringify({ standings, leaderboard }, undefined, 2));
  console.info(
    `Wrote ${standings.length} standings and ${leaderboard.length} leaderboard entries to ${filePath}`,
  );
}

main();
