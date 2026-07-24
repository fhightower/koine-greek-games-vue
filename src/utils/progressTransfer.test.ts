import { beforeEach, describe, expect, test } from "vitest";
import { loadMisses, recordMiss, type MissEntry } from "./missLog";
import { loadAnswerStats, saveAnswerStats } from "./performanceStats";
import {
  PROGRESS_FILE_KIND,
  buildProgressExport,
  exportFileName,
  importProgress,
  type ProgressFile,
} from "./progressTransfer";

function makeMiss(overrides: Partial<MissEntry> = {}): MissEntry {
  return {
    gameId: "lesson-3-translation",
    question: "λαμβάνομεν",
    given: "they take",
    answer: "we take",
    at: 1_753_363_100_000,
    ...overrides,
  };
}

function makeFile(overrides: Partial<ProgressFile> = {}): ProgressFile {
  return {
    kind: PROGRESS_FILE_KIND,
    version: 1,
    exportedAt: 1_753_363_200_000,
    stats: {},
    misses: [],
    ...overrides,
  };
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("buildProgressExport", () => {
  test("carries the stored misses and stats", () => {
    saveAnswerStats({ "a|q": { seen: 2, correct: 1 } });
    recordMiss(makeMiss());

    const file = buildProgressExport(1_753_363_200_000);

    expect(file).toEqual(
      makeFile({ stats: { "a|q": { seen: 2, correct: 1 } }, misses: [makeMiss()] }),
    );
  });
});

describe("exportFileName", () => {
  test("names the file after the export date", () => {
    expect(exportFileName(Date.UTC(2026, 6, 24, 12))).toBe("koine-progress-2026-07-24.json");
  });
});

describe("importProgress", () => {
  test("adds misses the device has never seen", () => {
    const result = importProgress(JSON.stringify(makeFile({ misses: [makeMiss()] })));

    expect(result.ok).toBe(true);
    expect(loadMisses()).toEqual([makeMiss()]);
  });

  test("reports how many misses arrived and how many were new", () => {
    recordMiss(makeMiss({ at: 1000 }));

    const result = importProgress(
      JSON.stringify(makeFile({ misses: [makeMiss({ at: 1000 }), makeMiss({ at: 2000 })] })),
    );

    expect(result).toMatchObject({ ok: true, imported: 2, added: 1 });
  });

  test("keeps misses that are only on this device", () => {
    recordMiss(makeMiss({ question: "local", at: 1000 }));

    importProgress(JSON.stringify(makeFile({ misses: [makeMiss({ question: "remote", at: 2000 })] })));

    expect(loadMisses().map((miss) => miss.question)).toEqual(["remote", "local"]);
  });

  test("changes nothing when the same file is imported twice", () => {
    const json = JSON.stringify(
      makeFile({ misses: [makeMiss()], stats: { "a|q": { seen: 1, correct: 0 } } }),
    );
    importProgress(json);
    const afterFirst = { misses: loadMisses(), stats: loadAnswerStats() };

    importProgress(json);

    expect(loadMisses()).toEqual(afterFirst.misses);
    // Misses dedupe on timestamp; stats intentionally do not. See the design doc.
    expect(loadAnswerStats()).toEqual({ "a|q": { seen: 2, correct: 0 } });
  });

  test("sums stats from both sides", () => {
    saveAnswerStats({ "a|q": { seen: 4, correct: 1 } });

    importProgress(JSON.stringify(makeFile({ stats: { "a|q": { seen: 3, correct: 2 } } })));

    expect(loadAnswerStats()).toEqual({ "a|q": { seen: 7, correct: 3 } });
  });

  test("skips malformed miss entries but keeps the good ones", () => {
    const result = importProgress(
      JSON.stringify(makeFile({ misses: [makeMiss(), { gameId: "broken" }, null] as MissEntry[] })),
    );

    expect(result).toMatchObject({ ok: true, imported: 1, skipped: 2 });
    expect(loadMisses()).toEqual([makeMiss()]);
  });

  test("rejects a file that is not valid JSON", () => {
    const result = importProgress("{not json");

    expect(result.ok).toBe(false);
  });

  test("rejects a file from a different app", () => {
    const result = importProgress(JSON.stringify(makeFile({ kind: "some-other-app" })));

    expect(result).toMatchObject({ ok: false });
    expect(result.ok === false && result.error).toMatch(/Koine progress file/i);
  });

  test("rejects a file from a newer format than this app understands", () => {
    const result = importProgress(JSON.stringify(makeFile({ version: 2 })));

    expect(result).toMatchObject({ ok: false });
    expect(result.ok === false && result.error).toMatch(/newer version/i);
  });

  test("leaves stored progress untouched when the file is rejected", () => {
    recordMiss(makeMiss());
    saveAnswerStats({ "a|q": { seen: 1, correct: 1 } });

    importProgress(JSON.stringify(makeFile({ kind: "some-other-app", misses: [] })));

    expect(loadMisses()).toEqual([makeMiss()]);
    expect(loadAnswerStats()).toEqual({ "a|q": { seen: 1, correct: 1 } });
  });

  test("accepts a file with no misses or stats recorded yet", () => {
    const result = importProgress(JSON.stringify({ kind: PROGRESS_FILE_KIND, version: 1 }));

    expect(result).toMatchObject({ ok: true, imported: 0, added: 0 });
  });
});
