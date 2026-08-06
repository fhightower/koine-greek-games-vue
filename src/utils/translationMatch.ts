// Punctuation the model translations use. None of it changes the sense of an
// answer, so a learner who leaves it out has still translated the sentence.
const PUNCTUATION = /[.,;:!?()]/g;

/**
 * Comparable form of a translation: case, punctuation and spacing removed, so
 * only the words and their order are left.
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(PUNCTUATION, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Whether a typed translation is word-for-word the expected one. Deliberately
 * strict about wording — a near miss is left for the learner to grade.
 */
export function matchesTranslation(given: string, expected: string): boolean {
  const typed = normalize(given);
  return typed !== "" && typed === normalize(expected);
}
