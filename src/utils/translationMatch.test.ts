import { describe, expect, test } from "vitest";
import { matchesTranslation } from "./translationMatch";

describe("matchesTranslation", () => {
  test("accepts the model translation typed verbatim", () => {
    expect(matchesTranslation("A brother says a word to an apostle.", "A brother says a word to an apostle.")).toBe(
      true
    );
  });

  test("ignores capitalisation", () => {
    expect(matchesTranslation("a brother says a word to an apostle.", "A brother says a word to an apostle.")).toBe(
      true
    );
  });

  test("ignores a missing final period", () => {
    expect(matchesTranslation("a brother says a word to an apostle", "A brother says a word to an apostle.")).toBe(
      true
    );
  });

  test("ignores surrounding whitespace", () => {
    expect(matchesTranslation("  we take the gift\n", "We take the gift.")).toBe(true);
  });

  test("ignores repeated spaces between words", () => {
    expect(matchesTranslation("we  take   the gift", "We take the gift.")).toBe(true);
  });

  test("ignores commas the learner left out", () => {
    expect(matchesTranslation("brothers take servants and houses", "Brothers take servants, and houses.")).toBe(true);
  });

  test("accepts the parenthetical gloss written without its brackets", () => {
    expect(matchesTranslation("you take receive", "you take (receive)")).toBe(true);
  });

  test("rejects a translation missing a word", () => {
    expect(matchesTranslation("a brother says a word", "A brother says a word to an apostle.")).toBe(false);
  });

  test("rejects a different word", () => {
    expect(matchesTranslation("they take the gift", "We take the gift.")).toBe(false);
  });

  test("rejects an empty attempt", () => {
    expect(matchesTranslation("", "We take the gift.")).toBe(false);
  });

  test("rejects whitespace-only against an empty expectation", () => {
    expect(matchesTranslation("   ", "")).toBe(false);
  });
});
