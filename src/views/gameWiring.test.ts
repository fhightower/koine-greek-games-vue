import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, test } from "vitest";
import type { Question } from "../types/nominalForms";
import DeclensionFlashCards from "../components/DeclensionFlashCards.vue";
import NominalFormsCheatSheetModal from "../components/NominalFormsCheatSheetModal.vue";
import {
  firstDeclensionCheatSheetEntries,
  secondDeclensionCheatSheetEntries,
} from "../data/declensionEndingCheatSheetEntries";
import { eimiForms } from "../data/eimiForms";
import { firstDeclensionWords } from "../data/firstDeclensionWords";
import { luoActiveForms } from "../data/luoActiveForms";
import { secondDeclensionWords } from "../data/secondDeclensionWords";
import { gameLabel } from "../utils/gameLabels";
import { loadMisses } from "../utils/missLog";
import AdjectiveAgathos from "./AdjectiveAgathos.vue";
import Demonstratives from "./Demonstratives.vue";
import EimiForms from "./EimiForms.vue";
import FirstDeclensionFlashCards from "./FirstDeclensionFlashCards.vue";
import SecondDeclensionFlashCards from "./SecondDeclensionFlashCards.vue";
import VerbEndingsLuoActive from "./VerbEndingsLuoActive.vue";

// Views whose logic is tested elsewhere — either in the shared component they
// wrap, or, for the two grid games, in DefiniteArticles1.test.ts against the
// same code. What can still break here is the wiring, and a wrong game id shows
// up as a raw id in the review list.

type Wrapper = ReturnType<typeof mount>;
type Cell = { gender: string; number: string; case_: string };

const CASES = ["nominative", "genitive", "dative", "accusative", "vocative"];

/** Answers the parse grid wrongly, whichever form came up. */
async function missTheParse(wrapper: Wrapper) {
  const shown = wrapper.get(".luo__form").text();
  // Always click 1st singular; when that happens to be right, move on and try
  // the next form, which the game guarantees is a different one.
  await wrapper.findAll("button.cell")[0]!.trigger("click");
  if (wrapper.get(".luo__verdict").text() === "Correct!") {
    await wrapper.get("button.next").trigger("click");
    return missTheParse(wrapper);
  }
  return shown;
}

function correctCells(question: Question): Cell[] {
  return question.a.genders.flatMap((gender) =>
    question.a.cases.map((case_) => ({ gender, number: question.a.number, case_ })),
  );
}

function aWrongCell(question: Question): Cell {
  const taken = new Set(
    correctCells(question).map((c) => `${c.gender} ${c.number} ${c.case_}`),
  );
  for (const gender of ["masculine", "feminine", "neuter"]) {
    for (const number of ["singular", "plural"]) {
      for (const case_ of CASES) {
        const candidate = { gender, number, case_ };
        if (!taken.has(`${gender} ${number} ${case_}`)) {
          return candidate;
        }
      }
    }
  }
  throw new Error("Every cell is correct — no wrong cell to click");
}

/** The cheat sheet only renders once opened, so check what it was handed. */
function cheatSheet(wrapper: Wrapper) {
  return wrapper.findComponent(NominalFormsCheatSheetModal).props();
}

function wordsOffered(wrapper: Wrapper) {
  return wrapper.findAll("button.word-btn").map((b) => b.get(".greek").text());
}

/** The question on screen, read off the component so look-alike forms cannot confuse it. */
function currentQuestion(vm: unknown): Question {
  const { questions, currentQuestionIndex } = vm as {
    questions: Question[];
    currentQuestionIndex: number;
  };
  const question = questions[currentQuestionIndex];
  if (!question) {
    throw new Error("No question on screen");
  }
  return question;
}

/** Misses one cell of the question on screen, then finishes so the miss is logged. */
async function missTheGrid(wrapper: Wrapper, question: Question) {
  const wrong = aWrongCell(question);
  await wrapper.get(`button.${wrong.gender}.${wrong.number}.${wrong.case_}`).trigger("click");
  for (const cell of correctCells(question)) {
    await wrapper.get(`button.${cell.gender}.${cell.number}.${cell.case_}`).trigger("click");
  }
}

