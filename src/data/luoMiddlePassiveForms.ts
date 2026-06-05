// Present Middle / Passive Indicative of λύω (Machen Lesson X, §§110-112).
// In the present tense the middle and passive are identical in form, so the
// game asks only for person + number, not voice.
//
// Primary middle/passive personal endings: -μαι, -σαι, -ται, -μεθα, -σθε, -νται
// joined to the stem by the variable vowel ο/ε. (λύῃ is a contraction of the
// older λύεσαι; the alternative form λύει also occurs.)

export type Person = 1 | 2 | 3
export type GrammaticalNumber = 'singular' | 'plural'

export interface LuoForm {
  form: string
  ending: string
  person: Person
  number: GrammaticalNumber
  middle: string
  passive: string
}

export const luoMiddlePassiveForms: LuoForm[] = [
  {
    form: 'λύομαι',
    ending: '-ομαι',
    person: 1,
    number: 'singular',
    middle: 'I loose for myself',
    passive: 'I am being loosed',
  },
  {
    form: 'λύῃ',
    ending: '-ῃ',
    person: 2,
    number: 'singular',
    middle: 'thou loosest for thyself',
    passive: 'thou art being loosed',
  },
  {
    form: 'λύεται',
    ending: '-εται',
    person: 3,
    number: 'singular',
    middle: 'he looses for himself',
    passive: 'he is being loosed',
  },
  {
    form: 'λυόμεθα',
    ending: '-ομεθα',
    person: 1,
    number: 'plural',
    middle: 'we loose for ourselves',
    passive: 'we are being loosed',
  },
  {
    form: 'λύεσθε',
    ending: '-εσθε',
    person: 2,
    number: 'plural',
    middle: 'ye loose for yourselves',
    passive: 'ye are being loosed',
  },
  {
    form: 'λύονται',
    ending: '-ονται',
    person: 3,
    number: 'plural',
    middle: 'they loose for themselves',
    passive: 'they are being loosed',
  },
]
