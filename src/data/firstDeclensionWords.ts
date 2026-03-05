import type { Question } from "../types/nominalForms";

export type WordEntry = {
  nominativeSingular: string;
  meaning: string;
  questions: Question[];
};

type Forms = {
  nomVocSg: string;
  genSg: string;
  datSg: string;
  accSg: string;
  nomVocPl: string;
  genPl: string;
  datPl: string;
  accPl: string;
};

function toQuestions(forms: Forms): Question[] {
  return [
    {
      q: forms.nomVocSg,
      a: { genders: ["feminine"], number: "singular", cases: ["nominative", "vocative"] },
    },
    {
      q: forms.genSg,
      a: { genders: ["feminine"], number: "singular", cases: ["genitive"] },
    },
    {
      q: forms.datSg,
      a: { genders: ["feminine"], number: "singular", cases: ["dative"] },
    },
    {
      q: forms.accSg,
      a: { genders: ["feminine"], number: "singular", cases: ["accusative"] },
    },
    {
      q: forms.nomVocPl,
      a: { genders: ["feminine"], number: "plural", cases: ["nominative", "vocative"] },
    },
    {
      q: forms.genPl,
      a: { genders: ["feminine"], number: "plural", cases: ["genitive"] },
    },
    {
      q: forms.datPl,
      a: { genders: ["feminine"], number: "plural", cases: ["dative"] },
    },
    {
      q: forms.accPl,
      a: { genders: ["feminine"], number: "plural", cases: ["accusative"] },
    },
  ];
}

export const firstDeclensionWords: WordEntry[] = [
  {
    nominativeSingular: "ἀλήθεια",
    meaning: "truth",
    questions: toQuestions({
      nomVocSg: "ἀλήθεια",
      genSg: "ἀληθείας",
      datSg: "ἀληθείᾳ",
      accSg: "ἀλήθειαν",
      nomVocPl: "ἀλήθειαι",
      genPl: "ἀληθειῶν",
      datPl: "ἀληθείαις",
      accPl: "ἀληθείας",
    }),
  },
  {
    nominativeSingular: "βασιλεία",
    meaning: "kingdom",
    questions: toQuestions({
      nomVocSg: "βασιλεία",
      genSg: "βασιλείας",
      datSg: "βασιλείᾳ",
      accSg: "βασιλείαν",
      nomVocPl: "βασιλεῖαι",
      genPl: "βασιλειῶν",
      datPl: "βασιλείαις",
      accPl: "βασιλείας",
    }),
  },
  {
    nominativeSingular: "ἐκκλησία",
    meaning: "church, assembly",
    questions: toQuestions({
      nomVocSg: "ἐκκλησία",
      genSg: "ἐκκλησίας",
      datSg: "ἐκκλησίᾳ",
      accSg: "ἐκκλησίαν",
      nomVocPl: "ἐκκλησίαι",
      genPl: "ἐκκλησιῶν",
      datPl: "ἐκκλησίαις",
      accPl: "ἐκκλησίας",
    }),
  },
  {
    nominativeSingular: "δόξα",
    meaning: "glory",
    questions: toQuestions({
      nomVocSg: "δόξα",
      genSg: "δόξης",
      datSg: "δόξῃ",
      accSg: "δόξαν",
      nomVocPl: "δόξαι",
      genPl: "δοξῶν",
      datPl: "δόξαις",
      accPl: "δόξας",
    }),
  },
  {
    nominativeSingular: "γραφή",
    meaning: "writing",
    questions: toQuestions({
      nomVocSg: "γραφή",
      genSg: "γραφῆς",
      datSg: "γραφῇ",
      accSg: "γραφήν",
      nomVocPl: "γραφαί",
      genPl: "γραφῶν",
      datPl: "γραφαῖς",
      accPl: "γραφάς",
    }),
  },
  {
    nominativeSingular: "ἡμέρα",
    meaning: "day",
    questions: toQuestions({
      nomVocSg: "ἡμέρα",
      genSg: "ἡμέρας",
      datSg: "ἡμέρᾳ",
      accSg: "ἡμέραν",
      nomVocPl: "ἡμέραι",
      genPl: "ἡμερῶν",
      datPl: "ἡμέραις",
      accPl: "ἡμέρας",
    }),
  },
  {
    nominativeSingular: "καρδία",
    meaning: "heart",
    questions: toQuestions({
      nomVocSg: "καρδία",
      genSg: "καρδίας",
      datSg: "καρδίᾳ",
      accSg: "καρδίαν",
      nomVocPl: "καρδίαι",
      genPl: "καρδιῶν",
      datPl: "καρδίαις",
      accPl: "καρδίας",
    }),
  },
  {
    nominativeSingular: "παραβολή",
    meaning: "parable",
    questions: toQuestions({
      nomVocSg: "παραβολή",
      genSg: "παραβολῆς",
      datSg: "παραβολῇ",
      accSg: "παραβολήν",
      nomVocPl: "παραβολαί",
      genPl: "παραβολῶν",
      datPl: "παραβολαῖς",
      accPl: "παραβολάς",
    }),
  },
  {
    nominativeSingular: "ψυχή",
    meaning: "soul",
    questions: toQuestions({
      nomVocSg: "ψυχή",
      genSg: "ψυχῆς",
      datSg: "ψυχῇ",
      accSg: "ψυχήν",
      nomVocPl: "ψυχαί",
      genPl: "ψυχῶν",
      datPl: "ψυχαῖς",
      accPl: "ψυχάς",
    }),
  },
  {
    nominativeSingular: "ὥρα",
    meaning: "hour",
    questions: toQuestions({
      nomVocSg: "ὥρα",
      genSg: "ὥρας",
      datSg: "ὥρᾳ",
      accSg: "ὥραν",
      nomVocPl: "ὧραι",
      genPl: "ὡρῶν",
      datPl: "ὥραις",
      accPl: "ὥρας",
    }),
  },
  {
    nominativeSingular: "εἰρήνη",
    meaning: "peace",
    questions: toQuestions({
      nomVocSg: "εἰρήνη",
      genSg: "εἰρήνης",
      datSg: "εἰρήνῃ",
      accSg: "εἰρήνην",
      nomVocPl: "εἰρῆναι",
      genPl: "εἰρηνῶν",
      datPl: "εἰρήναις",
      accPl: "εἰρήνας",
    }),
  },
  {
    nominativeSingular: "ἐντολή",
    meaning: "commandment",
    questions: toQuestions({
      nomVocSg: "ἐντολή",
      genSg: "ἐντολῆς",
      datSg: "ἐντολῇ",
      accSg: "ἐντολήν",
      nomVocPl: "ἐντολαί",
      genPl: "ἐντολῶν",
      datPl: "ἐντολαῖς",
      accPl: "ἐντολάς",
    }),
  },
  {
    nominativeSingular: "ζωή",
    meaning: "life",
    questions: toQuestions({
      nomVocSg: "ζωή",
      genSg: "ζωῆς",
      datSg: "ζωῇ",
      accSg: "ζωήν",
      nomVocPl: "ζωαί",
      genPl: "ζωῶν",
      datPl: "ζωαῖς",
      accPl: "ζωάς",
    }),
  },
  {
    nominativeSingular: "φωνή",
    meaning: "voice",
    questions: toQuestions({
      nomVocSg: "φωνή",
      genSg: "φωνῆς",
      datSg: "φωνῇ",
      accSg: "φωνήν",
      nomVocPl: "φωναί",
      genPl: "φωνῶν",
      datPl: "φωναῖς",
      accPl: "φωνάς",
    }),
  },
];
