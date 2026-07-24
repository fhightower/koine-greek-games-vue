import { isMissEntry, loadMisses, mergeMisses, saveMisses, type MissEntry } from "./missLog";
import {
  loadAnswerStats,
  mergeAnswerStats,
  saveAnswerStats,
  type AnswerStats,
} from "./performanceStats";

export const PROGRESS_FILE_KIND = "koine-greek-games-progress";
export const PROGRESS_FILE_VERSION = 1;

export type ProgressFile = {
  kind: string;
  version: number;
  exportedAt: number;
  stats: AnswerStats;
  misses: MissEntry[];
};

export type ImportResult =
  | { ok: true; imported: number; added: number; skipped: number }
  | { ok: false; error: string };

export function buildProgressExport(exportedAt: number): ProgressFile {
  return {
    kind: PROGRESS_FILE_KIND,
    version: PROGRESS_FILE_VERSION,
    exportedAt,
    stats: loadAnswerStats(),
    misses: loadMisses(),
  };
}

export function exportFileName(exportedAt: number): string {
  const date = new Date(exportedAt).toISOString().slice(0, 10);
  return `koine-progress-${date}.json`;
}

function isAnswerStats(value: unknown): value is AnswerStats {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  return Object.values(value as Record<string, unknown>).every((stat) => {
    if (typeof stat !== "object" || stat === null) {
      return false;
    }
    const candidate = stat as Record<string, unknown>;
    return typeof candidate.seen === "number" && typeof candidate.correct === "number";
  });
}

export function importProgress(json: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: "That file isn't valid JSON." };
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { ok: false, error: "That file isn't a Koine progress file." };
  }

  const file = parsed as Partial<ProgressFile>;

  if (file.kind !== PROGRESS_FILE_KIND) {
    return { ok: false, error: "That file isn't a Koine progress file." };
  }

  if (typeof file.version !== "number" || file.version > PROGRESS_FILE_VERSION) {
    return {
      ok: false,
      error: "That file came from a newer version of this app. Update and try again.",
    };
  }

  const rawMisses = Array.isArray(file.misses) ? file.misses : [];
  const misses = rawMisses.filter(isMissEntry);
  const skipped = rawMisses.length - misses.length;

  const existing = loadMisses();
  const merged = mergeMisses(existing, misses);
  saveMisses(merged);

  if (isAnswerStats(file.stats)) {
    saveAnswerStats(mergeAnswerStats(loadAnswerStats(), file.stats));
  }

  return {
    ok: true,
    imported: misses.length,
    added: Math.max(0, merged.length - existing.length),
    skipped,
  };
}
