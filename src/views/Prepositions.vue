<script setup lang="ts">
import { ref, computed } from 'vue'
import { getRandomInt } from '../utils/random'
import { recordQuestionOutcome } from '../utils/performanceStats'

// Prepositions and the cases they govern (Machen Lesson VII, §§77, 80-84).
const gameId = 'prepositions'

type Case = 'genitive' | 'dative' | 'accusative'
const cases: Case[] = ['genitive', 'dative', 'accusative']

interface Preposition {
  word: string
  // meaning per governed case
  uses: { case_: Case; meaning: string }[]
}

const prepositions: Preposition[] = [
  { word: 'ἀπό', uses: [{ case_: 'genitive', meaning: 'from' }] },
  {
    word: 'διά',
    uses: [
      { case_: 'genitive', meaning: 'through' },
      { case_: 'accusative', meaning: 'on account of' },
    ],
  },
  { word: 'εἰς', uses: [{ case_: 'accusative', meaning: 'into' }] },
  { word: 'ἐκ (ἐξ)', uses: [{ case_: 'genitive', meaning: 'out of' }] },
  { word: 'ἐν', uses: [{ case_: 'dative', meaning: 'in' }] },
  {
    word: 'μετά',
    uses: [
      { case_: 'genitive', meaning: 'with' },
      { case_: 'accusative', meaning: 'after' },
    ],
  },
  { word: 'πρός', uses: [{ case_: 'accusative', meaning: 'to' }] },
]

const currentIndex = ref(getRandomInt(prepositions.length))
const selectedCorrect = ref<Set<Case>>(new Set())
const hadMiss = ref(false)
// Wrong cases clicked before finding them all, for the miss log.
const wrongPicks = ref<Case[]>([])
const done = ref(false)
const message = ref('')

interface MissedPrep {
  word: string
  uses: { case_: Case; meaning: string }[]
}
const missedAnswers = ref<MissedPrep[]>([])

const current = computed(() => {
  const prep = prepositions[currentIndex.value]
  if (!prep) {
    throw new Error('Invalid preposition index')
  }
  return prep
})

const correctCases = computed(() => current.value.uses.map(u => u.case_))

function pick(case_: Case) {
  if (done.value || selectedCorrect.value.has(case_)) {
    return
  }
  if (correctCases.value.includes(case_)) {
    selectedCorrect.value.add(case_)
    if (selectedCorrect.value.size === correctCases.value.length) {
      done.value = true
      message.value = ''
      recordQuestionOutcome({
        gameId,
        question: current.value.word,
        correct: !hadMiss.value,
        given: wrongPicks.value.join(', '),
        answer: correctCases.value.join(', '),
      })
      if (hadMiss.value) {
        missedAnswers.value.push({ word: current.value.word, uses: current.value.uses })
      }
    } else {
      message.value = `Correct! ${correctCases.value.length - selectedCorrect.value.size} more case to find.`
    }
  } else {
    hadMiss.value = true
    wrongPicks.value.push(case_)
    message.value = 'Incorrect. Try again.'
  }
}

function buttonClass(case_: Case) {
  if (selectedCorrect.value.has(case_)) {
    return 'cell--correct'
  }
  if (done.value) {
    return 'cell--muted'
  }
  return ''
}

function nextQuestion() {
  let newIndex = getRandomInt(prepositions.length)
  while (newIndex === currentIndex.value && prepositions.length > 1) {
    newIndex = getRandomInt(prepositions.length)
  }
  currentIndex.value = newIndex
  selectedCorrect.value = new Set()
  hadMiss.value = false
  wrongPicks.value = []
  done.value = false
  message.value = ''
}
</script>

