import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import type { Answer, Combination } from "../types/nominalForms";
import AnswerFooter from "./AnswerFooter.vue";

const ANSWER: Answer = { genders: ["masculine"], number: "singular", cases: ["nominative"] };

function combo(gender: string, number: string, case_: string): Combination {
  return { gender, number, case_ };
}

function mountFooter(props: {
  correctAnswer?: Answer | null;
  correctCombinations?: Combination[];
  message?: string;
  missedAnswers?: { question: string; combos: Combination[] }[];
}) {
  return mount(AnswerFooter, {
    props: {
      correctAnswer: props.correctAnswer ?? null,
      correctCombinations: props.correctCombinations ?? [],
      message: props.message ?? "",
      missedAnswers: props.missedAnswers ?? [],
    },
  });
}

/** Collapses the whitespace the template's inline templates leave behind. */
function text(wrapper: ReturnType<typeof mount>, selector: string) {
  return wrapper.get(selector).text().replace(/\s+/g, " ").trim();
}

describe("AnswerFooter", () => {
  test("shows the running message until the question is answered", () => {
    const wrapper = mountFooter({ message: "Correct! 1 remaining." });

    expect(wrapper.text()).toContain("Correct! 1 remaining.");
    expect(wrapper.find("button").exists()).toBe(false);
  });

  test("reads a single combination as one phrase", () => {
    const wrapper = mountFooter({
      correctAnswer: ANSWER,
      correctCombinations: [combo("masculine", "singular", "nominative")],
    });

    expect(text(wrapper, "p")).toBe("Correct! This word is masculine singular nominative");
  });

  test("joins two combinations with and", () => {
    const wrapper = mountFooter({
      correctAnswer: ANSWER,
      correctCombinations: [
        combo("neuter", "singular", "nominative"),
        combo("neuter", "singular", "accusative"),
      ],
    });

    expect(text(wrapper, "p")).toBe(
      "Correct! This word is neuter singular nominative and neuter singular accusative",
    );
  });

  test("joins three or more combinations with commas and a final and", () => {
    const wrapper = mountFooter({
      correctAnswer: ANSWER,
      correctCombinations: [
        combo("masculine", "plural", "genitive"),
        combo("feminine", "plural", "genitive"),
        combo("neuter", "plural", "genitive"),
      ],
    });

    expect(text(wrapper, "p")).toBe(
      "Correct! This word is masculine plural genitive, feminine plural genitive, and neuter plural genitive",
    );
  });

  test("asks for the next question", async () => {
    const wrapper = mountFooter({
      correctAnswer: ANSWER,
      correctCombinations: [combo("masculine", "singular", "nominative")],
    });

    await wrapper.get("button").trigger("click");

    expect(wrapper.emitted("nextQuestion")).toHaveLength(1);
  });

  test("keeps the missed answers out of the way until there are some", () => {
    expect(mountFooter({}).find(".missed-answers").exists()).toBe(false);

    const wrapper = mountFooter({
      missedAnswers: [
        {
          question: "τοῦτο",
          combos: [
            combo("neuter", "singular", "nominative"),
            combo("neuter", "singular", "accusative"),
          ],
        },
      ],
    });

    expect(text(wrapper, ".missed-answers summary")).toBe("Missed answers (1)");
    expect(text(wrapper, ".missed-answers li")).toBe(
      "τοῦτο — neuter singular nominative, neuter singular accusative",
    );
  });
});
