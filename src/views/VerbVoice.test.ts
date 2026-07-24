import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, test } from "vitest";
import { verbVoiceSentences } from "../data/verbVoiceSentences";
import { loadMisses } from "../utils/missLog";
import { loadAnswerStats } from "../utils/performanceStats";
import VerbVoice from "./VerbVoice.vue";

// The game picks a sentence at random; find whichever one it showed.
function shownSentence(text: string) {
  const sentence = verbVoiceSentences.find((s) => s.sentence === text);
  if (!sentence) {
    throw new Error(`Unknown sentence rendered: ${text}`);
  }
  return sentence;
}

const VOICE_LABELS: Record<string, string> = {
  active: "Active",
  middle: "Middle",
  passive: "Passive",
};

function mountGame() {
  const wrapper = mount(VerbVoice);
  const sentence = shownSentence(wrapper.get(".voice__sentence").text());
  return { wrapper, sentence };
}

function buttonFor(wrapper: ReturnType<typeof mount>, label: string) {
  const button = wrapper.findAll("button").find((b) => b.text() === label);
  if (!button) {
    throw new Error(`No "${label}" button rendered`);
  }
  return button;
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("VerbVoice", () => {
  test("logs the voice picked and the voice wanted when the answer is wrong", async () => {
    const { wrapper, sentence } = mountGame();
    const wrongVoice = Object.keys(VOICE_LABELS).find((v) => v !== sentence.voice)!;

    await buttonFor(wrapper, VOICE_LABELS[wrongVoice]!).trigger("click");

    expect(loadMisses()).toEqual([
      {
        gameId: "verb-voice",
        question: sentence.sentence,
        given: VOICE_LABELS[wrongVoice],
        answer: VOICE_LABELS[sentence.voice],
        at: expect.any(Number),
      },
    ]);
  });

  test("logs nothing when the answer is right", async () => {
    const { wrapper, sentence } = mountGame();

    await buttonFor(wrapper, VOICE_LABELS[sentence.voice]!).trigger("click");

    expect(loadMisses()).toEqual([]);
    expect(loadAnswerStats()[`verb-voice|${sentence.sentence}`]).toEqual({ seen: 1, correct: 1 });
  });

  test("records only the first pick, since the answer locks in", async () => {
    const { wrapper, sentence } = mountGame();
    const wrongVoice = Object.keys(VOICE_LABELS).find((v) => v !== sentence.voice)!;

    await buttonFor(wrapper, VOICE_LABELS[wrongVoice]!).trigger("click");
    await buttonFor(wrapper, VOICE_LABELS[sentence.voice]!).trigger("click");

    expect(loadMisses()).toHaveLength(1);
    expect(loadAnswerStats()[`verb-voice|${sentence.sentence}`]).toEqual({ seen: 1, correct: 0 });
  });
});
