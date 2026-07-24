import { describe, expect, test } from "vitest";
import { relativeTime } from "./relativeTime";

const NOW = Date.UTC(2026, 6, 24, 12, 0, 0);
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function ago(amount: number): string {
  return relativeTime(NOW - amount, NOW);
}

describe("relativeTime", () => {
  test("calls the last minute just now", () => {
    expect(ago(0)).toBe("just now");
    expect(ago(59 * SECOND)).toBe("just now");
  });

  test("counts whole minutes, without rounding up a partial one", () => {
    expect(ago(60 * SECOND)).toBe("1 min ago");
    expect(ago(90 * SECOND)).toBe("1 min ago");
    expect(ago(59 * MINUTE)).toBe("59 min ago");
  });

  test("switches to hours at the hour mark", () => {
    expect(ago(HOUR)).toBe("1 hr ago");
    expect(ago(90 * MINUTE)).toBe("1 hr ago");
    expect(ago(23 * HOUR)).toBe("23 hr ago");
  });

  test("switches to days at the day mark", () => {
    expect(ago(DAY)).toBe("1 day ago");
    expect(ago(2 * DAY)).toBe("2 days ago");
    expect(ago(29 * DAY)).toBe("29 days ago");
  });

  test("falls back to a calendar date beyond a month", () => {
    const at = NOW - 40 * DAY;

    expect(relativeTime(at, NOW)).toBe(new Date(at).toLocaleDateString());
  });

  test("treats a future timestamp as just now", () => {
    // A miss imported from a device whose clock runs ahead.
    expect(relativeTime(NOW + HOUR, NOW)).toBe("just now");
  });
});
