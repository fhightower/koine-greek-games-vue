/** What a player says is wrong with a question. */
export const FLAG_REASONS = [
  { value: "wrong-answer", label: "The expected answer is wrong" },
  { value: "typo", label: "There is a typo in the Greek" },
  { value: "should-count", label: "My answer should have counted" },
  { value: "other", label: "Something else" },
] as const;

export type FlagReason = (typeof FLAG_REASONS)[number]["value"];

export type FlagEntry = {
  gameId: string;
  question: string;
  /** The expected answer the player is disputing. */
  answer: string;
  reason: FlagReason;
  /** Optional free text. Trimmed and capped; empty when the player wrote nothing. */
  note: string;
  at: number;
};

const STORAGE_KEY = "koine:flag-log:v1";

/** Newest-first log size. Flags are rarer than misses, so the cap is lower. */
export const FLAG_LOG_LIMIT = 200;

/** Keeps both localStorage and the generated issue URL bounded. */
export const FLAG_NOTE_LIMIT = 280;

const REASON_VALUES = new Set<string>(FLAG_REASONS.map((reason) => reason.value));

export function flagReasonLabel(reason: FlagReason): string {
  return FLAG_REASONS.find((option) => option.value === reason)?.label ?? reason;
}

export function isFlagEntry(value: unknown): value is FlagEntry {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.gameId === "string" &&
    typeof candidate.question === "string" &&
    typeof candidate.answer === "string" &&
    typeof candidate.note === "string" &&
    typeof candidate.at === "number" &&
    typeof candidate.reason === "string" &&
    REASON_VALUES.has(candidate.reason)
  );
}

/**
 * One flag per complaint: the same player saying the same thing about the same
 * question twice is one report, not two, however they worded it the second time.
 */
function flagKey(flag: FlagEntry): string {
  return `${flag.gameId}|${flag.question}|${flag.reason}`;
}

/** Newest first, deduplicated, capped. The one place ordering is decided. */
function normalize(flags: FlagEntry[]): FlagEntry[] {
  const byKey = new Map<string, FlagEntry>();
  // Newest wins the key, so sort before folding rather than after.
  for (const flag of [...flags].sort((a, b) => b.at - a.at)) {
    if (!byKey.has(flagKey(flag))) {
      byKey.set(flagKey(flag), flag);
    }
  }
  return [...byKey.values()].slice(0, FLAG_LOG_LIMIT);
}

export function loadFlags(): FlagEntry[] {
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
    return normalize(parsed.filter(isFlagEntry));
  } catch {
    return [];
  }
}

export function saveFlags(flags: FlagEntry[]) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalize(flags)));
}

export function recordFlag(flag: FlagEntry) {
  const note = flag.note.trim().slice(0, FLAG_NOTE_LIMIT);
  saveFlags([{ ...flag, note }, ...loadFlags()]);
}

export function removeFlag(flag: FlagEntry) {
  const key = flagKey(flag);
  saveFlags(loadFlags().filter((stored) => flagKey(stored) !== key));
}

export function mergeFlags(mine: FlagEntry[], theirs: FlagEntry[]): FlagEntry[] {
  return normalize([...mine, ...theirs]);
}

export function clearFlags() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
}
