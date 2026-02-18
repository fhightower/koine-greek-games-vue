import type { Question } from "../types/nominalForms";

export type WordEntry = {
  nominativeSingular: string;
  meaning: string;
  questions: Question[];
};

type Forms = {
  nomSg: string;
  genSg: string;
  datSg: string;
  accSg: string;
  vocSg: string;
  nomVocPl: string;
  genPl: string;
  datPl: string;
  accPl: string;
};

function toQuestions(forms: Forms): Question[] {
  return [
    {
      q: forms.nomSg,
      a: { genders: ["masculine"], number: "singular", cases: ["nominative"] },
    },
    {
      q: forms.genSg,
      a: { genders: ["masculine"], number: "singular", cases: ["genitive"] },
    },
    {
      q: forms.datSg,
      a: { genders: ["masculine"], number: "singular", cases: ["dative"] },
    },
    {
      q: forms.accSg,
      a: { genders: ["masculine"], number: "singular", cases: ["accusative"] },
    },
    {
      q: forms.vocSg,
      a: { genders: ["masculine"], number: "singular", cases: ["vocative"] },
    },
    {
      q: forms.nomVocPl,
      a: { genders: ["masculine"], number: "plural", cases: ["nominative", "vocative"] },
    },
    {
      q: forms.genPl,
      a: { genders: ["masculine"], number: "plural", cases: ["genitive"] },
    },
    {
      q: forms.datPl,
      a: { genders: ["masculine"], number: "plural", cases: ["dative"] },
    },
    {
      q: forms.accPl,
      a: { genders: ["masculine"], number: "plural", cases: ["accusative"] },
    },
  ];
}

