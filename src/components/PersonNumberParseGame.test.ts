import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, test } from "vitest";
import type { GrammaticalNumber, Person } from "../data/luoMiddlePassiveForms";
import { loadMisses } from "../utils/missLog";
import { loadAnswerStats } from "../utils/performanceStats";
import PersonNumberParseGame from "./PersonNumberParseGame.vue";

// Fixture forms rather than real data, so the test controls both which cell is
// right and — with exactly two forms — where "Next" has to land.
const FORMS = [
  {
    form: "λύομαι",
    ending: "-ομαι",
    person: 1 as Person,
    number: "singular" as GrammaticalNumber,
    glossLines: ["I loose for myself"],
  },
  {
    form: "λύονται",
    ending: "-ονται",
    person: 3 as Person,
    number: "plural" as GrammaticalNumber,
    glossLines: ["they loose for themselves"],
  },
];

const GAME_ID = "test-parse-game";
const PERSON_LABELS: Record<Person, string> = { 1: "1st", 2: "2nd", 3: "3rd" };

function mountGame() {
  const wrapper = mount(PersonNumberParseGame, {
    props: { gameId: GAME_ID, prompt: "Parse this form", forms: FORMS },
  });
  return { wrapper, form: shownForm(wrapper) };
}

function shownForm(wrapper: ReturnType<typeof mount>) {
  const text = wrapper.get(".luo__form").text();
  const form = FORMS.find((f) => f.form === text);
  if (!form) {
    throw new Error(`Unknown form rendered: ${text}`);
  }
  return form;
}

/** The grid is laid out 1st/2nd/3rd person by singular/plural. */
function cell(wrapper: ReturnType<typeof mount>, person: Person, number: GrammaticalNumber) {
  const index = (person - 1) * 2 + (number === "singular" ? 0 : 1);
  const button = wrapper.findAll("button.cell")[index];
  if (!button) {
    throw new Error(`No cell for ${person} ${number}`);
  }
  return button;
}

function aWrongCell(form: (typeof FORMS)[number]) {
  const person: Person = form.person === 1 ? 2 : 1;
  const number: GrammaticalNumber = form.number === "singular" ? "plural" : "singular";
  return { person, number };
}

function answerText(person: Person, number: GrammaticalNumber) {
  return `${PERSON_LABELS[person]} ${number}`;
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("PersonNumberParseGame", () => {
  test("logs the cell picked and the cell wanted when the answer is wrong", async () => {
    const { wrapper, form } = mountGame();
    const wrong = aWrongCell(form);

    await cell(wrapper, wrong.person, wrong.number).trigger("click");

    expect(loadMisses()).toEqual([
      {
        gameId: GAME_ID,
        question: form.form,
        given: answerText(wrong.person, wrong.number),
        answer: answerText(form.person, form.number),
        at: expect.any(Number),
      },
    ]);
    expect(wrapper.get(".luo__verdict").text()).toBe("Not quite.");
  });

  test("logs nothing when the answer is right", async () => {
    const { wrapper, form } = mountGame();

    await cell(wrapper, form.person, form.number).trigger("click");

    expect(loadMisses()).toEqual([]);
    expect(loadAnswerStats()[`${GAME_ID}|${form.form}`]).toEqual({ seen: 1, correct: 1 });
    expect(wrapper.get(".luo__verdict").text()).toBe("Correct!");
  });

  test("records only the first pick, since the answer locks in", async () => {
    const { wrapper, form } = mountGame();
    const wrong = aWrongCell(form);

    await cell(wrapper, wrong.person, wrong.number).trigger("click");
    await cell(wrapper, form.person, form.number).trigger("click");

    expect(loadMisses()).toHaveLength(1);
    expect(loadAnswerStats()[`${GAME_ID}|${form.form}`]).toEqual({ seen: 1, correct: 0 });
  });

  test("moves to a different form and reopens the grid on next", async () => {
    const { wrapper, form } = mountGame();

    await cell(wrapper, form.person, form.number).trigger("click");
    await wrapper.get("button.next").trigger("click");

    const next = shownForm(wrapper);
    expect(next.form).not.toBe(form.form);
    expect(wrapper.findAll("button.cell").every((c) => !c.attributes("disabled"))).toBe(true);
    expect(wrapper.find(".luo__verdict").exists()).toBe(false);
  });

  test("keeps every missed form in the missed answers list", async () => {
    const { wrapper, form } = mountGame();

    const firstWrong = aWrongCell(form);
    await cell(wrapper, firstWrong.person, firstWrong.number).trigger("click");
    await wrapper.get("button.next").trigger("click");
    const second = shownForm(wrapper);
    const secondWrong = aWrongCell(second);
    await cell(wrapper, secondWrong.person, secondWrong.number).trigger("click");

    expect(wrapper.get(".missed summary").text()).toBe("Missed answers (2)");
    const missed = wrapper.findAll(".missed li").map((li) => li.text());
    expect(missed[0]).toContain(form.form);
    expect(missed[1]).toContain(second.form);
  });
});
