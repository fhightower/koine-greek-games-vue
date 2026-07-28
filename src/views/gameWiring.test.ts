import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, test } from "vitest";
import type { Question } from "../types/nominalForms";
import { eimiForms } from "../data/eimiForms";
import { firstDeclensionWords } from "../data/firstDeclensionWords";
import { luoActiveForms } from "../data/luoActiveForms";
import { secondDeclensionWords } from "../data/secondDeclensionWords";
import { gameLabel } from "../utils/gameLabels";
import { loadMisses } from "../utils/missLog";
import EimiForms from "./EimiForms.vue";
import FirstDeclensionFlashCards from "./FirstDeclensionFlashCards.vue";
import SecondDeclensionFlashCards from "./SecondDeclensionFlashCards.vue";
import VerbEndingsLuoActive from "./VerbEndingsLuoActive.vue";

// These four views only wire data and a game id into a shared component. The
// logic lives in the component's own tests; what can break here is the wiring —
// and a wrong game id shows up as a raw id in the review list.

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

/** Picks the first word, misses one cell, then finishes so the miss is logged. */
async function missAFlashCard(wrapper: Wrapper, words: { questions: Question[] }[]) {
  await wrapper.findAll("button.word-btn")[0]!.trigger("click");
  const shown = wrapper.get("h3 b").text();
  const question = words[0]!.questions.find((q) => q.q === shown);
  if (!question) {
    throw new Error(`Unknown question rendered: ${shown}`);
  }

  const wrong = aWrongCell(question);
  await wrapper.get(`button.${wrong.gender}.${wrong.number}.${wrong.case_}`).trigger("click");
  for (const cell of correctCells(question)) {
    await wrapper.get(`button.${cell.gender}.${cell.number}.${cell.case_}`).trigger("click");
  }
  return shown;
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

    expect(wrapper.findAll("button.word-btn").map((b) => b.text())).toHaveLength(
      firstDeclensionWords.length,
    );

    const shown = await missAFlashCard(wrapper, firstDeclensionWords);

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

    expect(wrapper.findAll("button.word-btn").map((b) => b.text())).toHaveLength(
      secondDeclensionWords.length,
    );

    const shown = await missAFlashCard(wrapper, secondDeclensionWords);

    expect(loadMisses()[0]).toMatchObject({
      gameId: "second-declension-flash-cards",
      question: shown,
    });
    expect(gameLabel("second-declension-flash-cards")).not.toBe("second-declension-flash-cards");
  });
});
