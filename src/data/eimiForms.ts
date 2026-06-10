// Present Indicative of εἰμί (Machen Lesson VIII, §98).
// All forms except εἶ are enclitic.

import type { GrammaticalNumber, Person } from './luoMiddlePassiveForms'

export interface EimiForm {
  form: string
  person: Person
  number: GrammaticalNumber
  gloss: string
}

export const eimiForms: EimiForm[] = [
  { form: 'εἰμί', person: 1, number: 'singular', gloss: 'I am' },
  { form: 'εἶ', person: 2, number: 'singular', gloss: 'thou art' },
  { form: 'ἐστί(ν)', person: 3, number: 'singular', gloss: 'he is' },
  { form: 'ἐσμέν', person: 1, number: 'plural', gloss: 'we are' },
  { form: 'ἐστέ', person: 2, number: 'plural', gloss: 'ye are' },
  { form: 'εἰσί(ν)', person: 3, number: 'plural', gloss: 'they are' },
]
