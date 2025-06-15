import axios from "axios";
import type { MastersData } from "@/interfaces/masters.interface";

export default class MastersClient {
  async getLeaderboard() {
    const response = await axios.get<MastersData>(
      "https://www.masters.com/en_US/scores/feeds/2025/scores.json",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          Accept: "application/json",
          Referer: "https://www.masters.com/",
        },
      },
    );
    return response.data.data.player.reduce(
      (acc, player) => {
        const pos = player.pos;
        if (pos.toLowerCase().startsWith("t")) {
          acc[player.full_name] = {
            isTied: true,
            place: parseInt(pos.substring(1)),
          };
        } else {
          acc[player.full_name.normalize("NFD")] = {
            isTied: false,
            place: parseInt(pos),
          };
        }
        return acc;
      },
      {} as Record<string, { isTied: boolean; place: number }>,
    );
  }
}
