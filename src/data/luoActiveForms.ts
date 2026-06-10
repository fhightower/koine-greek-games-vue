// Present Active Indicative of λύω (Machen Lesson III, §§18-20).
//
// Primary active personal endings joined to the stem by the variable
// vowel ο/ε: -ω, -εις, -ει, -ομεν, -ετε, -ουσι(ν).

import type { GrammaticalNumber, Person } from './luoMiddlePassiveForms'

export interface LuoActiveForm {
  form: string
  ending: string
  person: Person
  number: GrammaticalNumber
  gloss: string
}

export const luoActiveForms: LuoActiveForm[] = [
  {
    form: 'λύω',
    ending: '-ω',
    person: 1,
    number: 'singular',
    gloss: 'I loose',
  },
  {
    form: 'λύεις',
    ending: '-εις',
    person: 2,
    number: 'singular',
    gloss: 'thou loosest',
  },
  {
    form: 'λύει',
    ending: '-ει',
    person: 3,
    number: 'singular',
    gloss: 'he looses',
  },
  {
    form: 'λύομεν',
    ending: '-ομεν',
    person: 1,
    number: 'plural',
    gloss: 'we loose',
  },
  {
    form: 'λύετε',
    ending: '-ετε',
    person: 2,
    number: 'plural',
    gloss: 'ye loose',
  },
  {
    form: 'λύουσι(ν)',
    ending: '-ουσι(ν)',
    person: 3,
    number: 'plural',
    gloss: 'they loose',
  },
]
