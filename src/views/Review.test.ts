import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, test } from "vitest";
import { loadMisses, type MissEntry } from "../utils/missLog";
import { loadAnswerStats, saveAnswerStats } from "../utils/performanceStats";
import Review from "./Review.vue";

function seed(misses: Partial<MissEntry>[]) {
  const entries = misses.map((miss, i) => ({
    gameId: "verb-voice",
    question: `q${i}`,
    given: "Active",
    answer: "Passive",
    at: 1_000_000 + i,
    ...miss,
  }));
  window.localStorage.setItem("koine:miss-log:v1", JSON.stringify(entries));
  return entries;
}

function button(wrapper: ReturnType<typeof mount>, label: string) {
  const found = wrapper.findAll("button").find((b) => b.text() === label);
  if (!found) {
    throw new Error(`No "${label}" button rendered`);
  }
  return found;
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("Review", () => {
  test("lists the stored misses newest first", () => {
    seed([
      { question: "older", at: 1000 },
      { question: "newer", at: 2000 },
    ]);

    const wrapper = mount(Review);

    expect(wrapper.findAll(".miss__question").map((q) => q.text())).toEqual(["newer", "older"]);
  });

  test("collapses a repeatedly-missed question into one row with a count", () => {
    seed([
      { question: "λύεται", given: "active", at: 1000 },
      { question: "λύεται", given: "middle", at: 2000 },
    ]);

    const wrapper = mount(Review);

    expect(wrapper.findAll(".miss__question").map((q) => q.text())).toEqual(["λύεται"]);
    expect(wrapper.get(".miss__count").text()).toBe("missed 2×");
    expect(wrapper.get(".miss__given").text()).toBe("middle");
  });

  test("shows no count badge for a question missed once", () => {
    seed([{ question: "λύεται" }]);

    const wrapper = mount(Review);

    expect(wrapper.find(".miss__count").exists()).toBe(false);
  });

  test("names each miss's game", () => {
    seed([{ gameId: "lesson-3-translation" }]);

    const wrapper = mount(Review);

    expect(wrapper.get(".miss__game").text()).toBe("Lesson III — Translation");
  });

  test("offers a filter only for games with a stored miss", () => {
    seed([{ gameId: "verb-voice" }, { gameId: "prepositions", question: "ἀπό" }]);

    const wrapper = mount(Review);

    expect(wrapper.findAll("option").map((o) => o.text())).toEqual([
      "All games",
      "Prepositions",
      "Verb Voice",
    ]);
  });

  test("narrows the list to the chosen game", async () => {
    seed([{ gameId: "verb-voice", question: "voiced" }, { gameId: "prepositions", question: "ἀπό" }]);
    const wrapper = mount(Review);

    await wrapper.get("select").setValue("prepositions");

    expect(wrapper.findAll(".miss__question").map((q) => q.text())).toEqual(["ἀπό"]);
  });

  test("says so when nothing has been missed", () => {
    const wrapper = mount(Review);

    expect(wrapper.get(".review__empty").text()).toContain("Nothing missed yet");
  });

  test("keeps everything when Clear all is clicked but not confirmed", async () => {
    seed([{}]);
    saveAnswerStats({ "verb-voice|q0": { seen: 1, correct: 0 } });
    const wrapper = mount(Review);

    await button(wrapper, "Clear all").trigger("click");

    expect(wrapper.get(".review__confirm").text()).toContain("Delete every stored miss");
    expect(loadMisses()).toHaveLength(1);
    expect(loadAnswerStats()).not.toEqual({});
  });

  test("keeps everything when the confirmation is cancelled", async () => {
    seed([{}]);
    const wrapper = mount(Review);
    await button(wrapper, "Clear all").trigger("click");

    await button(wrapper, "Cancel").trigger("click");

    expect(loadMisses()).toHaveLength(1);
    expect(wrapper.findAll("button").map((b) => b.text())).toContain("Clear all");
  });

  test("wipes both the misses and the counts once confirmed", async () => {
    seed([{}]);
    saveAnswerStats({ "verb-voice|q0": { seen: 1, correct: 0 } });
    const wrapper = mount(Review);
    await button(wrapper, "Clear all").trigger("click");

    await button(wrapper, "Yes, clear").trigger("click");

    expect(loadMisses()).toEqual([]);
    expect(loadAnswerStats()).toEqual({});
    expect(wrapper.get(".review__empty").text()).toContain("Nothing missed yet");
  });
});

describe("Review focus panel", () => {
  function focusRow(wrapper: ReturnType<typeof mount>, label: string) {
    const row = wrapper.findAll(".focus-game").find((r) => r.text().includes(label));
    if (!row) {
      throw new Error(`No focus row for "${label}"`);
    }
    return row;
  }

  test("lists each game with a miss and its distinct-question count", () => {
    seed([
      { gameId: "verb-voice", question: "one" },
      { gameId: "verb-voice", question: "two" },
      { gameId: "prepositions", question: "ἀπό" },
    ]);

    const wrapper = mount(Review);

    expect(focusRow(wrapper, "Verb Voice").text()).toContain("2");
    expect(focusRow(wrapper, "Prepositions").text()).toContain("1");
  });

  test("counts a repeatedly-missed question once", () => {
    seed([
      { gameId: "verb-voice", question: "same", at: 1000 },
      { gameId: "verb-voice", question: "same", at: 2000 },
    ]);

    const wrapper = mount(Review);

    expect(focusRow(wrapper, "Verb Voice").text()).toContain("1");
  });

  test("has no focus launch until a game is checked", () => {
    seed([{ gameId: "verb-voice", question: "one" }]);

    const wrapper = mount(Review);

    expect(wrapper.find("a.focus-launch").exists()).toBe(false);
  });

  test("links the launch to the checked games with the question total", async () => {
    seed([
      { gameId: "verb-voice", question: "one" },
      { gameId: "verb-voice", question: "two" },
      { gameId: "prepositions", question: "ἀπό" },
    ]);
    const wrapper = mount(Review);

    await focusRow(wrapper, "Verb Voice").get("input[type=checkbox]").setValue(true);

    const launch = wrapper.get("a.focus-launch");
    expect(launch.attributes("href")).toBe("#/focus?games=verb-voice");
    expect(launch.text()).toContain("2");
  });

  test("select-all checks every game and links them all", async () => {
    seed([
      { gameId: "verb-voice", question: "one" },
      { gameId: "prepositions", question: "ἀπό" },
    ]);
    const wrapper = mount(Review);

    await wrapper.get(".focus-all input[type=checkbox]").setValue(true);

    const launch = wrapper.get("a.focus-launch");
    expect(launch.attributes("href")).toBe("#/focus?games=prepositions,verb-voice");
    expect(launch.text()).toContain("2");
  });

  test("shows no focus panel when nothing has been missed", () => {
    const wrapper = mount(Review);

    expect(wrapper.find(".focus-panel").exists()).toBe(false);
  });
});
