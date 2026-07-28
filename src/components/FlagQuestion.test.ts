import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, test } from "vitest";
import { FLAG_REASONS, loadFlags } from "../utils/flagLog";
import { flagIssueUrl, flagReportText } from "../utils/flagReport";
import FlagQuestion from "./FlagQuestion.vue";

function mountFlag(props: Partial<Record<"gameId" | "question" | "answer", string>> = {}) {
  return mount(FlagQuestion, {
    props: {
      gameId: "verb-voice",
      question: "λαμβάνομεν τὸ δῶρον",
      answer: "Active",
      ...props,
    },
  });
}

function button(wrapper: ReturnType<typeof mountFlag>, label: string) {
  const found = wrapper.findAll("button").find((b) => b.text() === label);
  if (!found) {
    throw new Error(`No "${label}" button rendered`);
  }
  return found;
}

async function flag(wrapper: ReturnType<typeof mountFlag>, note = "") {
  await button(wrapper, "⚑ Something wrong with this question?").trigger("click");
  if (note) {
    await wrapper.find("textarea").setValue(note);
  }
  await button(wrapper, "Save flag").trigger("click");
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("FlagQuestion", () => {
  test("starts closed, showing only the way in", () => {
    const wrapper = mountFlag();

    expect(wrapper.find("input[type=radio]").exists()).toBe(false);
    expect(wrapper.text()).toContain("Something wrong with this question?");
  });

  test("offers every reason once opened", async () => {
    const wrapper = mountFlag();

    await button(wrapper, "⚑ Something wrong with this question?").trigger("click");

    expect(wrapper.findAll("input[type=radio]")).toHaveLength(FLAG_REASONS.length);
  });

  test("stores the flagged question with what the player said about it", async () => {
    const wrapper = mountFlag();

    await flag(wrapper, "Machen glosses this as receive");

    const stored = loadFlags();
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      gameId: "verb-voice",
      question: "λαμβάνομεν τὸ δῶρον",
      answer: "Active",
      reason: FLAG_REASONS[0].value,
      note: "Machen glosses this as receive",
    });
  });

  test("says the flag stayed on this device", async () => {
    const wrapper = mountFlag();

    await flag(wrapper);

    expect(wrapper.text()).toContain("saved on this device");
  });

  test("offers a prefilled issue that the player has to submit themselves", async () => {
    const wrapper = mountFlag();

    await flag(wrapper, "a note");

    const link = wrapper.get("a.flag__send");
    expect(link.attributes("href")).toBe(flagIssueUrl(loadFlags()[0]!));
    expect(link.attributes("target")).toBe("_blank");
    expect(link.attributes("rel")).toContain("noopener");
  });

  test("copies the same report the issue link carries", async () => {
    const copied: string[] = [];
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: { writeText: (text: string) => (copied.push(text), Promise.resolve()) },
    });
    const wrapper = mountFlag();

    await flag(wrapper, "a note");
    await button(wrapper, "Copy report").trigger("click");

    expect(copied).toEqual([flagReportText(loadFlags()[0]!)]);
  });

  test("says so when the browser refuses the clipboard", async () => {
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.reject(new Error("denied")) },
    });
    const wrapper = mountFlag();

    await flag(wrapper);
    await button(wrapper, "Copy report").trigger("click");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(wrapper.text()).toContain("Copying failed");
  });

  test("closes again when the game moves to the next question", async () => {
    const wrapper = mountFlag();
    await button(wrapper, "⚑ Something wrong with this question?").trigger("click");

    await wrapper.setProps({ question: "γράφει τὸν λόγον" });

    expect(wrapper.find("input[type=radio]").exists()).toBe(false);
  });

  test("writes nothing when the player backs out", async () => {
    const wrapper = mountFlag();

    await button(wrapper, "⚑ Something wrong with this question?").trigger("click");
    await button(wrapper, "Cancel").trigger("click");

    expect(loadFlags()).toEqual([]);
    expect(wrapper.find("input[type=radio]").exists()).toBe(false);
  });
});
