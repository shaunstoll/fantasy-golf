// Temporary end-to-end probe: run the real DataGolfClient against the live
// feed and report tee-time conversion results plus the runtime types of `t`.
// Executed from a CI runner (this sandbox has no egress). Delete after use.
import axios from "axios";

import DataGolfClient from "@/clients/data-golf.client";
import type { TournamentData } from "@/interfaces/tournament-data.interface";

async function main() {
  const raw = await axios.get<TournamentData>(
    "https://letzig.datagolf.com/live-model/get-main-data/mini",
  );
  const typeCounts = new Map<string, number>();
  for (const p of raw.data.pga.lb) {
    const key = `${typeof p.t}${typeof p.t === "string" && p.t.includes(":") ? " (tee)" : ""}`;
    typeCounts.set(key, (typeCounts.get(key) ?? 0) + 1);
  }
  console.log("runtime types of t:", Object.fromEntries(typeCounts));
  console.log("current_round:", raw.data.pga.info.current_round);
  console.log("times:", JSON.stringify(raw.data.pga.info.times));

  const tournament = await new DataGolfClient().getTournament();
  const entries = Object.entries(tournament.leaderboard);
  const withTee = entries.filter(([, e]) => e.teeTimeUtc);
  console.log(`players: ${entries.length}, with teeTimeUtc: ${withTee.length}`);
  for (const [name, e] of withTee.slice(0, 10)) {
    console.log(`${name}: thru=${e.thru} teeTimeUtc=${e.teeTimeUtc}`);
  }
  const teeStringsUnconverted = entries.filter(([, e]) => e.thru.includes(":") && !e.teeTimeUtc);
  console.log(`tee strings left unconverted: ${teeStringsUnconverted.length}`);
}

main().catch((error) => {
  console.error("PROBE FAILED:", error);
  process.exit(1);
});
