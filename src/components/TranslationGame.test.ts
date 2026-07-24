import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, test } from "vitest";
import { loadMisses } from "../utils/missLog";
import { loadAnswerStats } from "../utils/performanceStats";
import TranslationGame from "./TranslationGame.vue";

const SENTENCES = [{ greek: "λαμβάνομεν τὸ δῶρον", english: "we take the gift" }];

function mountGame() {
  return mount(TranslationGame, {
    props: { gameId: "lesson-3-translation", title: "Lesson III", sentences: SENTENCES },
  });
}

function button(wrapper: ReturnType<typeof mountGame>, label: string) {
  const found = wrapper.findAll("button").find((b) => b.text() === label);
  if (!found) {
    throw new Error(`No "${label}" button rendered`);
  }
  return found;
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("TranslationGame", () => {
  test("logs the typed attempt against the model translation", async () => {
    const wrapper = mountGame();
    await wrapper.get("textarea").setValue("they take the gift");
    await button(wrapper, "Reveal answer").trigger("click");

    await button(wrapper, "Missed it").trigger("click");

    expect(loadMisses()).toEqual([
      {
        gameId: "lesson-3-translation",
        question: "λαμβάνομεν τὸ δῶρον",
        given: "they take the gift",
        answer: "we take the gift",
        at: expect.any(Number),
      },
    ]);
  });

  test("still logs the miss when nothing was typed", async () => {
    const wrapper = mountGame();
    await button(wrapper, "Reveal answer").trigger("click");

    await button(wrapper, "Missed it").trigger("click");

    expect(loadMisses()).toHaveLength(1);
    expect(loadMisses()[0]?.given).toBe("");
  });

  test("trims surrounding whitespace off the attempt", async () => {
    const wrapper = mountGame();
    await wrapper.get("textarea").setValue("  they take the gift\n");
    await button(wrapper, "Reveal answer").trigger("click");

    await button(wrapper, "Missed it").trigger("click");

    expect(loadMisses()[0]?.given).toBe("they take the gift");
  });

  test("logs nothing when graded as correct", async () => {
    const wrapper = mountGame();
    await wrapper.get("textarea").setValue("we take the gift");
    await button(wrapper, "Reveal answer").trigger("click");

    await button(wrapper, "I got it").trigger("click");

    expect(loadMisses()).toEqual([]);
    expect(loadAnswerStats()["lesson-3-translation|λαμβάνομεν τὸ δῶρον"]).toEqual({
      seen: 1,
      correct: 1,
    });
  });
});
