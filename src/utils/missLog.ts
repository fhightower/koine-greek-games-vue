export type MissEntry = {
  gameId: string;
  question: string;
  given: string;
  answer: string;
  at: number;
};

const STORAGE_KEY = "koine:miss-log:v1";

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
}

export function mergeMisses(mine: MissEntry[], theirs: MissEntry[]): MissEntry[] {
  return normalize([...mine, ...theirs]);
}

export function clearMisses() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
}
