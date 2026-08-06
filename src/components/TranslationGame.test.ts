import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { beforeEach, describe, expect, test } from "vitest";
import { loadMisses } from "../utils/missLog";
import { loadAnswerStats } from "../utils/performanceStats";
import TranslationGame from "./TranslationGame.vue";

const SENTENCES = [{ greek: "λαμβάνομεν τὸ δῶρον", english: "we take the gift" }];

// Retry behavior is invisible with a single sentence, since the only draw available
// is the one just answered.
const POOL = [
  { greek: "λαμβάνομεν τὸ δῶρον", english: "we take the gift" },
  { greek: "γινώσκεις τὸν λόγον", english: "you know the word" },
  { greek: "βλέπει τὸν ἄνθρωπον", english: "he sees the man" },
  { greek: "λύει τοὺς δούλους", english: "he looses the slaves" },
];

function mountGame() {
  return mount(TranslationGame, {
    props: { gameId: "lesson-3-translation", title: "Lesson III", sentences: SENTENCES },
  });
}

function mountPool() {
  return mount(TranslationGame, {
    props: { gameId: "lesson-3-translation", title: "Lesson III", sentences: POOL },
  });
}

function greek(wrapper: ReturnType<typeof mountPool>) {
  return wrapper.get(".trans__greek").text();
}

function retryBannerShown(wrapper: ReturnType<typeof mountPool>) {
  return wrapper.find(".trans__retry").exists();
}

function reviewBannerShown(wrapper: ReturnType<typeof mountPool>) {
  return wrapper.find(".trans__review").exists();
}

// Counts scheduled returns rather than matching the Greek, since a random draw can
// land on the same sentence by chance and would make the count flaky.
async function countReviews(wrapper: ReturnType<typeof mountPool>, questions: number) {
  let seen = 0;
  for (let i = 0; i < questions; i += 1) {
    if (reviewBannerShown(wrapper)) {
      seen += 1;
    }
    await answer(wrapper, true);
  }
  return seen;
}

async function answer(wrapper: ReturnType<typeof mountPool>, gotIt: boolean, typed = "") {
  if (typed) {
    await wrapper.get("textarea").setValue(typed);
  }
  await button(wrapper, "Reveal answer").trigger("click");
  await button(wrapper, gotIt ? "I got it" : "Missed it").trigger("click");
}

function englishFor(greekText: string) {
  const found = POOL.find((sentence) => sentence.greek === greekText);
  if (!found) {
    throw new Error(`No pool sentence for "${greekText}"`);
  }
  return found.english;
}

function typed(wrapper: ReturnType<typeof mountPool>) {
  return (wrapper.get("textarea").element as HTMLTextAreaElement).value;
}

function congratulated(wrapper: ReturnType<typeof mountPool>) {
  return wrapper.find(".trans__correct").exists();
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

  // A wording the match check cannot accept, so the learner grades it themselves.
  test("logs nothing when graded as correct", async () => {
    const wrapper = mountGame();
    await wrapper.get("textarea").setValue("we receive the gift");
    await button(wrapper, "Reveal answer").trigger("click");

    await button(wrapper, "I got it").trigger("click");

    expect(loadMisses()).toEqual([]);
    expect(loadAnswerStats()["lesson-3-translation|λαμβάνομεν τὸ δῶρον"]).toEqual({
      seen: 1,
      correct: 1,
    });
  });
});

