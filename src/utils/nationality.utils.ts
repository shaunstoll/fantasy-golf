// Datagolf serves flag images under IOC-style country codes
// (https://datagolf.com/static/flags/<code>.png). Player nationality data
// reaches us from several sources (live datagolf API, scraped Wikipedia
// leaderboards, frozen JSON), so some codes arrive as ISO 3166-1 alpha-3
// instead. Map the known collisions to the code datagolf actually hosts;
// anything not listed passes through unchanged.
const FLAG_CODE_OVERRIDES: Record<string, string> = {
  DNK: "DEN", // Denmark
  DEU: "GER", // Germany
  CHL: "CHI", // Chile
  PHL: "PHI", // Philippines
  ZAF: "RSA", // South Africa
};

export function flagCode(nationality: string): string {
  return FLAG_CODE_OVERRIDES[nationality] ?? nationality;
}
