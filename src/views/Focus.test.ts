import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, test } from "vitest";
import { loadMisses, type MissEntry } from "../utils/missLog";
import Focus from "./Focus.vue";

function seed(misses: Partial<MissEntry>[]) {
  const entries = misses.map((miss, i) => ({
    gameId: "verb-voice",
    question: `q${i}`,
    given: "active",
    answer: `a${i}`,
    at: 1_000_000 + i,
    ...miss,
  }));
  window.localStorage.setItem("koine:miss-log:v1", JSON.stringify(entries));
  return entries;
}

function mountFocus(games: string) {
  return mount(Focus, { props: { games } });
}

function button(wrapper: ReturnType<typeof mountFocus>, label: string) {
  const found = wrapper.findAll("button").find((b) => b.text() === label);
  if (!found) {
    throw new Error(`No "${label}" button rendered`);
  }
  return found;
}

async function reveal(wrapper: ReturnType<typeof mountFocus>) {
  await button(wrapper, "Reveal answer").trigger("click");
}

async function answer(wrapper: ReturnType<typeof mountFocus>, gotIt: boolean) {
  await reveal(wrapper);
  await button(wrapper, gotIt ? "I got it" : "Missed it").trigger("click");
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("Focus", () => {
  test("shows an empty state when the chosen game has no misses", () => {
    const wrapper = mountFocus("prepositions");

    expect(wrapper.get(".focus__empty").text()).toContain("Nothing to focus on");
  });

  test("shows the first missed question and its game", () => {
    seed([{ gameId: "verb-voice", question: "λύεται", answer: "passive" }]);

    const wrapper = mountFocus("verb-voice");

    expect(wrapper.get(".focus__question").text()).toBe("λύεται");
    expect(wrapper.get(".focus__game").text()).toBe("Verb Voice");
  });

  test("hides the answer until it is revealed", async () => {
    seed([{ question: "λύεται", answer: "passive" }]);
    const wrapper = mountFocus("verb-voice");

    expect(wrapper.find(".focus__answer").exists()).toBe(false);
    await reveal(wrapper);

    expect(wrapper.get(".focus__answer").text()).toBe("passive");
  });

  test("retires a question after two correct answers in a row", async () => {
    seed([{ question: "solo", answer: "done" }]);
    const wrapper = mountFocus("verb-voice");

    await answer(wrapper, true);
    expect(wrapper.find(".focus__done").exists()).toBe(false);

    await answer(wrapper, true);
    expect(wrapper.get(".focus__done").text()).toContain("1");
  });

  test("keeps a question in the session when it is missed", async () => {
    seed([{ question: "solo", answer: "done" }]);
    const wrapper = mountFocus("verb-voice");

    await answer(wrapper, true); // streak 1
    await answer(wrapper, false); // reset

    expect(wrapper.find(".focus__done").exists()).toBe(false);
    expect(wrapper.get(".focus__question").text()).toBe("solo");
  });

  test("drills questions from every chosen game", () => {
    seed([
      { gameId: "verb-voice", question: "λύεται", answer: "passive", at: 1000 },
      { gameId: "prepositions", question: "ἐν", answer: "dative", at: 2000 },
    ]);

    const wrapper = mountFocus("verb-voice,prepositions");

    expect(wrapper.get(".focus__remaining").text()).toContain("2");
  });

  test("treats games=all as every game with a miss", () => {
    seed([
      { gameId: "verb-voice", question: "λύεται", answer: "passive", at: 1000 },
      { gameId: "prepositions", question: "ἐν", answer: "dative", at: 2000 },
    ]);

    const wrapper = mountFocus("all");

    expect(wrapper.get(".focus__remaining").text()).toContain("2");
  });

  test("never writes to the miss log while drilling", async () => {
    seed([{ question: "solo", answer: "done" }]);
    const before = loadMisses();
    const wrapper = mountFocus("verb-voice");

    await answer(wrapper, false);
    await answer(wrapper, true);

    expect(loadMisses()).toEqual(before);
  });
});
