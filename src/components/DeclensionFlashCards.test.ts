import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, test } from "vitest";
import type { Question } from "../types/nominalForms";
import { loadMisses } from "../utils/missLog";
import { loadAnswerStats } from "../utils/performanceStats";
import DeclensionFlashCards from "./DeclensionFlashCards.vue";

const GAME_ID = "test-flash-cards";

// Two questions per word, so "Next" has only one place to go.
const LOGOS: Question[] = [
  { q: "λόγος", a: { genders: ["masculine"], number: "singular", cases: ["nominative"] } },
  { q: "λόγε", a: { genders: ["masculine"], number: "singular", cases: ["vocative"] } },
];
// Neuter, so both of its questions answer to more than one cell.
const DORON: Question[] = [
  {
    q: "δῶρον",
    a: {
      genders: ["neuter"],
      number: "singular",
      cases: ["nominative", "accusative", "vocative"],
    },
  },
  {
    q: "δῶρα",
    a: { genders: ["neuter"], number: "plural", cases: ["nominative", "accusative", "vocative"] },
  },
];

const WORDS = [
  { nominativeSingular: "λόγος", meaning: "a word", questions: LOGOS },
  { nominativeSingular: "δῶρον", meaning: "a gift", questions: DORON },
];

type Wrapper = ReturnType<typeof mount>;
type Cell = { gender: string; number: string; case_: string };

function mountGame() {
  return mount(DeclensionFlashCards, { props: { gameId: GAME_ID, words: WORDS } });
}

async function pickWord(wrapper: Wrapper, nominativeSingular: string) {
  const button = wrapper
    .findAll("button.word-btn")
    .find((b) => b.text().includes(nominativeSingular));
  if (!button) {
    throw new Error(`No word button for ${nominativeSingular}`);
  }
  await button.trigger("click");
}

function shownQuestion(wrapper: Wrapper, questions: Question[]) {
  const text = wrapper.get("h3 b").text();
  const question = questions.find((q) => q.q === text);
  if (!question) {
    throw new Error(`Unknown question rendered: ${text}`);
  }
  return question;
}

function correctCells(question: Question): Cell[] {
  return question.a.genders.flatMap((gender) =>
    question.a.cases.map((case_) => ({ gender, number: question.a.number, case_ })),
  );
}

function cellName(cell: Cell): string {
  return `${cell.gender} ${cell.number} ${cell.case_}`;
}

async function click(wrapper: Wrapper, cell: Cell) {
  await wrapper.get(`button.${cell.gender}.${cell.number}.${cell.case_}`).trigger("click");
}

/** The grid cells also carry `.button`, so pick the footer button out by label. */
async function nextQuestion(wrapper: Wrapper) {
  const button = wrapper.findAll("button.button").find((b) => b.text() === "Next >");
  if (!button) {
    throw new Error("No next question button rendered");
  }
  await button.trigger("click");
}

async function answerCorrectly(wrapper: Wrapper, question: Question) {
  for (const cell of correctCells(question)) {
    await click(wrapper, cell);
  }
}

function aWrongCell(question: Question): Cell {
  const taken = new Set(correctCells(question).map(cellName));
  for (const gender of ["masculine", "feminine", "neuter"]) {
    for (const number of ["singular", "plural"]) {
      for (const case_ of ["nominative", "genitive", "dative", "accusative", "vocative"]) {
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

describe("DeclensionFlashCards", () => {
  test("shows no grid until a word is picked, then a grid with vocative", async () => {
    const wrapper = mountGame();

    expect(wrapper.find("button.answer").exists()).toBe(false);

    await pickWord(wrapper, "λόγος");

    // 3 genders x 2 numbers x 5 cases — the vocative row the other grids omit.
    expect(wrapper.findAll("button.answer")).toHaveLength(30);
    expect(wrapper.find("button.masculine.singular.vocative").exists()).toBe(true);
  });

  test("logs nothing until every correct cell has been found", async () => {
    const wrapper = mountGame();
    await pickWord(wrapper, "δῶρον");
    const question = shownQuestion(wrapper, DORON);
    const [first] = correctCells(question);

    await click(wrapper, first!);

    expect(wrapper.text()).toContain("Correct! 2 remaining.");
    expect(loadMisses()).toEqual([]);
    expect(loadAnswerStats()).toEqual({});
  });

  test("logs every wrong cell clicked along the way", async () => {
    const wrapper = mountGame();
    await pickWord(wrapper, "λόγος");
    const question = shownQuestion(wrapper, LOGOS);
    const wrong = aWrongCell(question);

    await click(wrapper, wrong);
    await answerCorrectly(wrapper, question);

    expect(loadMisses()).toEqual([
      {
        gameId: GAME_ID,
        question: question.q,
        given: cellName(wrong),
        answer: correctCells(question).map(cellName).join(", "),
        at: expect.any(Number),
      },
    ]);
  });

  test("does not carry wrong picks over into the next question", async () => {
    const wrapper = mountGame();
    await pickWord(wrapper, "δῶρον");
    const first = shownQuestion(wrapper, DORON);
    const firstWrong = aWrongCell(first);

    await click(wrapper, firstWrong);
    await answerCorrectly(wrapper, first);
    await nextQuestion(wrapper);

    const second = shownQuestion(wrapper, DORON);
    expect(second.q).not.toBe(first.q);
    const secondWrong = aWrongCell(second);
    await click(wrapper, secondWrong);
    await answerCorrectly(wrapper, second);

    const secondMiss = loadMisses().find((miss) => miss.question === second.q);
    expect(secondMiss?.given).toBe(cellName(secondWrong));
  });

  test("clears the missed answers list when the word changes", async () => {
    const wrapper = mountGame();
    await pickWord(wrapper, "λόγος");
    const question = shownQuestion(wrapper, LOGOS);

    await click(wrapper, aWrongCell(question));
    await answerCorrectly(wrapper, question);
    expect(wrapper.get(".missed-answers summary").text()).toBe("Missed answers (1)");

    await wrapper.get("button.change-btn").trigger("click");
    await pickWord(wrapper, "δῶρον");

    expect(wrapper.find(".missed-answers").exists()).toBe(false);
  });
});
