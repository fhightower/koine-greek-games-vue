import { translationLessons } from "../data/translationGames";

/**
 * Labels for games whose id is a constant inside the view. Translation lessons
 * are not listed here — they come from the lesson data below.
 */
const GRAMMAR_GAME_LABELS: Record<string, string> = {
  "definite-articles-1": "Definite Articles",
  "second-declension-flash-cards": "Second Declension",
  "first-declension-flash-cards": "First Declension",
  "verb-voice": "Verb Voice",
  "luo-active-endings": "λύω Active Endings",
  "luo-endings": "λύω Middle/Passive Endings",
  "adjective-agathos": "ἀγαθός Agreement",
  prepositions: "Prepositions",
  "eimi-forms": "εἰμί Forms",
  demonstratives: "Demonstratives",
};

const TRANSLATION_GAME_LABELS: Record<string, string> = Object.fromEntries(
  translationLessons.map((lesson) => [lesson.gameId, `${lesson.title} — Translation`]),
);

export function gameLabel(gameId: string): string {
  return GRAMMAR_GAME_LABELS[gameId] ?? TRANSLATION_GAME_LABELS[gameId] ?? gameId;
}

/** Every known game id with its label, for filter dropdowns. */
export function knownGames(): { id: string; label: string }[] {
  return [
    ...Object.entries(GRAMMAR_GAME_LABELS),
    ...Object.entries(TRANSLATION_GAME_LABELS),
  ].map(([id, label]) => ({ id, label }));
}
