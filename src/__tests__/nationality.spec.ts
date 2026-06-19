import { describe, expect, it } from "vitest";

import { flagCode } from "@/utils/nationality.utils";

describe("flagCode", () => {
  it("maps ISO alpha-3 codes datagolf doesn't host to its IOC equivalents", () => {
    expect(flagCode("DNK")).toBe("DEN");
    expect(flagCode("DEU")).toBe("GER");
    expect(flagCode("CHL")).toBe("CHI");
    expect(flagCode("PHL")).toBe("PHI");
    expect(flagCode("ZAF")).toBe("RSA");
  });

  it("passes through codes datagolf already hosts", () => {
    expect(flagCode("USA")).toBe("USA");
    expect(flagCode("DEN")).toBe("DEN");
    expect(flagCode("NIR")).toBe("NIR");
  });
});
