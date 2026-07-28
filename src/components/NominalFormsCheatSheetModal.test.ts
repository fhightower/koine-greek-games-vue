import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, test } from "vitest";
import { nextTick } from "vue";
import NominalFormsCheatSheetModal from "./NominalFormsCheatSheetModal.vue";

const ENTRIES = [
  {
    question: "λόγος",
    combos: [{ gender: "masculine", number: "singular", case_: "nominative" }],
  },
  {
    // Same cell as λόγος, to check both forms land in it.
    question: "ὁ λόγος",
    combos: [{ gender: "masculine", number: "singular", case_: "nominative" }],
  },
  {
    question: "τοῦτο",
    combos: [
      { gender: "neuter", number: "singular", case_: "nominative" },
      { gender: "neuter", number: "singular", case_: "accusative" },
    ],
  },
];

// The modal teleports to the body, so its markup is not inside the wrapper.
async function openModal(entries = ENTRIES) {
  const wrapper = mount(NominalFormsCheatSheetModal, { props: { entries } });
  await wrapper.get("button.button").trigger("click");
}

function bodyButton(selector: string) {
  const button = document.body.querySelector<HTMLButtonElement>(selector);
  if (!button) {
    throw new Error(`No ${selector} in the open modal`);
  }
  return button;
}

function cellText(selector: string) {
  const cell = document.body.querySelector(selector);
  if (!cell) {
    throw new Error(`No cheat sheet cell matching ${selector}`);
  }
  return cell.textContent?.trim();
}

enableAutoUnmount(afterEach);

afterEach(() => {
  document.body.innerHTML = "";
});

describe("NominalFormsCheatSheetModal", () => {
  test("opens and closes the sheet", async () => {
    await openModal();
    expect(document.body.querySelector(".modal")).not.toBeNull();

    bodyButton("button.close").click();
    await nextTick();

    expect(document.body.querySelector(".modal")).toBeNull();
  });

  test("gathers every form that fills a cell, and dashes the empty ones", async () => {
    await openModal();

    expect(cellText(".cell.masculine.singular.nominative")).toBe("λόγος / ὁ λόγος");
    expect(cellText(".cell.neuter.singular.accusative")).toBe("τοῦτο");
    // Nothing declines this way in the entries, but the cell still holds the row.
    expect(cellText(".cell.feminine.plural.nominative")).toBe("—");
  });

  test("repeats a form once per cell it belongs to, not once per entry", async () => {
    await openModal([
      { question: "λόγος", combos: [{ gender: "masculine", number: "singular", case_: "nominative" }] },
      { question: "λόγος", combos: [{ gender: "masculine", number: "singular", case_: "nominative" }] },
    ]);

    expect(cellText(".cell.masculine.singular.nominative")).toBe("λόγος");
  });

  test("shows a vocative row only when an entry uses it", async () => {
    await openModal();
    expect(document.body.querySelector(".cell.vocative")).toBeNull();
    document.body.innerHTML = "";

    await openModal([
      { question: "λόγε", combos: [{ gender: "masculine", number: "singular", case_: "vocative" }] },
    ]);

    expect(cellText(".cell.masculine.singular.vocative")).toBe("λόγε");
  });
});
