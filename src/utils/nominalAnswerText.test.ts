import { describe, expect, test } from "vitest";
import { answerText, comboText } from "./nominalAnswerText";

describe("comboText", () => {
  test("reads a grid cell as gender, number, case", () => {
    expect(comboText("feminine", "singular", "genitive")).toBe("feminine singular genitive");
  });
});

describe("answerText", () => {
  test("names the one cell of a single-cell answer", () => {
    const answer = { genders: ["neuter"], number: "plural", cases: ["accusative"] };

    expect(answerText(answer)).toBe("neuter plural accusative");
  });

  test("lists every cell when the answer spans genders and cases", () => {
    const answer = { genders: ["masculine", "neuter"], number: "singular", cases: ["nominative"] };

    expect(answerText(answer)).toBe("masculine singular nominative, neuter singular nominative");
  });
});
