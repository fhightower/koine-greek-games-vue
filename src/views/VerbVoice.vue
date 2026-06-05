<script setup lang="ts">
import { ref, computed } from 'vue'
import { verbVoiceSentences, type Voice } from '../data/verbVoiceSentences'
import { getRandomInt } from '../utils/random'
import { recordQuestionOutcome } from '../utils/performanceStats'

const gameId = 'verb-voice'

const choices: { value: Voice; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'middle', label: 'Middle' },
  { value: 'passive', label: 'Passive' },
]

const currentIndex = ref(getRandomInt(verbVoiceSentences.length))
const selected = ref<Voice | null>(null)

const missedAnswers = ref<{ sentence: string; voice: Voice }[]>([])

function voiceLabel(voice: Voice) {
  return choices.find(c => c.value === voice)?.label ?? voice
}

const current = computed(() => {
  const sentence = verbVoiceSentences[currentIndex.value]
  if (!sentence) {
    throw new Error('Invalid sentence index')
  }
  return sentence
})

const answered = computed(() => selected.value !== null)
const isCorrect = computed(() => selected.value === current.value.voice)

function pick(voice: Voice) {
  if (answered.value) {
    return // lock in the first answer
  }
  selected.value = voice
  const correct = voice === current.value.voice
  recordQuestionOutcome(gameId, current.value.sentence, correct)
  if (!correct) {
    missedAnswers.value.push({ sentence: current.value.sentence, voice: current.value.voice })
  }
}

function nextQuestion() {
  let newIndex = getRandomInt(verbVoiceSentences.length)
  while (newIndex === currentIndex.value && verbVoiceSentences.length > 1) {
    newIndex = getRandomInt(verbVoiceSentences.length)
  }
  currentIndex.value = newIndex
  selected.value = null
}

function buttonClass(voice: Voice) {
  if (!answered.value) {
    return ''
  }
  if (voice === current.value.voice) {
    return 'choice--correct'
  }
  if (voice === selected.value) {
    return 'choice--wrong'
  }
  return 'choice--muted'
}
</script>

<template>
  <main class="voice">
    <h3 class="voice__prompt">What is the voice of the verb?</h3>

    <p class="voice__sentence">{{ current.sentence }}</p>

    <div class="voice__choices">
      <button
        v-for="choice in choices"
        :key="choice.value"
        class="choice"
        :class="buttonClass(choice.value)"
        :disabled="answered"
        @click="pick(choice.value)"
      >
        {{ choice.label }}
      </button>
    </div>

    <div v-if="answered" class="voice__feedback">
      <p class="voice__verdict" :class="isCorrect ? 'is-correct' : 'is-wrong'">
        {{ isCorrect ? 'Correct!' : 'Not quite.' }}
      </p>
      <p class="voice__why">{{ current.why }}</p>
      <button class="next" @click="nextQuestion">Next →</button>
    </div>

    <details v-if="missedAnswers.length" class="missed">
      <summary>Missed answers ({{ missedAnswers.length }})</summary>
      <ul>
        <li v-for="(m, i) in missedAnswers" :key="i">
          <span class="missed__sentence">{{ m.sentence }}</span> —
          <b>{{ voiceLabel(m.voice) }}</b>
        </li>
      </ul>
    </details>
  </main>
</template>

<style scoped>
.voice {
  max-width: 560px;
  margin: 0 auto;
  padding: clamp(1.5rem, 6vh, 3rem) 0 4rem;
  text-align: center;
}

.voice__prompt {
  margin: 0 0 1.5rem;
  font-size: 1.05rem;
  font-style: italic;
  letter-spacing: 0.06em;
  color: var(--app-muted);
}

.voice__sentence {
  margin: 0 0 2rem;
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 5vw, 2.1rem);
  font-weight: 500;
  line-height: 1.3;
  color: var(--app-text);
}

.voice__choices {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.choice {
  padding: 1rem 1.35rem;
  background: #fffdf8;
  border: 1px solid var(--app-line);
  border-radius: 12px;
  color: var(--app-text);
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(43, 37, 32, 0.04);
  transition: transform 0.18s ease, border-color 0.18s ease,
    box-shadow 0.18s ease, background 0.18s ease, color 0.18s ease;
}

.choice:not(:disabled):hover {
  transform: translateY(-2px);
  border-color: var(--accent);
  box-shadow: 0 6px 18px rgba(156, 59, 46, 0.12);
}

.choice:disabled {
  cursor: default;
}

.choice--correct {
  background: #e7f1e7;
  border-color: #4f8a52;
  color: #2f5a31;
}

.choice--wrong {
  background: #f6e4e0;
  border-color: var(--accent);
  color: var(--accent);
}

.choice--muted {
  opacity: 0.5;
}

.voice__feedback {
  margin-top: 2rem;
  text-align: center;
}

.voice__verdict {
  margin: 0 0 0.5rem;
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 500;
}

.voice__verdict.is-correct {
  color: #2f5a31;
}

.voice__verdict.is-wrong {
  color: var(--accent);
}

.voice__why {
  margin: 0 auto 1.75rem;
  max-width: 44ch;
  font-size: 1.05rem;
  line-height: 1.5;
  color: var(--app-text);
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

.missed__sentence {
  font-style: italic;
}

@media (prefers-reduced-motion: reduce) {
  .choice,
  .next {
    transition: none;
  }
}
</style>
