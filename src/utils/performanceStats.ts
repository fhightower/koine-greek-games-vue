import { recordMiss } from "./missLog";

export type AnswerStat = {
  seen: number;
  correct: number;
};

export type AnswerStats = Record<string, AnswerStat>;

export type QuestionOutcome = {
  gameId: string;
  question: string;
  /** True only when the player got it right without a wrong guess along the way. */
  correct: boolean;
  /** What the player answered. Empty when a self-graded game has nothing typed. */
  given: string;
  /** What the right answer was. */
  answer: string;
  /** Overridable for tests; defaults to now. */
  at?: number;
};

const STORAGE_KEY = "koine:question-stats:v1";

function getDefaultStat(): AnswerStat {
  return { seen: 0, correct: 0 };
}

function isAnswerStat(value: unknown): value is AnswerStat {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return typeof candidate.seen === "number" && typeof candidate.correct === "number";
}

export function loadAnswerStats(): AnswerStats {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).filter(([, stat]) => isAnswerStat(stat)),
    ) as AnswerStats;
  } catch {
    return {};
  }
}

export function saveAnswerStats(stats: AnswerStats) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

function buildStatKey(gameId: string, question: string): string {
  return `${gameId}|${question}`;
}

export function recordQuestionOutcome(outcome: QuestionOutcome) {
  const { gameId, question, correct, given, answer } = outcome;

  const stats = loadAnswerStats();
  const key = buildStatKey(gameId, question);
  const current = stats[key] ?? getDefaultStat();

  current.seen += 1;
  if (correct) {
    current.correct += 1;
  }
  stats[key] = current;

  saveAnswerStats(stats);

  if (!correct) {
    recordMiss({ gameId, question, given, answer, at: outcome.at ?? Date.now() });
  }
}

/**
 * Sums counts per question. Not idempotent — re-importing a file inflates the
 * totals, which is accepted because nothing displays these yet. See the design
 * doc for why misses dedupe and aggregates cannot.
 */
export function mergeAnswerStats(mine: AnswerStats, theirs: AnswerStats): AnswerStats {
  const merged: AnswerStats = {};
  for (const [key, stat] of [...Object.entries(mine), ...Object.entries(theirs)]) {
    const current = merged[key] ?? getDefaultStat();
    merged[key] = {
      seen: current.seen + stat.seen,
      correct: current.correct + stat.correct,
    };
  }
  return merged;
}

export function clearAnswerStats() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
}
