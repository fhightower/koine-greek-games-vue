export type Voice = 'active' | 'middle' | 'passive'

export interface VoiceSentence {
  sentence: string
  voice: Voice
  why: string
}

// English sentences for drilling verb voice (Machen Lesson X, §§109-113).
// No Greek words: the goal is the linguistic concept, not vocabulary.
//   active  — the subject performs the action on something/someone else
//   passive — the subject receives the action (is acted upon)
//   middle  — the subject acts on itself or in its own interest
//             (English has no true middle, so reflexive "...himself" and
//              benefactive "...for herself" sentences stand in for it)
export const verbVoiceSentences: VoiceSentence[] = [
  // --- Active ---
  {
    sentence: 'The farmer planted the seeds.',
    voice: 'active',
    why: 'Active — the subject (the farmer) performs the action on something else (the seeds).',
  },
  {
    sentence: 'The teacher praised the students.',
    voice: 'active',
    why: 'Active — the subject does the praising; the students are the object acted upon.',
  },
  {
    sentence: 'The dog chased the ball.',
    voice: 'active',
    why: 'Active — the subject performs the action directly on the object.',
  },
  {
    sentence: 'The king sent a messenger.',
    voice: 'active',
    why: 'Active — the subject carries out the action upon the object.',
  },
  {
    sentence: 'The children opened the gifts.',
    voice: 'active',
    why: 'Active — the subject performs the action on something else.',
  },
  {
    sentence: 'The soldier guarded the gate.',
    voice: 'active',
    why: 'Active — the subject does the action; the gate receives it as object.',
  },
  {
    sentence: 'The cook prepared the meal.',
    voice: 'active',
    why: 'Active — the subject acts upon a separate object.',
  },
  {
    sentence: 'The writer finished the letter.',
    voice: 'active',
    why: 'Active — the subject performs the action on the object.',
  },

  // --- Passive ---
  {
    sentence: 'The seeds were planted by the farmer.',
    voice: 'passive',
    why: 'Passive — the subject (the seeds) receives the action; the doer follows as the agent ("by the farmer").',
  },
  {
    sentence: 'The students were praised by the teacher.',
    voice: 'passive',
    why: 'Passive — the subject is acted upon; the agent is named with "by".',
  },
  {
    sentence: 'The gate was guarded all night.',
    voice: 'passive',
    why: 'Passive — the subject receives the action even though no agent is named.',
  },
  {
    sentence: 'The letter was written long ago.',
    voice: 'passive',
    why: 'Passive — the subject is acted upon ("was written"), not the doer.',
  },
  {
    sentence: 'The thief was caught by the guards.',
    voice: 'passive',
    why: 'Passive — the subject receives the action; the guards are the agent.',
  },
  {
    sentence: 'The bread was broken and shared.',
    voice: 'passive',
    why: 'Passive — the subject undergoes the action rather than performing it.',
  },
  {
    sentence: 'The city was destroyed by fire.',
    voice: 'passive',
    why: 'Passive — the subject is acted upon; here the cause is a means ("by fire"), not a person.',
  },
  {
    sentence: 'The song was sung at the feast.',
    voice: 'passive',
    why: 'Passive — the subject receives the action ("was sung").',
  },

  // --- Middle ---
  {
    sentence: 'The soldier dressed himself for battle.',
    voice: 'middle',
    why: 'Middle — the subject acts on himself; Greek uses the middle voice for this self-directed action.',
  },
  {
    sentence: 'She bought herself a new cloak.',
    voice: 'middle',
    why: 'Middle — the subject acts in her own interest (for herself), the middle’s benefactive sense.',
  },
  {
    sentence: 'The travelers prepared themselves for the journey.',
    voice: 'middle',
    why: 'Middle — the subject performs the action upon itself.',
  },
  {
    sentence: 'The merchant kept the profit for himself.',
    voice: 'middle',
    why: 'Middle — the subject acts for his own benefit, the middle’s self-interest sense.',
  },
  {
    sentence: 'The boy washed himself in the river.',
    voice: 'middle',
    why: 'Middle — the subject is both doer and receiver; Greek expresses this with the middle.',
  },
  {
    sentence: 'The queen chose a seat for herself.',
    voice: 'middle',
    why: 'Middle — the subject acts in her own interest (for herself).',
  },
  {
    sentence: 'They defended themselves against the charges.',
    voice: 'middle',
    why: 'Middle — the subject acts upon itself, the reflexive sense of the middle.',
  },
  {
    sentence: 'He taught himself to read.',
    voice: 'middle',
    why: 'Middle — the subject performs the action on himself.',
  },
]
