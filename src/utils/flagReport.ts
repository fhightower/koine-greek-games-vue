import { flagReasonLabel, type FlagEntry } from "./flagLog";
import { gameLabel } from "./gameLabels";

export const REPORT_ISSUE_BASE =
  "https://github.com/fhightower/koine-greek-games-vue/issues/new";

export function flagReportTitle(flag: FlagEntry): string {
  return `Flagged answer: ${flag.question} (${gameLabel(flag.gameId)})`;
}

/**
 * The one wording both delivery paths use, so what lands in a GitHub issue and what
 * lands on the clipboard are the same report.
 */
export function flagReportText(flag: FlagEntry): string {
  const lines = [
    `**Game:** ${gameLabel(flag.gameId)} (\`${flag.gameId}\`)`,
    `**Question:** ${flag.question}`,
    `**Expected answer:** ${flag.answer}`,
    `**Problem:** ${flagReasonLabel(flag.reason)}`,
  ];

  if (flag.note) {
    lines.push("", `**Note:** ${flag.note}`);
  }

  return lines.join("\n");
}

/** A prefilled new-issue form. Opening it submits nothing; the player still has to. */
export function flagIssueUrl(flag: FlagEntry): string {
  const params = new URLSearchParams({
    title: flagReportTitle(flag),
    body: flagReportText(flag),
  });
  return `${REPORT_ISSUE_BASE}?${params}`;
}
