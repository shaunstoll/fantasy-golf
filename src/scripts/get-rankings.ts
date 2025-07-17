import fs from "node:fs/promises";
import path from "node:path";

import DataGolfClient from "@/clients/data-golf.client";

const filePath = path.join(process.cwd(), "data", "rankings.json");

const client = new DataGolfClient();
const rankings = await client.getRankings();
await fs.writeFile(filePath, JSON.stringify(rankings, undefined, 2));
