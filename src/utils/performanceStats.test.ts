import { beforeEach, describe, expect, test } from "vitest";
import { loadMisses } from "./missLog";
import {
  clearAnswerStats,
  loadAnswerStats,
  mergeAnswerStats,
  recordQuestionOutcome,
} from "./performanceStats";

beforeEach(() => {
  window.localStorage.clear();
});

describe("recordQuestionOutcome", () => {
  test("counts a correct answer as seen and correct", () => {
    recordQuestionOutcome({
      gameId: "verb-voice",
      question: "λύεται",
      correct: true,
      given: "passive",
      answer: "passive",
    });

    expect(loadAnswerStats()).toEqual({ "verb-voice|λύεται": { seen: 1, correct: 1 } });
  });

  test("counts a wrong answer as seen but not correct", () => {
    recordQuestionOutcome({
      gameId: "verb-voice",
      question: "λύεται",
      correct: false,
      given: "active",
      answer: "passive",
    });

    expect(loadAnswerStats()).toEqual({ "verb-voice|λύεται": { seen: 1, correct: 0 } });
  });

  test("accumulates across attempts at the same question", () => {
    const outcome = { gameId: "verb-voice", question: "λύεται", given: "", answer: "passive" };
    recordQuestionOutcome({ ...outcome, correct: false });
    recordQuestionOutcome({ ...outcome, correct: true });

    expect(loadAnswerStats()["verb-voice|λύεται"]).toEqual({ seen: 2, correct: 1 });
  });

  test("logs the wrong answer alongside the count", () => {
    recordQuestionOutcome({
      gameId: "verb-voice",
      question: "λύεται",
      correct: false,
      given: "active",
      answer: "passive",
      at: 1000,
    });

    expect(loadMisses()).toEqual([
      {
        gameId: "verb-voice",
        question: "λύεται",
        given: "active",
        answer: "passive",
        at: 1000,
      },
    ]);
  });

  test("logs nothing when the answer was right", () => {
    recordQuestionOutcome({
      gameId: "verb-voice",
      question: "λύεται",
      correct: true,
      given: "passive",
      answer: "passive",
    });

    expect(loadMisses()).toEqual([]);
  });
});

describe("loadAnswerStats", () => {
  test("returns nothing when there are no stored stats", () => {
    expect(loadAnswerStats()).toEqual({});
  });

  test("recovers from corrupt stored stats", () => {
    window.localStorage.setItem("koine:question-stats:v1", "{not json");

    expect(loadAnswerStats()).toEqual({});
  });
});

describe("mergeAnswerStats", () => {
  test("sums the counts of questions both sides have seen", () => {
    const mine = { "a|q": { seen: 4, correct: 1 } };
    const theirs = { "a|q": { seen: 3, correct: 2 } };

    expect(mergeAnswerStats(mine, theirs)).toEqual({ "a|q": { seen: 7, correct: 3 } });
  });

  test("keeps questions only one side has seen", () => {
    const merged = mergeAnswerStats(
      { "a|q": { seen: 1, correct: 1 } },
      { "b|q": { seen: 2, correct: 0 } },
    );

    expect(merged).toEqual({
      "a|q": { seen: 1, correct: 1 },
      "b|q": { seen: 2, correct: 0 },
    });
  });

  test("leaves the inputs untouched", () => {
    const mine = { "a|q": { seen: 1, correct: 1 } };

    mergeAnswerStats(mine, { "a|q": { seen: 1, correct: 1 } });

    expect(mine).toEqual({ "a|q": { seen: 1, correct: 1 } });
  });
});

describe("clearAnswerStats", () => {
  test("empties the stats", () => {
    recordQuestionOutcome({
      gameId: "verb-voice",
      question: "λύεται",
      correct: true,
      given: "passive",
      answer: "passive",
    });

    clearAnswerStats();

    expect(loadAnswerStats()).toEqual({});
  });
});