describe("TranslationGame revealed verdict", () => {
  test("says nothing about a right answer until it is revealed", async () => {
    const wrapper = mountGame();

    await wrapper.get("textarea").setValue("we take the gift");

    expect(congratulated(wrapper)).toBe(false);
    expect(button(wrapper, "Reveal answer").exists()).toBe(true);
  });

  test("congratulates a revealed answer that matches word for word", async () => {
    const wrapper = mountGame();

    await wrapper.get("textarea").setValue("we take the gift");
    await button(wrapper, "Reveal answer").trigger("click");

    expect(congratulated(wrapper)).toBe(true);
  });

  test("accepts the answer written with different case and punctuation", async () => {
    const wrapper = mountGame();

    await wrapper.get("textarea").setValue("We take the gift.");
    await button(wrapper, "Reveal answer").trigger("click");

    expect(congratulated(wrapper)).toBe(true);
  });

  // The verdict replaces the grading question the learner clicked reveal expecting.
  test("announces the verdict to a screen reader", async () => {
    const wrapper = mountGame();

    await wrapper.get("textarea").setValue("we take the gift");
    await button(wrapper, "Reveal answer").trigger("click");

    expect(wrapper.get(".trans__correct").attributes("aria-live")).toBe("polite");
  });

  test("leaves a wrong translation for the learner to grade", async () => {
    const wrapper = mountGame();

    await wrapper.get("textarea").setValue("we take the word");
    await button(wrapper, "Reveal answer").trigger("click");

    expect(congratulated(wrapper)).toBe(false);
    expect(wrapper.find(".trans__grade").exists()).toBe(true);
  });

  test("leaves an empty box for the learner to grade", async () => {
    const wrapper = mountGame();

    await button(wrapper, "Reveal answer").trigger("click");

    expect(congratulated(wrapper)).toBe(false);
    expect(wrapper.find(".trans__grade").exists()).toBe(true);
  });

  test("drops the grading question once the answer is graded for the learner", async () => {
    const wrapper = mountGame();

    await wrapper.get("textarea").setValue("we take the gift");
    await button(wrapper, "Reveal answer").trigger("click");

    expect(wrapper.find(".trans__grade").exists()).toBe(false);
  });

  test("keeps the model translation hidden until it is revealed", async () => {
    const wrapper = mountGame();

    await wrapper.get("textarea").setValue("we take the gift");

    expect(wrapper.text()).not.toContain("Model translation");
  });

  test("records the sentence as correct without logging a miss", async () => {
    const wrapper = mountGame();

    await wrapper.get("textarea").setValue("we take the gift");
    await button(wrapper, "Reveal answer").trigger("click");
    await button(wrapper, "Next question").trigger("click");

    expect(loadMisses()).toEqual([]);
    expect(loadAnswerStats()["lesson-3-translation|λαμβάνομεν τὸ δῶρον"]).toEqual({
      seen: 1,
      correct: 1,
    });
  });

  test("moves on to another sentence with an empty box", async () => {
    const wrapper = mountPool();
    const answered = greek(wrapper);

    await wrapper.get("textarea").setValue(englishFor(answered));
    await button(wrapper, "Reveal answer").trigger("click");
    await button(wrapper, "Next question").trigger("click");

    expect(greek(wrapper)).not.toBe(answered);
    expect(typed(wrapper)).toBe("");
    expect(congratulated(wrapper)).toBe(false);
  });

  test("reveals rather than moving on when ctrl+enter follows a right answer", async () => {
    const wrapper = mountPool();
    const answered = greek(wrapper);

    await wrapper.get("textarea").setValue(englishFor(answered));
    await wrapper.get("textarea").trigger("keydown.ctrl.enter");

    expect(greek(wrapper)).toBe(answered);
    expect(congratulated(wrapper)).toBe(true);
  });

  // The game is answered by typing, so the next answer should not need a click first.
  test("puts the cursor back in the box for the next sentence", async () => {
    const wrapper = mount(TranslationGame, {
      props: { gameId: "lesson-3-translation", title: "Lesson III", sentences: POOL },
      attachTo: document.body,
    });

    await wrapper.get("textarea").setValue(englishFor(greek(wrapper)));
    await button(wrapper, "Reveal answer").trigger("click");
    await button(wrapper, "Next question").trigger("click");
    await nextTick();

    expect(document.activeElement).toBe(wrapper.get("textarea").element);
    wrapper.unmount();
  });

  test("clears a pending retry when the repeat is typed correctly", async () => {
    const wrapper = mountPool();
    const missedGreek = greek(wrapper);

    await answer(wrapper, false);
    await wrapper.get("textarea").setValue(englishFor(missedGreek));
    await button(wrapper, "Reveal answer").trigger("click");
    await button(wrapper, "Next question").trigger("click");

    expect(greek(wrapper)).not.toBe(missedGreek);
    expect(retryBannerShown(wrapper)).toBe(false);
  });

  test("schedules the corrected sentence's returns like a graded retry", async () => {
    const wrapper = mountPool();
    const missedGreek = greek(wrapper);

    await answer(wrapper, false);
    await wrapper.get("textarea").setValue(englishFor(missedGreek));
    await button(wrapper, "Reveal answer").trigger("click");
    await button(wrapper, "Next question").trigger("click");

    expect(await countReviews(wrapper, 12)).toBe(3);
  });
});