<template>
  <main class="prep">
    <h3 class="prep__prompt">Which case(s) does this preposition take?</h3>

    <p class="prep__word">{{ current.word }}</p>

    <div class="prep__choices">
      <button
        v-for="case_ in cases"
        :key="case_"
        class="cell"
        :class="buttonClass(case_)"
        :disabled="done || selectedCorrect.has(case_)"
        @click="pick(case_)"
      >
        {{ case_ }}
      </button>
    </div>

    <p v-if="message" class="prep__message">{{ message }}</p>

    <div v-if="done" class="prep__feedback">
      <p class="prep__verdict" :class="hadMiss ? 'is-wrong' : 'is-correct'">
        {{ hadMiss ? 'Got there!' : 'Correct!' }}
      </p>
      <p v-for="use in current.uses" :key="use.case_" class="prep__gloss">
        with {{ use.case_ }}: <i>{{ use.meaning }}</i>
      </p>
      <button class="next" @click="nextQuestion">Next →</button>
    </div>

    <details v-if="missedAnswers.length" class="missed">
      <summary>Missed answers ({{ missedAnswers.length }})</summary>
      <ul>
        <li v-for="(m, i) in missedAnswers" :key="i">
          <b>{{ m.word }}</b> —
          <span v-for="(use, j) in m.uses" :key="use.case_">
            {{ use.case_ }} (<i>{{ use.meaning }}</i>)<span v-if="j < m.uses.length - 1">; </span>
          </span>
        </li>
      </ul>
    </details>
  </main>
</template>

<style scoped>
.prep {
  max-width: 560px;
  margin: 0 auto;
  padding: clamp(1.5rem, 6vh, 3rem) 0 4rem;
  text-align: center;
}

.prep__prompt {
  margin: 0 0 1.25rem;
  font-size: 1.05rem;
  font-style: italic;
  letter-spacing: 0.06em;
  color: var(--app-muted);
}

.prep__word {
  margin: 0 0 2rem;
  font-family: var(--font-display);
  font-size: clamp(2.4rem, 9vw, 3.4rem);
  font-weight: 500;
  color: var(--app-text);
}

.prep__choices {
  display: flex;
  justify-content: center;
  gap: 0.6rem;
}

.cell {
  width: 8rem;
  height: 4rem;
  background: #fffdf8;
  border: 1px solid var(--app-line);
  border-radius: 12px;
  color: var(--app-text);
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(43, 37, 32, 0.04);
  transition: transform 0.18s ease, border-color 0.18s ease,
    box-shadow 0.18s ease, background 0.18s ease, color 0.18s ease;
}

.cell:not(:disabled):hover {
  transform: translateY(-2px);
  border-color: var(--accent);
  box-shadow: 0 6px 18px rgba(156, 59, 46, 0.12);
}

.cell:disabled {
  cursor: default;
}

.cell--correct {
  background: #e7f1e7;
  border-color: #4f8a52;
  color: #2f5a31;
}

.cell--muted {
  opacity: 0.45;
}

.prep__message {
  margin-top: 1.25rem;
  color: var(--app-muted);
}

.prep__feedback {
  margin-top: 2rem;
}

.prep__verdict {
  margin: 0 0 0.5rem;
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 500;
}

.prep__verdict.is-correct {
  color: #2f5a31;
}

.prep__verdict.is-wrong {
  color: var(--accent);
}

.prep__gloss {
  margin: 0 0 0.4rem;
  color: var(--app-muted);
}

.next {
  margin-top: 1.25rem;
  padding: 0.7rem 1.5rem;
  background: var(--accent);
  border: none;
  border-radius: 10px;
  color: #fffdf8;
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.next:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(156, 59, 46, 0.18);
}

.missed {
  margin-top: 2.5rem;
  text-align: left;
}

.missed summary {
  cursor: pointer;
  font-weight: bold;
  color: var(--app-text);
}

.missed ul {
  margin-top: 0.75rem;
  padding-left: 1.25rem;
}

.missed li {
  margin-top: 0.6rem;
  line-height: 1.5;
  color: var(--app-text);
}

@media (prefers-reduced-motion: reduce) {
  .cell,
  .next {
    transition: none;
  }
}
</style>
