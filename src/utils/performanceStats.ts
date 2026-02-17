export type AnswerStat = {
  seen: number;
  correct: number;
};

export type AnswerStats = Record<string, AnswerStat>;

const STORAGE_KEY = "koine:question-stats:v1";

function getDefaultStat(): AnswerStat {
  return { seen: 0, correct: 0 };
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
    return JSON.parse(raw) as AnswerStats;
  } catch {
    return {};
  }
}

function saveAnswerStats(stats: AnswerStats) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

function buildStatKey(gameId: string, question: string): string {
  return `${gameId}|${question}`;
}

export function recordQuestionOutcome(
  gameId: string,
  question: string,
  isCorrectWithoutMiss: boolean
) {
  const stats = loadAnswerStats();
  const key = buildStatKey(gameId, question);
  const current = stats[key] ?? getDefaultStat();

  current.seen += 1;
  if (isCorrectWithoutMiss) {
    current.correct += 1;
  }
  stats[key] = current;

  saveAnswerStats(stats);
}
