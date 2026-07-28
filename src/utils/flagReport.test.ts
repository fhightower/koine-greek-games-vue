import { describe, expect, test } from "vitest";
import type { FlagEntry } from "./flagLog";
import { REPORT_ISSUE_BASE, flagIssueUrl, flagReportText, flagReportTitle } from "./flagReport";

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

describe("flagReportTitle", () => {
  test("names the question and the game it came from", () => {
    expect(flagReportTitle(makeFlag())).toBe("Flagged answer: λαμβάνομεν τὸ δῶρον (Verb Voice)");
  });

  test("falls back to the raw game id when the game has no label", () => {
    expect(flagReportTitle(makeFlag({ gameId: "not-a-game" }))).toContain("(not-a-game)");
  });
});

describe("flagReportText", () => {
  test("carries the game, the question, the expected answer, and the reason", () => {
    const text = flagReportText(makeFlag());

    expect(text).toContain("Verb Voice");
    expect(text).toContain("verb-voice");
    expect(text).toContain("λαμβάνομεν τὸ δῶρον");
    expect(text).toContain("Active");
    expect(text).toContain("The expected answer is wrong");
  });

  test("includes the note when the player wrote one", () => {
    expect(flagReportText(makeFlag({ note: "Machen glosses this as receive" }))).toContain(
      "Machen glosses this as receive",
    );
  });

  test("leaves out the note heading when there is no note", () => {
    expect(flagReportText(makeFlag())).not.toContain("Note");
  });
});

describe("flagIssueUrl", () => {
  test("points at the repository's new-issue form", () => {
    expect(flagIssueUrl(makeFlag()).startsWith(`${REPORT_ISSUE_BASE}?`)).toBe(true);
  });

  test("escapes the Greek and the line breaks so the link survives", () => {
    const url = flagIssueUrl(makeFlag({ note: "line one\nline two" }));

    expect(url).not.toContain("λ");
    expect(url).not.toContain("\n");
  });

  test("prefills the title and body the report text gives", () => {
    const flag = makeFlag({ note: "a note" });
    const params = new URL(flagIssueUrl(flag)).searchParams;

    expect(params.get("title")).toBe(flagReportTitle(flag));
    expect(params.get("body")).toBe(flagReportText(flag));
  });
});
