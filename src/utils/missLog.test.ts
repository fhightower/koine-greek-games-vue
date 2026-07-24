import { beforeEach, describe, expect, test } from "vitest";
import {
  MISS_LOG_LIMIT,
  clearMisses,
  loadMisses,
  mergeMisses,
  recordMiss,
  type MissEntry,
} from "./missLog";

function makeMiss(overrides: Partial<MissEntry> = {}): MissEntry {
  return {
    gameId: "lesson-3-translation",
    question: "λαμβάνομεν",
    given: "they take",
    answer: "we take",
    at: 1_753_363_100_000,
    ...overrides,
  };
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("recordMiss", () => {
  test("stores a miss so it can be loaded back", () => {
    recordMiss(makeMiss());

    expect(loadMisses()).toEqual([makeMiss()]);
  });

  test("puts the newest miss first", () => {
    recordMiss(makeMiss({ question: "older", at: 1000 }));
    recordMiss(makeMiss({ question: "newer", at: 2000 }));

    expect(loadMisses().map((miss) => miss.question)).toEqual(["newer", "older"]);
  });

  test("drops the oldest miss once the log is full", () => {
    for (let i = 0; i < MISS_LOG_LIMIT + 1; i += 1) {
      recordMiss(makeMiss({ question: `q${i}`, at: 1000 + i }));
    }

    const misses = loadMisses();
    expect(misses).toHaveLength(MISS_LOG_LIMIT);
    expect(misses[0]?.question).toBe(`q${MISS_LOG_LIMIT}`);
    expect(misses[misses.length - 1]?.question).toBe("q1");
  });
});

describe("loadMisses", () => {
  test("returns nothing when there is no stored log", () => {
    expect(loadMisses()).toEqual([]);
  });

  test("recovers from a corrupt stored log", () => {
    window.localStorage.setItem("koine:miss-log:v1", "{not json");

    expect(loadMisses()).toEqual([]);
  });

  test("returns newest first even if the stored log is out of order", () => {
    // A hand-edited or hand-assembled file should still read correctly.
    window.localStorage.setItem(
      "koine:miss-log:v1",
      JSON.stringify([makeMiss({ question: "older", at: 1000 }), makeMiss({ question: "newer", at: 2000 })]),
    );

    expect(loadMisses().map((miss) => miss.question)).toEqual(["newer", "older"]);
  });

  test("ignores entries that are not shaped like a miss", () => {
    window.localStorage.setItem(
      "koine:miss-log:v1",
      JSON.stringify([makeMiss(), { gameId: "broken" }, null]),
    );

    expect(loadMisses()).toEqual([makeMiss()]);
  });
});

describe("mergeMisses", () => {
  test("keeps misses from both sides", () => {
    const mine = makeMiss({ question: "mine", at: 2000 });
    const theirs = makeMiss({ question: "theirs", at: 1000 });

    expect(mergeMisses([mine], [theirs])).toEqual([mine, theirs]);
  });

  test("collapses entries that share game, question, and timestamp", () => {
    const miss = makeMiss();

    expect(mergeMisses([miss], [miss])).toEqual([miss]);
  });

  test("keeps same-question misses that happened at different times", () => {
    const first = makeMiss({ at: 1000 });
    const second = makeMiss({ at: 2000 });

    expect(mergeMisses([first], [second])).toEqual([second, first]);
  });

  test("caps the merged log", () => {
    const mine = Array.from({ length: MISS_LOG_LIMIT }, (_, i) =>
      makeMiss({ question: `mine${i}`, at: 10_000 + i }),
    );
    const theirs = [makeMiss({ question: "ancient", at: 1 })];

    const merged = mergeMisses(mine, theirs);

    expect(merged).toHaveLength(MISS_LOG_LIMIT);
    expect(merged.some((miss) => miss.question === "ancient")).toBe(false);
  });
});

describe("clearMisses", () => {
  test("empties the log", () => {
    recordMiss(makeMiss());

    clearMisses();

    expect(loadMisses()).toEqual([]);
  });
});