export const secondDeclensionWords: WordEntry[] = [
  {
    nominativeSingular: "ἄνθρωπος",
    meaning: "human being, man",
    questions: toQuestions({
      nomSg: "ἄνθρωπος",
      genSg: "ἀνθρώπου",
      datSg: "ἀνθρώπῳ",
      accSg: "ἄνθρωπον",
      vocSg: "ἄνθρωπε",
      nomVocPl: "ἄνθρωποι",
      genPl: "ἀνθρώπων",
      datPl: "ἀνθρώποις",
      accPl: "ἀνθρώπους",
    }),
  },
  {
    nominativeSingular: "λόγος",
    meaning: "word, reason",
    questions: toQuestions({
      nomSg: "λόγος",
      genSg: "λόγου",
      datSg: "λόγῳ",
      accSg: "λόγον",
      vocSg: "λόγε",
      nomVocPl: "λόγοι",
      genPl: "λόγων",
      datPl: "λόγοις",
      accPl: "λόγους",
    }),
  },
  {
    nominativeSingular: "θεός",
    meaning: "God, god",
    questions: toQuestions({
      nomSg: "θεός",
      genSg: "θεοῦ",
      datSg: "θεῷ",
      accSg: "θεόν",
      vocSg: "θεέ",
      nomVocPl: "θεοί",
      genPl: "θεῶν",
      datPl: "θεοῖς",
      accPl: "θεούς",
    }),
  },
  {
    nominativeSingular: "κύριος",
    meaning: "lord, master",
    questions: toQuestions({
      nomSg: "κύριος",
      genSg: "κυρίου",
      datSg: "κυρίῳ",
      accSg: "κύριον",
      vocSg: "κύριε",
      nomVocPl: "κύριοι",
      genPl: "κυρίων",
      datPl: "κυρίοις",
      accPl: "κυρίους",
    }),
  },
  {
    nominativeSingular: "υἱός",
    meaning: "son",
    questions: toQuestions({
      nomSg: "υἱός",
      genSg: "υἱοῦ",
      datSg: "υἱῷ",
      accSg: "υἱόν",
      vocSg: "υἱέ",
      nomVocPl: "υἱοί",
      genPl: "υἱῶν",
      datPl: "υἱοῖς",
      accPl: "υἱούς",
    }),
  },
  {
    nominativeSingular: "ἀδελφός",
    meaning: "brother",
    questions: toQuestions({
      nomSg: "ἀδελφός",
      genSg: "ἀδελφοῦ",
      datSg: "ἀδελφῷ",
      accSg: "ἀδελφόν",
      vocSg: "ἀδελφέ",
      nomVocPl: "ἀδελφοί",
      genPl: "ἀδελφῶν",
      datPl: "ἀδελφοῖς",
      accPl: "ἀδελφούς",
    }),
  },
  {
    nominativeSingular: "δοῦλος",
    meaning: "slave, servant",
    questions: toQuestions({
      nomSg: "δοῦλος",
      genSg: "δούλου",
      datSg: "δούλῳ",
      accSg: "δοῦλον",
      vocSg: "δοῦλε",
      nomVocPl: "δοῦλοι",
      genPl: "δούλων",
      datPl: "δούλοις",
      accPl: "δούλους",
    }),
  },
  {
    nominativeSingular: "νόμος",
    meaning: "law",
    questions: toQuestions({
      nomSg: "νόμος",
      genSg: "νόμου",
      datSg: "νόμῳ",
      accSg: "νόμον",
      vocSg: "νόμε",
      nomVocPl: "νόμοι",
      genPl: "νόμων",
      datPl: "νόμοις",
      accPl: "νόμους",
    }),
  },
  {
    nominativeSingular: "κόσμος",
    meaning: "world, order",
    questions: toQuestions({
      nomSg: "κόσμος",
      genSg: "κόσμου",
      datSg: "κόσμῳ",
      accSg: "κόσμον",
      vocSg: "κόσμε",
      nomVocPl: "κόσμοι",
      genPl: "κόσμων",
      datPl: "κόσμοις",
      accPl: "κόσμους",
    }),
  },
  {
    nominativeSingular: "ἄγγελος",
    meaning: "messenger, angel",
    questions: toQuestions({
      nomSg: "ἄγγελος",
      genSg: "ἀγγέλου",
      datSg: "ἀγγέλῳ",
      accSg: "ἄγγελον",
      vocSg: "ἄγγελε",
      nomVocPl: "ἄγγελοι",
      genPl: "ἀγγέλων",
      datPl: "ἀγγέλοις",
      accPl: "ἀγγέλους",
    }),
  },
  {
    nominativeSingular: "ἀπόστολος",
    meaning: "apostle, messenger",
    questions: toQuestions({
      nomSg: "ἀπόστολος",
      genSg: "ἀποστόλου",
      datSg: "ἀποστόλῳ",
      accSg: "ἀπόστολον",
      vocSg: "ἀπόστολε",
      nomVocPl: "ἀπόστολοι",
      genPl: "ἀποστόλων",
      datPl: "ἀποστόλοις",
      accPl: "ἀποστόλους",
    }),
  },
  {
    nominativeSingular: "οὐρανός",
    meaning: "heaven, sky",
    questions: toQuestions({
      nomSg: "οὐρανός",
      genSg: "οὐρανοῦ",
      datSg: "οὐρανῷ",
      accSg: "οὐρανόν",
      vocSg: "οὐρανέ",
      nomVocPl: "οὐρανοί",
      genPl: "οὐρανῶν",
      datPl: "οὐρανοῖς",
      accPl: "οὐρανούς",
    }),
  },
  {
    nominativeSingular: "ὄχλος",
    meaning: "crowd, multitude",
    questions: toQuestions({
      nomSg: "ὄχλος",
      genSg: "ὄχλου",
      datSg: "ὄχλῳ",
      accSg: "ὄχλον",
      vocSg: "ὄχλε",
      nomVocPl: "ὄχλοι",
      genPl: "ὄχλων",
      datPl: "ὄχλοις",
      accPl: "ὄχλους",
    }),
  },
];
