import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, test } from "vitest";
import {
  luoMiddlePassiveForms,
  type GrammaticalNumber,
  type Person,
} from "../data/luoMiddlePassiveForms";
import { loadMisses } from "../utils/missLog";
import { loadAnswerStats } from "../utils/performanceStats";
import VerbEndingsLuo from "./VerbEndingsLuo.vue";

const PERSON_LABELS: Record<Person, string> = { 1: "1st", 2: "2nd", 3: "3rd" };

type Wrapper = ReturnType<typeof mount>;

// The form is picked at random; find whichever one it showed.
function shownForm(wrapper: Wrapper) {
  const text = wrapper.get(".luo__form").text();
  const form = luoMiddlePassiveForms.find((f) => f.form === text);
  if (!form) {
    throw new Error(`Unknown form rendered: ${text}`);
  }
  return form;
}

/** The grid is laid out 1st/2nd/3rd person by singular/plural. */
function cell(wrapper: Wrapper, person: Person, number: GrammaticalNumber) {
  const index = (person - 1) * 2 + (number === "singular" ? 0 : 1);
  const button = wrapper.findAll("button.cell")[index];
  if (!button) {
    throw new Error(`No cell for ${person} ${number}`);
  }
  return button;
}

function aWrongCell(form: { person: Person; number: GrammaticalNumber }) {
  return {
    person: (form.person === 1 ? 2 : 1) as Person,
    number: (form.number === "singular" ? "plural" : "singular") as GrammaticalNumber,
  };
}

function parseText(person: Person, number: GrammaticalNumber) {
  return `${PERSON_LABELS[person]} ${number}`;
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("VerbEndingsLuo", () => {
  test("logs the cell picked and the cell wanted when the answer is wrong", async () => {
    const wrapper = mount(VerbEndingsLuo);
    const form = shownForm(wrapper);
    const wrong = aWrongCell(form);

    await cell(wrapper, wrong.person, wrong.number).trigger("click");

    expect(loadMisses()).toEqual([
      {
        gameId: "luo-endings",
        question: form.form,
        given: parseText(wrong.person, wrong.number),
        answer: parseText(form.person, form.number),
        at: expect.any(Number),
      },
    ]);
    expect(wrapper.get(".missed summary").text()).toBe("Missed answers (1)");
  });

  test("logs nothing when the answer is right", async () => {
    const wrapper = mount(VerbEndingsLuo);
    const form = shownForm(wrapper);

    await cell(wrapper, form.person, form.number).trigger("click");

    expect(loadMisses()).toEqual([]);
    expect(loadAnswerStats()[`luo-endings|${form.form}`]).toEqual({ seen: 1, correct: 1 });
  });

  test("records only the first pick, since the answer locks in", async () => {
    const wrapper = mount(VerbEndingsLuo);
    const form = shownForm(wrapper);
    const wrong = aWrongCell(form);

    await cell(wrapper, wrong.person, wrong.number).trigger("click");
    await cell(wrapper, form.person, form.number).trigger("click");

    expect(loadMisses()).toHaveLength(1);
    expect(loadAnswerStats()[`luo-endings|${form.form}`]).toEqual({ seen: 1, correct: 0 });
  });

  test("moves to a different form and reopens the grid on next", async () => {
    const wrapper = mount(VerbEndingsLuo);
    const form = shownForm(wrapper);

    await cell(wrapper, form.person, form.number).trigger("click");
    await wrapper.get("button.next").trigger("click");

    expect(shownForm(wrapper).form).not.toBe(form.form);
    expect(wrapper.findAll("button.cell").every((c) => !c.attributes("disabled"))).toBe(true);
  });
});
