import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, test } from "vitest";
import { loadMisses } from "../utils/missLog";
import { loadAnswerStats } from "../utils/performanceStats";
import Prepositions from "./Prepositions.vue";

type Case = "genitive" | "dative" | "accusative";
const CASES: Case[] = ["genitive", "dative", "accusative"];

type Wrapper = ReturnType<typeof mount>;

// The preposition is picked at random, so read what it wants off the component
// rather than hard-coding which one is on screen.
function state(wrapper: Wrapper) {
  return wrapper.vm as unknown as {
    current: { word: string; uses: { case_: Case; meaning: string }[] };
    correctCases: Case[];
  };
}

function button(wrapper: Wrapper, case_: Case) {
  const found = wrapper.findAll("button.cell").find((b) => b.text() === case_);
  if (!found) {
    throw new Error(`No ${case_} button rendered`);
  }
  return found;
}

async function nextQuestion(wrapper: Wrapper) {
  await wrapper.get("button.next").trigger("click");
}

/** Clicks Next until the game lands on a preposition governing `count` cases. */
async function untilUsesCount(wrapper: Wrapper, count: number) {
  for (let i = 0; i < 100; i++) {
    if (state(wrapper).current.uses.length === count) {
      return;
    }
    // Only a finished question offers Next, so answer this one first.
    for (const case_ of state(wrapper).correctCases) {
      await button(wrapper, case_).trigger("click");
    }
    await nextQuestion(wrapper);
  }
  throw new Error(`No preposition with ${count} cases came up`);
}

function wrongCases(correct: Case[]): Case[] {
  return CASES.filter((case_) => !correct.includes(case_));
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("Prepositions", () => {
  test("waits for every case a preposition governs before grading it", async () => {
    const wrapper = mount(Prepositions);
    await untilUsesCount(wrapper, 2);
    window.localStorage.clear();
    const { correctCases, current } = state(wrapper);

    await button(wrapper, correctCases[0]!).trigger("click");

    expect(wrapper.get(".prep__message").text()).toBe("Correct! 1 more case to find.");
    expect(wrapper.find(".prep__feedback").exists()).toBe(false);
    expect(loadAnswerStats()).toEqual({});

    await button(wrapper, correctCases[1]!).trigger("click");

    expect(wrapper.get(".prep__verdict").text()).toBe("Correct!");
    expect(loadAnswerStats()[`prepositions|${current.word}`]).toEqual({ seen: 1, correct: 1 });
    expect(loadMisses()).toEqual([]);
  });

  test("logs every wrong case picked along the way, with all the right ones", async () => {
    const wrapper = mount(Prepositions);
    const { correctCases, current } = state(wrapper);
    const wrong = wrongCases(correctCases);

    for (const case_ of wrong) {
      await button(wrapper, case_).trigger("click");
    }
    for (const case_ of correctCases) {
      await button(wrapper, case_).trigger("click");
    }

    expect(loadMisses()).toEqual([
      {
        gameId: "prepositions",
        question: current.word,
        given: wrong.join(", "),
        answer: correctCases.join(", "),
        at: expect.any(Number),
      },
    ]);
    expect(wrapper.get(".prep__verdict").text()).toBe("Got there!");
  });

  test("does not carry wrong picks over into the next preposition", async () => {
    const wrapper = mount(Prepositions);
    const first = state(wrapper);
    const firstWrong = wrongCases(first.correctCases);

    await button(wrapper, firstWrong[0]!).trigger("click");
    for (const case_ of first.correctCases) {
      await button(wrapper, case_).trigger("click");
    }
    await nextQuestion(wrapper);

    const second = state(wrapper);
    const secondWrong = wrongCases(second.correctCases);
    await button(wrapper, secondWrong[0]!).trigger("click");
    for (const case_ of second.correctCases) {
      await button(wrapper, case_).trigger("click");
    }

    const miss = loadMisses().find((m) => m.question === second.current.word);
    expect(miss?.given).toBe(secondWrong[0]);
  });

  test("ignores a case already found, so it is graded once", async () => {
    const wrapper = mount(Prepositions);
    await untilUsesCount(wrapper, 2);
    window.localStorage.clear();
    const { correctCases, current } = state(wrapper);

    await button(wrapper, correctCases[0]!).trigger("click");
    await button(wrapper, correctCases[0]!).trigger("click");

    expect(wrapper.find(".prep__feedback").exists()).toBe(false);
    expect(loadAnswerStats()[`prepositions|${current.word}`]).toBeUndefined();
  });
});
