import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, test } from "vitest";
import { loadMisses } from "../utils/missLog";
import { loadAnswerStats } from "../utils/performanceStats";
import DefiniteArticles1 from "./DefiniteArticles1.vue";

type Grid = ReturnType<typeof mountGame>;

const GENDERS = ["masculine", "feminine", "neuter"];
const NUMBERS = ["singular", "plural"];
const CASES = ["nominative", "genitive", "dative", "accusative"];

function mountGame() {
  const wrapper = mount(DefiniteArticles1);
  const article = wrapper.get("h3 b").text();
  return { wrapper, article };
}

function cell({ wrapper }: Grid, gender: string, number: string, case_: string) {
  return wrapper.get(`button.${gender}.${number}.${case_}`);
}

type Cell = { gender: string; number: string; case_: string };

function cellName(cell: Cell): string {
  return `${cell.gender} ${cell.number} ${cell.case_}`;
}

/**
 * Every cell the game accepts for the article on screen. The article is picked
 * at random, so read the answers off the component's own cheat sheet rather
 * than hard-coding a paradigm here.
 */
function correctCells({ wrapper, article }: Grid): Cell[] {
  const vm = wrapper.vm as unknown as {
    cheatSheetEntries: { question: string; combos: Cell[] }[];
  };
  const entry = vm.cheatSheetEntries.find((e) => e.question === article);
  if (!entry) {
    throw new Error(`No cheat sheet entry for ${article}`);
  }
  return entry.combos;
}

function aWrongCell(exclude: Cell[]): Cell {
  const taken = new Set(exclude.map(cellName));
  for (const gender of GENDERS) {
    for (const number of NUMBERS) {
      for (const case_ of CASES) {
        const candidate = { gender, number, case_ };
        if (!taken.has(cellName(candidate))) {
          return candidate;
        }
      }
    }
  }
  throw new Error("Every cell is correct — no wrong cell to click");
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("DefiniteArticles1", () => {
  test("logs nothing until every correct cell has been found", async () => {
    const grid = mountGame();
    const correct = correctCells(grid);
    const wrong = aWrongCell(correct);

    await cell(grid, wrong.gender, wrong.number, wrong.case_).trigger("click");

    expect(loadMisses()).toEqual([]);
    expect(loadAnswerStats()).toEqual({});
  });

  test("logs every wrong cell clicked along the way, not just that one was", async () => {
    const grid = mountGame();
    const correct = correctCells(grid);
    const first = aWrongCell(correct);
    const second = aWrongCell([...correct, first]);

    await cell(grid, first.gender, first.number, first.case_).trigger("click");
    await cell(grid, second.gender, second.number, second.case_).trigger("click");
    for (const c of correct) {
      await cell(grid, c.gender, c.number, c.case_).trigger("click");
    }

    const misses = loadMisses();
    expect(misses).toHaveLength(1);
    expect(misses[0]?.given).toBe(`${cellName(first)}, ${cellName(second)}`);
    expect(misses[0]?.answer).toBe(correct.map(cellName).join(", "));
    expect(misses[0]?.question).toBe(grid.article);
  });

  test("logs nothing when every cell is found first try", async () => {
    const grid = mountGame();
    const correct = correctCells(grid);

    for (const c of correct) {
      await cell(grid, c.gender, c.number, c.case_).trigger("click");
    }

    expect(loadMisses()).toEqual([]);
    expect(loadAnswerStats()[`definite-articles-1|${grid.article}`]).toEqual({
      seen: 1,
      correct: 1,
    });
  });
});
