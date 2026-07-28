import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import GenderNumberCaseGrid from "./GenderNumberCaseGrid.vue";

describe("GenderNumberCaseGrid", () => {
  test("covers every gender, number, and case, with vocative only when asked", () => {
    const withoutVocative = mount(GenderNumberCaseGrid, {
      props: { selectedAnswers: new Set<string>() },
    });
    const withVocative = mount(GenderNumberCaseGrid, {
      props: { selectedAnswers: new Set<string>(), includeVocative: true },
    });

    // 3 genders x 2 numbers x 4 (or 5) cases
    expect(withoutVocative.findAll("button.answer")).toHaveLength(24);
    expect(withoutVocative.find("button.vocative").exists()).toBe(false);
    expect(withVocative.findAll("button.answer")).toHaveLength(30);
    expect(withVocative.findAll("button.vocative")).toHaveLength(6);
  });

  test("emits the cell that was clicked", async () => {
    const wrapper = mount(GenderNumberCaseGrid, {
      props: { selectedAnswers: new Set<string>() },
    });

    await wrapper.get("button.feminine.plural.dative").trigger("click");

    expect(wrapper.emitted("select")).toEqual([["feminine", "plural", "dative"]]);
  });

  test("locks a cell already found, so it cannot be counted twice", async () => {
    const wrapper = mount(GenderNumberCaseGrid, {
      props: { selectedAnswers: new Set(["neuter-singular-genitive"]) },
    });
    const found = wrapper.get("button.neuter.singular.genitive");

    expect(found.classes()).toContain("selected");
    expect(found.attributes("disabled")).toBeDefined();

    await found.trigger("click");

    expect(wrapper.emitted("select")).toBeUndefined();
  });
});
