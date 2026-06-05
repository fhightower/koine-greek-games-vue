<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  luoMiddlePassiveForms,
  type Person,
  type GrammaticalNumber,
} from '../data/luoMiddlePassiveForms'
import { getRandomInt } from '../utils/random'
import { recordQuestionOutcome } from '../utils/performanceStats'

const gameId = 'luo-endings'

const persons: { value: Person; label: string }[] = [
  { value: 1, label: '1st' },
  { value: 2, label: '2nd' },
  { value: 3, label: '3rd' },
]
const numbers: GrammaticalNumber[] = ['singular', 'plural']

const currentIndex = ref(getRandomInt(luoMiddlePassiveForms.length))
const selected = ref<{ person: Person; number: GrammaticalNumber } | null>(null)

interface MissedForm {
  form: string
  ending: string
  person: Person
  number: GrammaticalNumber
}
const missedAnswers = ref<MissedForm[]>([])

function personLabel(person: Person) {
  return persons.find(p => p.value === person)?.label ?? ''
}

const current = computed(() => {
  const form = luoMiddlePassiveForms[currentIndex.value]
  if (!form) {
    throw new Error('Invalid form index')
  }
  return form
})

const answered = computed(() => selected.value !== null)
const isCorrect = computed(
  () =>
    selected.value !== null &&
    selected.value.person === current.value.person &&
    selected.value.number === current.value.number,
)

function pick(person: Person, number: GrammaticalNumber) {
  if (answered.value) {
    return // lock in the first answer
  }
  selected.value = { person, number }
  const correct = person === current.value.person && number === current.value.number
  recordQuestionOutcome(gameId, current.value.form, correct)
  if (!correct) {
    missedAnswers.value.push({
      form: current.value.form,
      ending: current.value.ending,
      person: current.value.person,
      number: current.value.number,
    })
  }
}

function cellClass(person: Person, number: GrammaticalNumber) {
  if (!answered.value) {
    return ''
  }
  const isAnswerCell = person === current.value.person && number === current.value.number
  if (isAnswerCell) {
    return 'cell--correct'
  }
  if (selected.value && person === selected.value.person && number === selected.value.number) {
    return 'cell--wrong'
  }
  return 'cell--muted'
}

function nextQuestion() {
  let newIndex = getRandomInt(luoMiddlePassiveForms.length)
  while (newIndex === currentIndex.value && luoMiddlePassiveForms.length > 1) {
    newIndex = getRandomInt(luoMiddlePassiveForms.length)
  }
  currentIndex.value = newIndex
  selected.value = null
}
</script>

<template>
  <main class="luo">
    <h3 class="luo__prompt">Parse this middle/passive form of λύω</h3>

    <p class="luo__form">{{ current.form }}</p>

    <table class="grid">
      <thead>
        <tr>
          <th></th>
          <th>Singular</th>
          <th>Plural</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="person in persons" :key="person.value">
          <th class="grid__rowlabel">{{ person.label }}</th>
          <td v-for="number in numbers" :key="number">
            <button
              class="cell"
              :class="cellClass(person.value, number)"
              :disabled="answered"
              @click="pick(person.value, number)"
            >
              {{ person.label }}<br />{{ number === 'singular' ? 'sing.' : 'plur.' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="answered" class="luo__feedback">
      <p class="luo__verdict" :class="isCorrect ? 'is-correct' : 'is-wrong'">
        {{ isCorrect ? 'Correct!' : 'Not quite.' }}
      </p>
      <p class="luo__parse">
        <b>{{ current.form }}</b> — ending <b>{{ current.ending }}</b>,
        {{ personLabel(current.person) }} person
        {{ current.number }}
      </p>
      <p class="luo__gloss">
        Middle: <i>{{ current.middle }}</i><br />
        Passive: <i>{{ current.passive }}</i>
      </p>
      <button class="next" @click="nextQuestion">Next →</button>
    </div>

    <details v-if="missedAnswers.length" class="missed">
      <summary>Missed answers ({{ missedAnswers.length }})</summary>
      <ul>
        <li v-for="(m, i) in missedAnswers" :key="i">
          <b>{{ m.form }}</b> — {{ personLabel(m.person) }} person {{ m.number }}
          (ending <b>{{ m.ending }}</b>)
        </li>
      </ul>
    </details>
  </main>
</template>

<style scoped>
.luo {
  max-width: 560px;
  margin: 0 auto;
  padding: clamp(1.5rem, 6vh, 3rem) 0 4rem;
  text-align: center;
}

.luo__prompt {
  margin: 0 0 1.25rem;
  font-size: 1.05rem;
  font-style: italic;
  letter-spacing: 0.06em;
  color: var(--app-muted);
}

.luo__form {
  margin: 0 0 2rem;
  font-family: var(--font-display);
  font-size: clamp(2.4rem, 9vw, 3.4rem);
  font-weight: 500;
  color: var(--app-text);
}

.grid {
  margin: 0 auto;
  border-collapse: separate;
  border-spacing: 0.6rem;
}

.grid th {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--app-muted);
  letter-spacing: 0.04em;
}

.grid__rowlabel {
  padding-right: 0.4rem;
  text-align: right;
}

.cell {
  width: 7rem;
  height: 5rem;
  background: #fffdf8;
  border: 1px solid var(--app-line);
  border-radius: 12px;
  color: var(--app-text);
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 500;
  line-height: 1.35;
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

.cell--wrong {
  background: #f6e4e0;
  border-color: var(--accent);
  color: var(--accent);
}

.cell--muted {
  opacity: 0.45;
}

.luo__feedback {
  margin-top: 2rem;
}

.luo__verdict {
  margin: 0 0 0.5rem;
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 500;
}

.luo__verdict.is-correct {
  color: #2f5a31;
}

.luo__verdict.is-wrong {
  color: var(--accent);
}

.luo__parse {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
  color: var(--app-text);
}

.luo__gloss {
  margin: 0 auto 1.75rem;
  max-width: 40ch;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--app-muted);
}

.next {
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
