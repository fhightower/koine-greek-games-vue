import type { Combination } from "../types/nominalForms";

type CheatSheetEntry = {
  question: string;
  combos: Combination[];
};

const firstDeclensionCheatSheetEntries: CheatSheetEntry[] = [
  {
    question: "-α / -η",
    combos: [
      { gender: "feminine", number: "singular", case_: "nominative" },
      { gender: "feminine", number: "singular", case_: "vocative" },
    ],
  },
  {
    question: "-ας / -ης",
    combos: [{ gender: "feminine", number: "singular", case_: "genitive" }],
  },
  {
    question: "-ᾳ / -ῃ",
    combos: [{ gender: "feminine", number: "singular", case_: "dative" }],
  },
  {
    question: "-αν / -ην",
    combos: [{ gender: "feminine", number: "singular", case_: "accusative" }],
  },
  {
    question: "-αι",
    combos: [
      { gender: "feminine", number: "plural", case_: "nominative" },
      { gender: "feminine", number: "plural", case_: "vocative" },
    ],
  },
  {
    question: "-ῶν",
    combos: [{ gender: "feminine", number: "plural", case_: "genitive" }],
  },
  {
    question: "-αις",
    combos: [{ gender: "feminine", number: "plural", case_: "dative" }],
  },
  {
    question: "-ας",
    combos: [{ gender: "feminine", number: "plural", case_: "accusative" }],
  },
];

const secondDeclensionCheatSheetEntries: CheatSheetEntry[] = [
  {
    question: "-ος",
    combos: [{ gender: "masculine", number: "singular", case_: "nominative" }],
  },
  {
    question: "-ου",
    combos: [
      { gender: "masculine", number: "singular", case_: "genitive" },
      { gender: "neuter", number: "singular", case_: "genitive" },
    ],
  },
  {
    question: "-ῳ",
    combos: [
      { gender: "masculine", number: "singular", case_: "dative" },
      { gender: "neuter", number: "singular", case_: "dative" },
    ],
  },
  {
    question: "-ον",
    combos: [
      { gender: "masculine", number: "singular", case_: "accusative" },
      { gender: "neuter", number: "singular", case_: "nominative" },
      { gender: "neuter", number: "singular", case_: "accusative" },
      { gender: "neuter", number: "singular", case_: "vocative" },
    ],
  },
  {
    question: "-ε",
    combos: [{ gender: "masculine", number: "singular", case_: "vocative" }],
  },
  {
    question: "-οι",
    combos: [
      { gender: "masculine", number: "plural", case_: "nominative" },
      { gender: "masculine", number: "plural", case_: "vocative" },
    ],
  },
  {
    question: "-ων",
    combos: [
      { gender: "masculine", number: "plural", case_: "genitive" },
      { gender: "neuter", number: "plural", case_: "genitive" },
    ],
  },
  {
    question: "-οις",
    combos: [
      { gender: "masculine", number: "plural", case_: "dative" },
      { gender: "neuter", number: "plural", case_: "dative" },
    ],
  },
  {
    question: "-ους",
    combos: [{ gender: "masculine", number: "plural", case_: "accusative" }],
  },
  {
    question: "-α",
    combos: [
      { gender: "neuter", number: "plural", case_: "nominative" },
      { gender: "neuter", number: "plural", case_: "accusative" },
      { gender: "neuter", number: "plural", case_: "vocative" },
    ],
  },
];

export { firstDeclensionCheatSheetEntries, secondDeclensionCheatSheetEntries };
