import { beforeEach, describe, expect, test } from "vitest";
import {
  MISS_LOG_LIMIT,
  clearMisses,
  loadMisses,
  mergeMisses,
  missedQuestions,
  recordMiss,
  summarizeMisses,
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

describe("summarizeMisses", () => {
  test("returns nothing for an empty log", () => {
    expect(summarizeMisses([])).toEqual([]);
  });

  test("keeps a once-missed question as a single row with count 1", () => {
    const miss = makeMiss({ question: "λύεται", at: 1000 });

    expect(summarizeMisses([miss])).toEqual([{ ...miss, count: 1 }]);
  });

  test("collapses repeats of a question into one row carrying the count", () => {
    const newer = makeMiss({ question: "λύεται", given: "middle", at: 2000 });
    const older = makeMiss({ question: "λύεται", given: "active", at: 1000 });

    const summary = summarizeMisses([newer, older]);

    expect(summary).toHaveLength(1);
    expect(summary[0]?.count).toBe(2);
  });

  test("shows the most recent attempt for a collapsed question", () => {
    const newer = makeMiss({ question: "λύεται", given: "middle", at: 2000 });
    const older = makeMiss({ question: "λύεται", given: "active", at: 1000 });

    expect(summarizeMisses([newer, older])[0]?.given).toBe("middle");
    expect(summarizeMisses([newer, older])[0]?.at).toBe(2000);
  });

  test("keeps the same question in different games apart", () => {
    const voice = makeMiss({ gameId: "verb-voice", question: "λύει", at: 2000 });
    const luo = makeMiss({ gameId: "luo-endings", question: "λύει", at: 1000 });

    expect(summarizeMisses([voice, luo])).toHaveLength(2);
  });

  test("orders rows by their most recent miss, newest first", () => {
    const rows = summarizeMisses([
      makeMiss({ question: "b", at: 3000 }),
      makeMiss({ question: "a", at: 2000 }),
      makeMiss({ question: "b", at: 1000 }),
    ]);

    expect(rows.map((row) => row.question)).toEqual(["b", "a"]);
  });
});

describe("clearMisses", () => {
  test("empties the log", () => {
    recordMiss(makeMiss());

    clearMisses();

    expect(loadMisses()).toEqual([]);
  });
});

describe("missedQuestions", () => {
  test("returns distinct missed questions for the chosen games", () => {
    recordMiss(makeMiss({ gameId: "verb-voice", question: "λύεται", answer: "passive", at: 1000 }));
    recordMiss(makeMiss({ gameId: "prepositions", question: "ἐν", answer: "dative", at: 2000 }));

    expect(missedQuestions(["verb-voice"])).toEqual([
      { gameId: "verb-voice", question: "λύεται", answer: "passive" },
    ]);
  });

  test("collapses repeated misses of the same question into one card", () => {
    recordMiss(makeMiss({ gameId: "verb-voice", question: "λύεται", answer: "passive", at: 1000 }));
    recordMiss(makeMiss({ gameId: "verb-voice", question: "λύεται", answer: "passive", at: 3000 }));

    expect(missedQuestions(["verb-voice"])).toHaveLength(1);
  });

  test("takes the answer from the most recent miss of a question", () => {
    recordMiss(makeMiss({ gameId: "verb-voice", question: "λύεται", answer: "old", at: 1000 }));
    recordMiss(makeMiss({ gameId: "verb-voice", question: "λύεται", answer: "new", at: 3000 }));

    expect(missedQuestions(["verb-voice"])[0]?.answer).toBe("new");
  });

  test("spans several games when several are chosen, newest miss first", () => {
    recordMiss(makeMiss({ gameId: "verb-voice", question: "λύεται", answer: "passive", at: 1000 }));
    recordMiss(makeMiss({ gameId: "prepositions", question: "ἐν", answer: "dative", at: 2000 }));

    expect(missedQuestions(["verb-voice", "prepositions"]).map((q) => q.question)).toEqual([
      "ἐν",
      "λύεται",
    ]);
  });

  test("is empty for games with no misses or for an empty selection", () => {
    recordMiss(makeMiss({ gameId: "verb-voice", question: "λύεται", answer: "passive", at: 1000 }));

    expect(missedQuestions(["unknown-game"])).toEqual([]);
    expect(missedQuestions([])).toEqual([]);
  });
});
