import { describe, expect, it } from "vitest";

import { formatLocalTeeTime, isTeeTime, resolveTeeTimesUtc } from "@/utils/tee-time.utils";

// Captured live from the datagolf mini feed during the 2026 Open final round
// at Royal Birkdale (BST, UTC+1). Sam Burns's "2:20" string was independently
// confirmed as 2:20pm local / 9:20am ET, matching `l` exactly.
const openRound4 = { f: "2026-07-19T06:40:00Z", l: "2026-07-19T13:20:00Z" };
const openTees = ["2:20", "2:10", "2:00", "1:50", "1:40", "1:30", "1:15", "12:55", "12:45"];

describe("isTeeTime", () => {
  it("matches tee-time strings and rejects other thru values", () => {
    expect(isTeeTime("2:20")).toBe(true);
    expect(isTeeTime("12:45")).toBe(true);
    expect(isTeeTime("F")).toBe(false);
    expect(isTeeTime("-")).toBe(false);
    expect(isTeeTime("9")).toBe(false);
  });
});

describe("resolveTeeTimesUtc", () => {
  it("derives a UK venue (UTC+1) from the captured Open feed", () => {
    const resolved = resolveTeeTimesUtc(openTees, openRound4);
    expect(resolved.get("2:20")).toBe("2026-07-19T13:20:00.000Z");
    expect(resolved.get("12:45")).toBe("2026-07-19T11:45:00.000Z");
    expect(resolved.get("1:50")).toBe("2026-07-19T12:50:00.000Z");
    expect(resolved.size).toBe(openTees.length);
  });

  it("derives a US eastern venue (UTC-4) spanning the am/pm boundary", () => {
    const window = { f: "2026-06-18T11:45:00Z", l: "2026-06-18T18:30:00Z" };
    const resolved = resolveTeeTimesUtc(["7:45", "1:05", "2:30"], window);
    expect(resolved.get("7:45")).toBe("2026-06-18T11:45:00.000Z");
    expect(resolved.get("1:05")).toBe("2026-06-18T17:05:00.000Z");
    expect(resolved.get("2:30")).toBe("2026-06-18T18:30:00.000Z");
  });

  it("derives a US pacific venue (UTC-7)", () => {
    const window = { f: "2023-06-15T13:45:00Z", l: "2023-06-15T21:30:00Z" };
    const resolved = resolveTeeTimesUtc(["6:45", "10:10", "2:30"], window);
    expect(resolved.get("6:45")).toBe("2023-06-15T13:45:00.000Z");
    expect(resolved.get("10:10")).toBe("2023-06-15T17:10:00.000Z");
    expect(resolved.get("2:30")).toBe("2023-06-15T21:30:00.000Z");
  });

  it("resolves a lone remaining group late in the round", () => {
    const resolved = resolveTeeTimesUtc(["2:20"], openRound4);
    expect(resolved.get("2:20")).toBe("2026-07-19T13:20:00.000Z");
  });

  it("skips non-tee thru values instead of failing", () => {
    const resolved = resolveTeeTimesUtc(["F", "-", "9", "2:20"], openRound4);
    expect(resolved.size).toBe(1);
    expect(resolved.get("2:20")).toBe("2026-07-19T13:20:00.000Z");
  });

  it("returns nothing when no plausible offset aligns the strings", () => {
    // "5:33" anchors to no quarter-hour offset inside the window.
    expect(resolveTeeTimesUtc(["5:33"], openRound4).size).toBe(0);
  });

  it("returns nothing for a nonsensical tee window", () => {
    const inverted = { f: "2026-07-19T13:20:00Z", l: "2026-07-19T06:40:00Z" };
    expect(resolveTeeTimesUtc(openTees, inverted).size).toBe(0);
    const tooLong = { f: "2026-07-19T00:10:00Z", l: "2026-07-19T13:20:00Z" };
    expect(resolveTeeTimesUtc(openTees, tooLong).size).toBe(0);
    const invalid = { f: "not a date", l: "2026-07-19T13:20:00Z" };
    expect(resolveTeeTimesUtc(openTees, invalid).size).toBe(0);
  });
});

describe("formatLocalTeeTime", () => {
  it("renders the viewer's local time compactly for 12-hour locales", () => {
    expect(formatLocalTeeTime("2026-07-19T13:20:00.000Z", "en-US", "America/New_York")).toBe(
      "9:20a",
    );
    expect(formatLocalTeeTime("2026-07-19T13:20:00.000Z", "en-US", "America/Los_Angeles")).toBe(
      "6:20a",
    );
    expect(formatLocalTeeTime("2026-06-18T18:30:00.000Z", "en-US", "America/New_York")).toBe(
      "2:30p",
    );
  });

  it("passes 24-hour locales through untouched", () => {
    expect(formatLocalTeeTime("2026-07-19T13:20:00.000Z", "en-GB", "Europe/London")).toBe("14:20");
  });
});
