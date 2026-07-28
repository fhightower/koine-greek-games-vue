import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, test } from "vitest";
import PersonNumberParseGame from "../components/PersonNumberParseGame.vue";
import TranslationGame from "../components/TranslationGame.vue";
import { loadFlags } from "../utils/flagLog";
import DefiniteArticles1 from "./DefiniteArticles1.vue";
import Focus from "./Focus.vue";
import Prepositions from "./Prepositions.vue";
import VerbVoice from "./VerbVoice.vue";

type AnyWrapper = ReturnType<typeof mount>;

function flagShown(wrapper: AnyWrapper) {
  return wrapper.find(".flag").exists();
}

function clickButton(wrapper: AnyWrapper, label: string) {
  const found = wrapper.findAll("button").find((b) => b.text() === label);
  if (!found) {
    throw new Error(`No "${label}" button rendered`);
  }
  return found.trigger("click");
}

/** Opens the control and saves whatever reason is selected by default. */
async function saveFlag(wrapper: AnyWrapper) {
  await wrapper.get(".flag__open").trigger("click");
  await clickButton(wrapper, "Save flag");
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("TranslationGame flagging", () => {
  const SENTENCES = [{ greek: "λαμβάνομεν τὸ δῶρον", english: "we take the gift" }];

  function mountGame() {
    return mount(TranslationGame, {
      props: { gameId: "lesson-3-translation", title: "Lesson III", sentences: SENTENCES },
    });
  }

  test("offers no flag control before the answer is revealed", () => {
    expect(flagShown(mountGame())).toBe(false);
  });

  test("offers a flag control once the model translation is shown", async () => {
    const wrapper = mountGame();

    await clickButton(wrapper, "Reveal answer");

    expect(flagShown(wrapper)).toBe(true);
  });

  test("flags the sentence against the translation it was graded on", async () => {
    const wrapper = mountGame();
    await clickButton(wrapper, "Reveal answer");

    await saveFlag(wrapper);

    expect(loadFlags()[0]).toMatchObject({
      gameId: "lesson-3-translation",
      question: "λαμβάνομεν τὸ δῶρον",
      answer: "we take the gift",
    });
  });
});

describe("VerbVoice flagging", () => {
  test("offers no flag control until a voice is picked", () => {
    expect(flagShown(mount(VerbVoice))).toBe(false);
  });

  test("flags the sentence against the voice the game wanted", async () => {
    const wrapper = mount(VerbVoice);
    const sentence = wrapper.get(".voice__sentence").text();
    await clickButton(wrapper, "Active");

    await saveFlag(wrapper);

    const flag = loadFlags()[0];
    expect(flag).toMatchObject({ gameId: "verb-voice", question: sentence });
    expect(["Active", "Middle", "Passive"]).toContain(flag?.answer);
  });
});

describe("PersonNumberParseGame flagging", () => {
  const FORMS = [
    {
      form: "λύομαι",
      ending: "-ομαι",
      person: 1 as const,
      number: "singular" as const,
      glossLines: ["I loose for myself"],
    },
  ];

  function mountGame() {
    return mount(PersonNumberParseGame, {
      props: { gameId: "luo-endings", prompt: "Parse the form", forms: FORMS },
    });
  }

  test("offers no flag control until a cell is picked", () => {
    expect(flagShown(mountGame())).toBe(false);
  });

  test("flags the form against the parse the game wanted", async () => {
    const wrapper = mountGame();
    await wrapper.get("button.cell").trigger("click");

    await saveFlag(wrapper);

    expect(loadFlags()[0]).toMatchObject({
      gameId: "luo-endings",
      question: "λύομαι",
      answer: "1st singular",
    });
  });
});

describe("Prepositions flagging", () => {
  test("offers no flag control until every case is found", () => {
    expect(flagShown(mount(Prepositions))).toBe(false);
  });

  test("flags the preposition once its cases are shown", async () => {
    const wrapper = mount(Prepositions);
    const word = wrapper.get(".prep__word").text();
    // Clicking every case is guaranteed to find whichever ones are correct.
    for (const case_ of ["genitive", "dative", "accusative"]) {
      await clickButton(wrapper, case_);
    }

    await saveFlag(wrapper);

    expect(loadFlags()[0]).toMatchObject({ gameId: "prepositions", question: word });
  });
});

describe("Focus drill flagging", () => {
  function seedMiss() {
    window.localStorage.setItem(
      "koine:miss-log:v1",
      JSON.stringify([
        {
          gameId: "verb-voice",
          question: "λύεται",
          given: "Active",
          answer: "Passive",
          at: 1_000_000,
        },
      ]),
    );
  }

  test("offers no flag control before the answer is revealed", () => {
    seedMiss();

    expect(flagShown(mount(Focus, { props: { games: "verb-voice" } }))).toBe(false);
  });

  test("flags the drilled question against the answer it came from", async () => {
    seedMiss();
    const wrapper = mount(Focus, { props: { games: "verb-voice" } });

    await clickButton(wrapper, "Reveal answer");
    await saveFlag(wrapper);

    expect(loadFlags()[0]).toMatchObject({
      gameId: "verb-voice",
      question: "λύεται",
      answer: "Passive",
    });
  });
});

describe("Grid game flagging", () => {
  type Cell = { gender: string; number: string; case_: string };

  function correctCells(wrapper: AnyWrapper, article: string): Cell[] {
    const vm = wrapper.vm as unknown as {
      cheatSheetEntries: { question: string; combos: Cell[] }[];
    };
    const entry = vm.cheatSheetEntries.find((e) => e.question === article);
    if (!entry) {
      throw new Error(`No cheat sheet entry for ${article}`);
    }
    return entry.combos;
  }

  test("offers no flag control while cells are still missing", async () => {
    const wrapper = mount(DefiniteArticles1);

    expect(flagShown(wrapper)).toBe(false);
  });

  test("flags the article against every cell the grid accepted", async () => {
    const wrapper = mount(DefiniteArticles1);
    const article = wrapper.get("h3 b").text();
    const correct = correctCells(wrapper, article);
    for (const c of correct) {
      await wrapper.get(`button.${c.gender}.${c.number}.${c.case_}`).trigger("click");
    }

    await saveFlag(wrapper);

    expect(loadFlags()[0]).toMatchObject({
      gameId: "definite-articles-1",
      question: article,
      answer: correct.map((c) => `${c.gender} ${c.number} ${c.case_}`).join(", "),
    });
  });
});
