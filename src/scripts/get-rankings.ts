import DataGolfClient from "@/clients/data-golf.client";
import fs from "fs/promises";
import path from "path";

const filePath = path.join(process.cwd(), "data", "rankings.json");

async function main() {
  const client = new DataGolfClient();
  const rankings = await client.getRankings();
  await fs.writeFile(filePath, JSON.stringify(rankings, null, 2));
}

void main();
