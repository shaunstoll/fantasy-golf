import { describe, expect, it } from "vitest";

import masters from "@data/2026/masters.json";
import mastersResults from "@data/2026/masters-results.json";
import pga from "@data/2026/pga.json";

const rosterFiles = {
  masters,
  pga,
} as const;

describe("Tournament roster data integrity", () => {
  for (const [name, roster] of Object.entries(rosterFiles)) {
    describe(name, () => {
      it("every team has exactly 8 players", () => {
        const wrongSize = roster
          .filter((t) => t.players.length !== 8)
          .map((t) => `${t.name} (${t.players.length} players)`);
        expect(wrongSize).toEqual([]);
      });

      it("every player has firstName, lastName, and a numeric rank", () => {
        const broken: string[] = [];
        for (const team of roster) {
          for (const p of team.players) {
            if (!p || typeof p.firstName !== "string" || typeof p.lastName !== "string") {
              broken.push(`${team.name}: malformed player object`);
            } else if (typeof p.rank !== "number") {
              broken.push(`${team.name}: ${p.firstName} ${p.lastName} has no rank`);
            }
          }
        }
        expect(broken).toEqual([]);
      });

      it("team names are unique within the file", () => {
        const counts = new Map<string, number>();
        for (const team of roster) {
          counts.set(team.name, (counts.get(team.name) ?? 0) + 1);
        }
        const dupes = [...counts.entries()].filter(([_, c]) => c > 1).map(([n]) => n);
        expect(dupes).toEqual([]);
      });
    });
  }

  it("masters and pga have identical team-name sets", () => {
    const mastersNames = new Set(masters.map((t) => t.name));
    const pgaNames = new Set(pga.map((t) => t.name));
    const inMastersOnly = [...mastersNames].filter((n) => !pgaNames.has(n));
    const inPgaOnly = [...pgaNames].filter((n) => !mastersNames.has(n));
    expect({ inMastersOnly, inPgaOnly }).toEqual({ inMastersOnly: [], inPgaOnly: [] });
  });

  it("masters-results.json standings match masters.json team names", () => {
    const rosterNames = new Set(masters.map((t) => t.name));
    const standingsNames = new Set(mastersResults.standings.map((s) => s.name));
    const inRosterOnly = [...rosterNames].filter((n) => !standingsNames.has(n));
    const inStandingsOnly = [...standingsNames].filter((n) => !rosterNames.has(n));
    expect({ inRosterOnly, inStandingsOnly }).toEqual({
      inRosterOnly: [],
      inStandingsOnly: [],
    });
  });
});
