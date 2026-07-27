export type MissEntry = {
  gameId: string;
  question: string;
  given: string;
  answer: string;
  at: number;
};

const STORAGE_KEY = "koine:miss-log:v1";

/**
 * Correct answers still owed before a question leaves the log, per `gameId|question`.
 * Kept apart from the log itself because it is working state, not history: it only
 * ever holds questions currently in the log, and an entry dies with its question.
 */
const RECOVERY_KEY = "koine:miss-recovery:v1";

/** Newest-first log size. Roughly 120 KB of localStorage at ~120 bytes per entry. */
export const MISS_LOG_LIMIT = 1000;

export function isMissEntry(value: unknown): value is MissEntry {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.gameId === "string" &&
    typeof candidate.question === "string" &&
    typeof candidate.given === "string" &&
    typeof candidate.answer === "string" &&
    typeof candidate.at === "number"
  );
}

function missKey(miss: MissEntry): string {
  return `${miss.gameId}|${miss.question}|${miss.at}`;
}

/** Newest first, deduplicated, capped. The one place ordering is decided. */
function normalize(misses: MissEntry[]): MissEntry[] {
  const byKey = new Map<string, MissEntry>();
  for (const miss of misses) {
    byKey.set(missKey(miss), miss);
  }
  return [...byKey.values()].sort((a, b) => b.at - a.at).slice(0, MISS_LOG_LIMIT);
}

export function loadMisses(): MissEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    // Normalized on read too, so the newest-first invariant does not depend on
    // whoever wrote the file having sorted it.
    return normalize(parsed.filter(isMissEntry));
  } catch {
    return [];
  }
}

export function saveMisses(misses: MissEntry[]) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalize(misses)));
}

export function recordMiss(miss: MissEntry) {
  saveMisses([miss, ...loadMisses()]);
  // Missing it again undoes whatever progress had been made towards clearing it.
  resetCorrectStreak(miss.gameId, miss.question);
}

/** Consecutive correct answers that retire a question from the log. */
export const CLEAR_AFTER = 2;

type RecoveryCounts = Record<string, number>;

function questionKey(gameId: string, question: string): string {
  return `${gameId}|${question}`;
}

function loadRecovery(): RecoveryCounts {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.localStorage.getItem(RECOVERY_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).filter(
        ([, count]) => typeof count === "number",
      ),
    ) as RecoveryCounts;
  } catch {
    return {};
  }
}

function saveRecovery(counts: RecoveryCounts) {
  if (typeof window === "undefined") {
    return;
  }
  if (Object.keys(counts).length === 0) {
    window.localStorage.removeItem(RECOVERY_KEY);
    return;
  }
  window.localStorage.setItem(RECOVERY_KEY, JSON.stringify(counts));
}

/** Drops every miss stored for a question, and any progress counted towards that. */
export function forgetQuestion(gameId: string, question: string) {
  const key = questionKey(gameId, question);
  saveMisses(loadMisses().filter((miss) => questionKey(miss.gameId, miss.question) !== key));
  resetCorrectStreak(gameId, question);
}

/** Forgets how close a question was to being cleared, without touching the log. */
export function resetCorrectStreak(gameId: string, question: string) {
  const counts = loadRecovery();
  delete counts[questionKey(gameId, question)];
  saveRecovery(counts);
}

/**
 * Counts one correct answer towards clearing a missed question. `CLEAR_AFTER` in a
 * row with no miss in between and the question leaves the log for good. Questions
 * that are not in the log are ignored, so nothing is tracked for them.
 */
export function recordCorrect(gameId: string, question: string) {
  const key = questionKey(gameId, question);
  const isLogged = loadMisses().some((miss) => questionKey(miss.gameId, miss.question) === key);
  if (!isLogged) {
    return;
  }

  const counts = loadRecovery();
  const streak = (counts[key] ?? 0) + 1;

  if (streak >= CLEAR_AFTER) {
    forgetQuestion(gameId, question);
    return;
  }

  counts[key] = streak;
  saveRecovery(counts);
}

export function mergeMisses(mine: MissEntry[], theirs: MissEntry[]): MissEntry[] {
  return normalize([...mine, ...theirs]);
}

export type MissSummary = MissEntry & { count: number };

/**
 * One row per distinct `gameId|question`, newest miss first, carrying the number of
 * times that question was missed. The representative row is the most recent miss, so
 * its `given` and `at` are the latest attempt. Feeds the review list.
 */
export function summarizeMisses(misses: MissEntry[]): MissSummary[] {
  const byKey = new Map<string, MissSummary>();

  // Input is newest-first, so the first miss seen for a key is its most recent.
  for (const miss of misses) {
    const key = `${miss.gameId}|${miss.question}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      byKey.set(key, { ...miss, count: 1 });
    }
  }

  return [...byKey.values()];
}

export type MissedQuestion = { gameId: string; question: string; answer: string };

/**
 * Distinct missed questions for the given games, newest miss first. One entry per
 * `gameId|question`; the answer comes from that question's most recent miss. Feeds
 * the focus drill, which asks each of these once.
 */
export function missedQuestions(gameIds: string[]): MissedQuestion[] {
  const wanted = new Set(gameIds);
  const seen = new Set<string>();
  const questions: MissedQuestion[] = [];

  // loadMisses is already newest-first, so the first time a question is seen is its
  // most recent miss — exactly the answer to show.
  for (const miss of loadMisses()) {
    if (!wanted.has(miss.gameId)) {
      continue;
    }
    const key = `${miss.gameId}|${miss.question}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    questions.push({ gameId: miss.gameId, question: miss.question, answer: miss.answer });
  }

  return questions;
}

export function clearMisses() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(RECOVERY_KEY);
}
