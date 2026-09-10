import fs from "node:fs/promises";
import path from "node:path";

import { getRankings } from "@/db/rankings";
import { PlayerStatus } from "@/enums/player-status.enum";
import { TournamentName } from "@/enums/tournament.enum";
import type { Team } from "@/interfaces/team.interface";
import type { Tournament } from "@/interfaces/tournament.interface";
import ScoringService from "@/services/scoring.service";
import open from "@data/2026/open.json";

/**
 * Reconstructs the final 2026 Open Championship results from the archived
 * Wikipedia leaderboard and freezes them to data/2026/open-results.json.
 *
 * The live datagolf endpoint that `save-results.ts` reads no longer serves any
 * PGA event, so the Open cannot be regenerated from the API. Wikipedia is a
 * stable record of a completed major, so we parse its final leaderboard table
 * and run it through the same ScoringService the live app uses.
 *
 * This parser differs from build-pga-results.ts in one important way: it only
 * looks for the place in cells that precede the player cell. The Open's cut
 * block carries a prize-money cell of `0`, which the PGA parser's place regex
 * would have matched, stamping all 77 missed-cut players with place 0 and
 * sorting them above the champion. Place is always the first column and money
 * the last, so anchoring on the player cell removes the ambiguity.
 */

const WIKI_API =
  "https://en.wikipedia.org/w/api.php?action=parse&page=2026_Open_Championship&prop=wikitext&format=json";

// Wikipedia display names -> exact roster names (player matching is by exact string).
const NAME_ALIASES: Record<string, string> = {
  "Kim Si-woo": "Si Woo Kim",
  "Im Sung-jae": "Sungjae Im",
  "Ludvig Åberg": "Ludvig Aberg",
  "Nicolai Højgaard": "Nicolai Hojgaard",
  "Rasmus Højgaard": "Rasmus Hojgaard",
  "J. J. Spaun": "J.J. Spaun",
  "J. T. Poston": "J.T. Poston",
  "Nico Echavarría": "Nico Echavarria",
  "Joaquín Niemann": "Joaquin Niemann",
  "Alex Norén": "Alex Noren",
  "Sami Välimäki": "Sami Valimaki",
  "Ángel Ayora": "Angel Ayora",
  "Frédéric Lacroix": "Frederic Lacroix",
  "Pádraig Harrington": "Padraig Harrington",
  "Bård Skogen": "Bard Skogen",
  "Li Haotong": "Haotong Li",
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
    .replace(/\s*\((a|c)\)\s*$/, "")
    .trim();
  return { name: NAME_ALIASES[name] ?? name, nationality };
}

function parseLeaderboard(wikitext: string): ParsedPlayer[] {
  const start = wikitext.indexOf("====Final leaderboard====");
  // Stop at the hole-by-hole scorecard, not at "Source:" — the scorecard sits
  // between them and its rows are flagicon-prefixed too, so they would parse as
  // phantom (nameless) leaderboard entries.
  const scorecard = wikitext.indexOf("====Scorecard====", start);
  const end = scorecard === -1 ? wikitext.indexOf("Source:", start) : scorecard;
  const region = wikitext.slice(start, end);

  const players: ParsedPlayer[] = [];
  let currentPlace: string | undefined;
  let currentToPar = 0;

  for (const raw of region.split("\n")) {
    const line = raw.trim();
    if (!line.startsWith("|") || !line.includes("flagicon")) continue;

    const cells = line.split("||").map((c) => c.trim());
    const playerIndex = cells.findIndex((cell) => cell.includes("flagicon"));
    if (playerIndex === -1) continue;

    // Place lives in the leading cell(s); a rowspan continuation row has none
    // and inherits the place above it. Never scan past the player, or the
    // trailing prize-money cell can masquerade as a place.
    for (const cell of cells.slice(0, playerIndex)) {
      const placeMatch = /\|(T?\d+|CUT)$/.exec(cell);
      if (placeMatch) currentPlace = placeMatch[1];
      else if (cell.includes("{{tooltip|WD")) currentPlace = "WD";
    }
    // To par follows the player's round scores; money never matches this shape.
    for (const cell of cells.slice(playerIndex + 1)) {
      const toParMatch = /\|(−\d+|\+\d+|E)$/.exec(cell);
      if (toParMatch) currentToPar = parseToPar(toParMatch[1]);
    }

    if (!currentPlace) continue;
    const { name, nationality } = extractName(cells[playerIndex]);
    if (!name) continue;
    const missedCut = currentPlace === "CUT";
    const withdrew = currentPlace === "WD";
    const finished = !missedCut && !withdrew;

    players.push({
      name,
      nationality,
      place: finished ? Number.parseInt(currentPlace.replace("T", ""), 10) : undefined,
      isTied: finished && currentPlace.startsWith("T"),
      score: currentToPar,
      status: withdrew
        ? PlayerStatus.WITHDRAWN
        : missedCut
          ? PlayerStatus.MISSED_CUT
          : PlayerStatus.PLAYING,
      thru: finished ? "F" : "-",
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
    name: TournamentName.Open,
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

  const teams = open as Team[];

  // Name-trap guard: an unmatched rostered player silently scores zero, which
  // still produces plausible-looking standings. Fail loudly instead.
  const fieldNames = new Set(Object.keys(tournament.leaderboard));
  const unmatched: string[] = [];
  for (const team of teams) {
    for (const player of team.players) {
      const name = `${player.firstName} ${player.lastName}`;
      if (!fieldNames.has(name)) unmatched.push(`${name} (${team.name})`);
    }
  }
  if (unmatched.length > 0) {
    throw new Error(`Rostered players not found in the field:\n  ${unmatched.join("\n  ")}`);
  }

  const scoringService = new ScoringService();
  const standings = scoringService.getStandings(teams, tournament);
  const leaderboard = scoringService.getLeaderboard(
    teams,
    tournament,
    getRankings(TournamentName.Open),
  );

  const dir = path.join(process.cwd(), "data", "2026");
  const filePath = path.join(dir, "open-results.json");
  await fs.writeFile(filePath, JSON.stringify({ standings, leaderboard }, undefined, 2) + "\n");
  console.info(
    `Wrote ${standings.length} standings and ${leaderboard.length} leaderboard entries to ${filePath}`,
  );
}

main();
