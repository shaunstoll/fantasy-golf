import fs from "node:fs/promises";
import path from "node:path";

import DataGolfClient from "@/clients/data-golf.client";

async function main() {
  const tournament = process.argv[2];
  if (!tournament) {
    throw new Error(
      "Tournament argument required. Usage: npx tsx src/scripts/get-rankings.ts <tournament>",
    );
  }

  const year = new Date().getFullYear();
  const dir = path.join(process.cwd(), "data", year.toString());
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${tournament}-rankings.json`);

  const client = new DataGolfClient();
  const rankings = await client.getRankings();
  await fs.writeFile(filePath, JSON.stringify(rankings, undefined, 2));
  console.info(`Wrote ${Object.keys(rankings).length} player rankings to ${filePath}`);
}

main();
