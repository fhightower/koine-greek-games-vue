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
