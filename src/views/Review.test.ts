import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, test } from "vitest";
import { loadFlags, type FlagEntry } from "../utils/flagLog";
import { flagIssueUrl } from "../utils/flagReport";
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

describe("Review flag list", () => {
  function seedFlags(flags: Partial<FlagEntry>[]) {
    const entries = flags.map((flag, i) => ({
      gameId: "verb-voice",
      question: `q${i}`,
      answer: "Active",
      reason: "wrong-answer" as FlagEntry["reason"],
      note: "",
      at: 2_000_000 + i,
      ...flag,
    }));
    window.localStorage.setItem("koine:flag-log:v1", JSON.stringify(entries));
    return entries;
  }

  test("shows no flag panel until something is flagged", () => {
    const wrapper = mount(Review);

    expect(wrapper.find(".flags").exists()).toBe(false);
  });

  test("lists each flagged question with its game and expected answer", () => {
    seedFlags([{ question: "λαμβάνομεν", answer: "we take" }]);

    const wrapper = mount(Review);

    const row = wrapper.get(".flagged");
    expect(row.text()).toContain("λαμβάνομεν");
    expect(row.text()).toContain("Verb Voice");
    expect(row.text()).toContain("we take");
    expect(row.text()).toContain("The expected answer is wrong");
  });

  test("shows the note when the player left one", () => {
    seedFlags([{ note: "Machen glosses this as receive" }]);

    const wrapper = mount(Review);

    expect(wrapper.get(".flagged").text()).toContain("Machen glosses this as receive");
  });

  test("offers each flag the same prefilled issue the game did", () => {
    const [flag] = seedFlags([{}]);

    const wrapper = mount(Review);

    expect(wrapper.get(".flagged a.flag-send").attributes("href")).toBe(flagIssueUrl(flag!));
  });

  test("removes one flag without touching the others", async () => {
    seedFlags([{ question: "keep me" }, { question: "drop me" }]);
    const wrapper = mount(Review);
    const dropRow = wrapper.findAll(".flagged").find((row) => row.text().includes("drop me"))!;

    await dropRow.findAll("button").find((b) => b.text() === "Remove")!.trigger("click");

    expect(loadFlags().map((flag) => flag.question)).toEqual(["keep me"]);
    expect(wrapper.findAll(".flagged")).toHaveLength(1);
  });

  test("wipes the flags along with the misses once a clear is confirmed", async () => {
    seed([{}]);
    seedFlags([{}]);
    const wrapper = mount(Review);
    await button(wrapper, "Clear all").trigger("click");

    await button(wrapper, "Yes, clear").trigger("click");

    expect(loadFlags()).toEqual([]);
    expect(wrapper.find(".flags").exists()).toBe(false);
  });

  test("can still clear when there are flags but nothing missed", async () => {
    seedFlags([{}]);
    const wrapper = mount(Review);

    await button(wrapper, "Clear all").trigger("click");
    await button(wrapper, "Yes, clear").trigger("click");

    expect(loadFlags()).toEqual([]);
  });
});