describe("TranslationGame retries", () => {
  test("asks a missed sentence again as the very next question", async () => {
    const wrapper = mountPool();
    const missedGreek = greek(wrapper);

    await answer(wrapper, false);

    expect(greek(wrapper)).toBe(missedGreek);
  });

  test("marks the repeat so it does not read as a random draw", async () => {
    const wrapper = mountPool();

    await answer(wrapper, false);

    expect(retryBannerShown(wrapper)).toBe(true);
  });

  test("keeps asking until the sentence is graded correct", async () => {
    const wrapper = mountPool();
    const missedGreek = greek(wrapper);

    await answer(wrapper, false);
    await answer(wrapper, false);
    await answer(wrapper, false);

    expect(greek(wrapper)).toBe(missedGreek);
  });

  test("moves on once the retry is graded correct", async () => {
    const wrapper = mountPool();
    const missedGreek = greek(wrapper);

    await answer(wrapper, false);
    await answer(wrapper, true);

    expect(greek(wrapper)).not.toBe(missedGreek);
    expect(retryBannerShown(wrapper)).toBe(false);
  });

  test("never marks a repeat after a first-try correct answer", async () => {
    const wrapper = mountPool();

    await answer(wrapper, true);

    expect(retryBannerShown(wrapper)).toBe(false);
  });

  test("records every attempt in a retry chain", async () => {
    const wrapper = mountPool();
    const missedGreek = greek(wrapper);

    await answer(wrapper, false, "first guess");
    await answer(wrapper, false, "second guess");
    await answer(wrapper, true, "third guess");

    expect(loadMisses().map((m) => m.given)).toEqual(["second guess", "first guess"]);
    expect(loadAnswerStats()[`lesson-3-translation|${missedGreek}`]).toEqual({
      seen: 3,
      correct: 1,
    });
  });

  test("lists a repeatedly missed sentence once in the review summary", async () => {
    const wrapper = mountPool();

    await answer(wrapper, false);
    await answer(wrapper, false);
    await answer(wrapper, true);

    expect(wrapper.get("summary").text()).toBe("Missed sentences (1)");
  });

  test("drops a pending retry when the game changes", async () => {
    const wrapper = mountPool();

    await answer(wrapper, false);
    await wrapper.setProps({ gameId: "lesson-6-translation" });

    expect(retryBannerShown(wrapper)).toBe(false);
  });
});

describe("TranslationGame spaced reviews", () => {
  test("brings a corrected sentence back after one other question", async () => {
    const wrapper = mountPool();
    const missedGreek = greek(wrapper);

    await answer(wrapper, false);
    await answer(wrapper, true);

    expect(greek(wrapper)).not.toBe(missedGreek);
    await answer(wrapper, true);

    expect(greek(wrapper)).toBe(missedGreek);
    expect(reviewBannerShown(wrapper)).toBe(true);
    expect(retryBannerShown(wrapper)).toBe(false);
  });

  test("schedules three returns for one missed sentence", async () => {
    const wrapper = mountPool();

    await answer(wrapper, false);
    await answer(wrapper, true);

    expect(await countReviews(wrapper, 12)).toBe(3);
  });

  test("schedules nothing for a sentence answered correctly first try", async () => {
    const wrapper = mountPool();

    await answer(wrapper, true);

    expect(await countReviews(wrapper, 12)).toBe(0);
  });

  test("restarts the schedule when a scheduled review is missed again", async () => {
    const wrapper = mountPool();

    await answer(wrapper, false);
    await answer(wrapper, true);
    await answer(wrapper, true); // the filler question before the first review

    expect(reviewBannerShown(wrapper)).toBe(true);
    await answer(wrapper, false); // miss the review
    await answer(wrapper, true); // clear the immediate retry

    // Two returns were left on the old schedule; a restart gives three again.
    expect(await countReviews(wrapper, 12)).toBe(3);
  });

  test("drops scheduled reviews when the game changes", async () => {
    const wrapper = mountPool();

    await answer(wrapper, false);
    await answer(wrapper, true);
    await wrapper.setProps({ gameId: "lesson-6-translation" });

    expect(await countReviews(wrapper, 12)).toBe(0);
  });
});
