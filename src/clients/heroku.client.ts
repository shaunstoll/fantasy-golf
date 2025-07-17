import axios from "axios";
import { load } from "cheerio";
export default class HerokuClient {
  async getTeams() {
    const response = await axios.get(
      "https://golf-competition-193e590fabff.herokuapp.com/",
    );
    const $ = load(response.data);
    const tbody = $("tbody");
    const rows = tbody.find("tr");
    const teams = rows
      .map((_, row) => {
        const cells = $(row).find("td");
        const values = cells.map((_, cell) => $(cell).text().trim()).get();
        return {
          name: values[1],
          players: Array.from({ length: 8 }, (_, i) => values[2 + i * 2]).map(
            (value) => value.split(" ")[0].toLowerCase(),
          ),
        };
      })
      .get();
    return teams;
  }
}
