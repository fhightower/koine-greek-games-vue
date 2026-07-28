import { beforeEach, describe, expect, test } from "vitest";
import {
  FLAG_LOG_LIMIT,
  FLAG_NOTE_LIMIT,
  clearFlags,
  loadFlags,
  mergeFlags,
  recordFlag,
  removeFlag,
  type FlagEntry,
} from "./flagLog";

function makeFlag(overrides: Partial<FlagEntry> = {}): FlagEntry {
  return {
    gameId: "verb-voice",
    question: "λαμβάνομεν τὸ δῶρον",
    answer: "Active",
    reason: "wrong-answer",
    note: "",
    at: 1_753_363_100_000,
    ...overrides,
  };
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("recordFlag", () => {
  test("stores a flag so it can be loaded back", () => {
    recordFlag(makeFlag());

    expect(loadFlags()).toEqual([makeFlag()]);
  });

  test("puts the newest flag first", () => {
    recordFlag(makeFlag({ question: "older", at: 1000 }));
    recordFlag(makeFlag({ question: "newer", at: 2000 }));

    expect(loadFlags().map((flag) => flag.question)).toEqual(["newer", "older"]);
  });

  test("replaces an earlier flag of the same question for the same reason", () => {
    recordFlag(makeFlag({ note: "first try", at: 1000 }));
    recordFlag(makeFlag({ note: "said it better", at: 2000 }));

    const flags = loadFlags();
    expect(flags).toHaveLength(1);
    expect(flags[0]?.note).toBe("said it better");
  });

  test("keeps flags on the same question that give different reasons", () => {
    recordFlag(makeFlag({ reason: "wrong-answer", at: 1000 }));
    recordFlag(makeFlag({ reason: "typo", at: 2000 }));

    expect(loadFlags().map((flag) => flag.reason)).toEqual(["typo", "wrong-answer"]);
  });

  test("trims the note", () => {
    recordFlag(makeFlag({ note: "  the gloss is off  " }));

    expect(loadFlags()[0]?.note).toBe("the gloss is off");
  });

  test("truncates a note past the limit", () => {
    recordFlag(makeFlag({ note: "x".repeat(FLAG_NOTE_LIMIT + 50) }));

    expect(loadFlags()[0]?.note).toHaveLength(FLAG_NOTE_LIMIT);
  });

  test("drops the oldest flag once the log is full", () => {
    for (let i = 0; i < FLAG_LOG_LIMIT + 1; i += 1) {
      recordFlag(makeFlag({ question: `q${i}`, at: 1000 + i }));
    }

    const flags = loadFlags();
    expect(flags).toHaveLength(FLAG_LOG_LIMIT);
    expect(flags[0]?.question).toBe(`q${FLAG_LOG_LIMIT}`);
    expect(flags[flags.length - 1]?.question).toBe("q1");
  });
});

describe("loadFlags", () => {
  test("returns nothing when there is no stored log", () => {
    expect(loadFlags()).toEqual([]);
  });

  test("returns nothing when the stored log is not valid JSON", () => {
    window.localStorage.setItem("koine:flag-log:v1", "{oops");

    expect(loadFlags()).toEqual([]);
  });

  test("drops entries that are not shaped like a flag", () => {
    window.localStorage.setItem(
      "koine:flag-log:v1",
      JSON.stringify([makeFlag(), { gameId: "verb-voice" }, null]),
    );

    expect(loadFlags()).toEqual([makeFlag()]);
  });

  test("drops entries whose reason is not one this app offers", () => {
    window.localStorage.setItem(
      "koine:flag-log:v1",
      JSON.stringify([makeFlag(), makeFlag({ reason: "sabotage" as FlagEntry["reason"] })]),
    );

    expect(loadFlags()).toEqual([makeFlag()]);
  });
});

describe("removeFlag", () => {
  test("drops only the named flag", () => {
    recordFlag(makeFlag({ question: "keep me", at: 1000 }));
    recordFlag(makeFlag({ question: "drop me", at: 2000 }));

    removeFlag(makeFlag({ question: "drop me", at: 2000 }));

    expect(loadFlags().map((flag) => flag.question)).toEqual(["keep me"]);
  });

  test("leaves the log alone when the flag is not in it", () => {
    recordFlag(makeFlag());

    removeFlag(makeFlag({ question: "never flagged" }));

    expect(loadFlags()).toHaveLength(1);
  });
});

describe("mergeFlags", () => {
  test("keeps both sides when they flag different things", () => {
    const mine = [makeFlag({ question: "mine", at: 1000 })];
    const theirs = [makeFlag({ question: "theirs", at: 2000 })];

    expect(mergeFlags(mine, theirs).map((flag) => flag.question)).toEqual(["theirs", "mine"]);
  });

  test("folds the same complaint from both sides into one entry", () => {
    const flag = makeFlag();

    expect(mergeFlags([flag], [flag])).toEqual([flag]);
  });
});

describe("clearFlags", () => {
  test("empties the log", () => {
    recordFlag(makeFlag());

    clearFlags();

    expect(loadFlags()).toEqual([]);
  });
});
