import type { Answer } from "../types/nominalForms";

/**
 * Human-readable text for gender/number/case grid answers, so a stored miss
 * reads the way the grid did.
 */
export function comboText(gender: string, number: string, case_: string): string {
  return `${gender} ${number} ${case_}`;
}

export function answerText(answer: Answer): string {
  return answer.genders
    .flatMap((gender) => answer.cases.map((case_) => comboText(gender, answer.number, case_)))
    .join(", ");
}
