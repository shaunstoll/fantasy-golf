import type { RoundTeeTimes } from "@/interfaces/tournament-data.interface";

/**
 * Datagolf's live feed reports unstarted players' tee times in the `t` (thru)
 * field as bare event-local wall-clock strings ("2:20", "12:45" — 12-hour, no
 * am/pm marker). The feed has no timezone or venue field, but `info.times`
 * carries each round's first (`f`) and last (`l`) tee times as true UTC
 * instants. Groups tee off in order, so while any group is still waiting the
 * latest tee-time string on the board belongs to the final group and equals
 * `l` in local wall-clock — anchoring on that recovers the venue's UTC offset
 * without hardcoding timezones per venue (the PGA and US Open move between
 * coasts year to year; DST is absorbed the same way).
 */

const TEE_TIME_RE = /^(\d{1,2}):(\d{2})$/;

// Plausible venue offsets: UTC-9 (Alaska) through UTC+2 (continental Europe).
// The span must stay under 12 hours so a candidate offset and its 12-hour
// alias (every am/pm interpretation flipped) can never both qualify.
const MIN_OFFSET_MINUTES = -9 * 60;
const MAX_OFFSET_MINUTES = 2 * 60;

/** True when a `t` (thru) value is a tee-time string rather than a hole count, "F" or "-". */
export function isTeeTime(t: string): boolean {
  return TEE_TIME_RE.test(t.trim());
}

/** Both wall-clock readings (minutes since local midnight) of an am/pm-less 12-hour string. */
function parseCandidates(t: string): [number, number] | undefined {
  const match = TEE_TIME_RE.exec(t.trim());
  if (!match) return undefined;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 1 || hour > 12 || minute > 59) return undefined;
  const am = (hour % 12) * 60 + minute;
  return [am, am + 720];
}

function wallMinutesUtc(d: Date): number {
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

/**
 * Find the unique venue offset (minutes ahead of UTC) under which every tee
 * string lands inside the round's [first, last] tee window, trying each
 * string's am/pm readings anchored against both window edges. Returns
 * undefined when no offset — or more than one — fits, so a wrong feed state
 * degrades to showing the raw string rather than a mislabeled time.
 */
function deriveOffset(
  parsed: [number, number][],
  fWall: number,
  lWall: number,
  windowLen: number,
): number | undefined {
  const candidateOffsets = new Set<number>();
  for (const candidates of parsed) {
    for (const candidate of candidates) {
      for (const anchor of [lWall, fWall]) {
        let offset = candidate - anchor;
        if (offset <= -720) offset += 1440;
        else if (offset > 720) offset -= 1440;
        // Every plausible major venue (US zones, UK) sits on a whole-hour
        // offset; anything else is a mid-window string coincidentally
        // anchored to an edge.
        if (offset % 60 === 0 && offset >= MIN_OFFSET_MINUTES && offset <= MAX_OFFSET_MINUTES) {
          candidateOffsets.add(offset);
        }
      }
    }
  }
  const valid = [...candidateOffsets].filter((offset) => {
    const lLocal = (((lWall + offset) % 1440) + 1440) % 1440;
    const fLocal = lLocal - windowLen;
    // A local window crossing midnight can't happen at a real major venue.
    if (fLocal < 0) return false;
    return parsed.every((candidates) => candidates.some((c) => c >= fLocal && c <= lLocal));
  });
  return valid.length === 1 ? valid[0] : undefined;
}

/**
 * Map raw tee-time strings to UTC ISO instants using the round's tee window.
 * Strings that aren't tee times are skipped; if the venue offset can't be
 * derived unambiguously the map comes back empty and callers fall through to
 * the raw string.
 */
export function resolveTeeTimesUtc(teeTimes: string[], window: RoundTeeTimes): Map<string, string> {
  const resolved = new Map<string, string>();
  const first = new Date(window.f);
  const last = new Date(window.l);
  const windowLen = (last.getTime() - first.getTime()) / 60_000;
  // A single round's tee sheet never spans 12+ hours; a window that does means
  // the feed is in a state we don't understand.
  if (!Number.isFinite(windowLen) || windowLen < 0 || windowLen >= 720) {
    return resolved;
  }
  const parsed = new Map<string, [number, number]>();
  for (const t of teeTimes) {
    const candidates = parseCandidates(t);
    if (candidates) parsed.set(t, candidates);
  }
  if (parsed.size === 0) return resolved;

  const fWall = wallMinutesUtc(first);
  const lWall = wallMinutesUtc(last);
  const offset = deriveOffset([...parsed.values()], fWall, lWall, windowLen);
  if (offset === undefined) return resolved;

  const lLocal = (((lWall + offset) % 1440) + 1440) % 1440;
  const fLocal = lLocal - windowLen;
  if (fLocal < 0) return resolved;
  for (const [raw, candidates] of parsed) {
    const wall = candidates.find((c) => c >= fLocal && c <= lLocal);
    if (wall !== undefined) {
      resolved.set(raw, new Date(last.getTime() + (wall - lLocal) * 60_000).toISOString());
    }
  }
  return resolved;
}

/**
 * Render a UTC tee instant in the viewer's timezone, compacted to fit the
 * narrow Thru box ("9:20 AM" → "9:20a"; 24-hour locales pass through as-is).
 * Locale/timezone parameters exist for tests; components omit them so the
 * browser's own settings apply.
 */
export function formatLocalTeeTime(iso: string, locale?: string, timeZone?: string): string {
  const formatted = new Date(iso).toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  });
  return formatted.replace(/\s?([AP])\.?M\.?$/i, (_, ap: string) => ap.toLowerCase());
}
