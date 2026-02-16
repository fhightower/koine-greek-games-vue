export type Combination = { gender: string; number: string; case_: string };

export type Answer = {
  genders: string[];
  number: string;
  cases: string[];
};

export type MissedAnswer = {
  question: string;
  combos: Combination[];
};

export type Question = {
  q: string;
  a: Answer;
};