/** Picks the first word, misses one cell, then finishes so the miss is logged. */
async function missAFlashCard(wrapper: Wrapper) {
  await wrapper.findAll("button.word-btn")[0]!.trigger("click");
  // Read the question off the component. Two forms of a word can share a
  // spelling — ἀληθείας is both genitive singular and accusative plural — so
  // looking one up by what is on screen can find the wrong one.
  // Read the question off the component. Two forms of a word can share a
  // spelling — ἀληθείας is both genitive singular and accusative plural — so
  // looking one up by what is on screen can find the wrong one.
  const question = currentQuestion(wrapper.findComponent(DeclensionFlashCards).vm);
  await missTheGrid(wrapper, question);
  return question.q;
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("EimiForms", () => {
  test("plays the εἰμί forms under a labelled game id", async () => {
    const wrapper = mount(EimiForms);

    const shown = await missTheParse(wrapper);

    expect(eimiForms.map((f) => f.form)).toContain(shown);
    expect(loadMisses()[0]?.gameId).toBe("eimi-forms");
    expect(gameLabel("eimi-forms")).not.toBe("eimi-forms");
  });
});

describe("VerbEndingsLuoActive", () => {
  test("plays the λύω active forms under a labelled game id", async () => {
    const wrapper = mount(VerbEndingsLuoActive);

    const shown = await missTheParse(wrapper);

    expect(luoActiveForms.map((f) => f.form)).toContain(shown);
    expect(loadMisses()[0]?.gameId).toBe("luo-active-endings");
    expect(gameLabel("luo-active-endings")).not.toBe("luo-active-endings");
  });
});

describe("FirstDeclensionFlashCards", () => {
  test("offers every first declension word under a labelled game id", async () => {
    const wrapper = mount(FirstDeclensionFlashCards);

    expect(wordsOffered(wrapper)).toEqual(firstDeclensionWords.map((w) => w.nominativeSingular));
    expect(cheatSheet(wrapper)).toMatchObject({
      title: "First Declension Endings",
      entries: firstDeclensionCheatSheetEntries,
    });

    const shown = await missAFlashCard(wrapper);

    expect(loadMisses()[0]).toMatchObject({
      gameId: "first-declension-flash-cards",
      question: shown,
    });
    expect(gameLabel("first-declension-flash-cards")).not.toBe("first-declension-flash-cards");
  });
});

describe("SecondDeclensionFlashCards", () => {
  test("offers every second declension word under a labelled game id", async () => {
    const wrapper = mount(SecondDeclensionFlashCards);

    expect(wordsOffered(wrapper)).toEqual(secondDeclensionWords.map((w) => w.nominativeSingular));
    expect(cheatSheet(wrapper)).toMatchObject({
      title: "Second Declension Endings",
      entries: secondDeclensionCheatSheetEntries,
    });

    const shown = await missAFlashCard(wrapper);

    expect(loadMisses()[0]).toMatchObject({
      gameId: "second-declension-flash-cards",
      question: shown,
    });
    expect(gameLabel("second-declension-flash-cards")).not.toBe("second-declension-flash-cards");
  });
});

describe("AdjectiveAgathos", () => {
  test("logs ἀγαθός misses under a labelled game id", async () => {
    const wrapper = mount(AdjectiveAgathos);
    const question = currentQuestion(wrapper.vm);

    await missTheGrid(wrapper, question);

    expect(loadMisses()[0]).toMatchObject({
      gameId: "adjective-agathos",
      question: question.q,
    });
    expect(gameLabel("adjective-agathos")).not.toBe("adjective-agathos");
  });
});

describe("Demonstratives", () => {
  test("logs demonstrative misses under a labelled game id", async () => {
    const wrapper = mount(Demonstratives);
    const question = currentQuestion(wrapper.vm);

    await missTheGrid(wrapper, question);

    expect(loadMisses()[0]).toMatchObject({
      gameId: "demonstratives",
      question: question.q,
    });
    expect(gameLabel("demonstratives")).not.toBe("demonstratives");
  });
});
