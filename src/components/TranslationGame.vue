<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { TranslationSentence } from '../data/translationGames'
import { getRandomInt } from '../utils/random'
import { recordQuestionOutcome } from '../utils/performanceStats'

const props = defineProps<{
  gameId: string
  title: string
  sentences: TranslationSentence[]
}>()

// How many questions after a correction each scheduled return is due.
const REVIEW_SPACING = [2, 5, 10]

type ScheduledReview = { index: number; dueIn: number }

const currentIndex = ref(getRandomInt(props.sentences.length))
const attempt = ref('')
const revealed = ref(false)

const missed = ref<TranslationSentence[]>([])

// The sentence to repeat until it is graded correct, and the spaced returns waiting
// their turn afterwards.
const retryIndex = ref<number | null>(null)
const reviews = ref<ScheduledReview[]>([])
const showingReview = ref(false)

const current = computed(() => {
  const sentence = props.sentences[currentIndex.value]
  if (!sentence) {
    throw new Error('Invalid sentence index')
  }
  return sentence
})

const retrying = computed(() => retryIndex.value === currentIndex.value)

function reveal() {
  if (revealed.value) {
    return
  }
  revealed.value = true
}

function grade(gotIt: boolean) {
  recordQuestionOutcome({
    gameId: props.gameId,
    question: current.value.greek,
    correct: gotIt,
    given: attempt.value.trim(),
    answer: current.value.english,
  })

  if (gotIt) {
    // Only a sentence that was just being retried has earned spaced returns; one
    // answered right on the first try has nothing to reinforce.
    if (retrying.value) {
      scheduleReviews(currentIndex.value)
      retryIndex.value = null
    }
  } else {
    rememberMiss()
    // Any returns still pending are stale — the sentence goes back to square one and
    // is rescheduled once it is corrected.
    reviews.value = reviews.value.filter((review) => review.index !== currentIndex.value)
    retryIndex.value = currentIndex.value
  }

  nextQuestion()
}

function rememberMiss() {
  if (missed.value.some((sentence) => sentence.greek === current.value.greek)) {
    return
  }
  missed.value.push({ greek: current.value.greek, english: current.value.english })
}

function scheduleReviews(index: number) {
  for (const dueIn of REVIEW_SPACING) {
    reviews.value.push({ index, dueIn })
  }
}

function nextQuestion() {
  attempt.value = ''
  revealed.value = false

  // A blocked retry does not advance the schedule: however many attempts it takes,
  // the sentence occupies one slot in the spacing counted by the reviews below.
  if (retryIndex.value !== null) {
    currentIndex.value = retryIndex.value
    showingReview.value = false
    return
  }

  for (const review of reviews.value) {
    review.dueIn -= 1
  }

  const dueAt = reviews.value.findIndex((review) => review.dueIn <= 0)
  if (dueAt !== -1) {
    const [due] = reviews.value.splice(dueAt, 1)
    currentIndex.value = due!.index
    showingReview.value = true
    return
  }

  showingReview.value = false
  let newIndex = getRandomInt(props.sentences.length)
  while (newIndex === currentIndex.value && props.sentences.length > 1) {
    newIndex = getRandomInt(props.sentences.length)
  }
  currentIndex.value = newIndex
}

// Reset when switching between lessons that reuse this component instance.
watch(
  () => props.gameId,
  () => {
    currentIndex.value = getRandomInt(props.sentences.length)
    attempt.value = ''
    revealed.value = false
    missed.value = []
    retryIndex.value = null
    reviews.value = []
    showingReview.value = false
  }
)
</script>

<template>
  <main class="trans">
    <h2 class="trans__title">{{ title }}</h2>
    <h3 class="trans__prompt">Translate the Greek into English</h3>

    <p v-if="retrying" class="trans__retry">Try again — you missed this one.</p>
    <p v-else-if="showingReview" class="trans__review">Back again — you missed this earlier.</p>

    <p class="trans__greek">{{ current.greek }}</p>

    <textarea
      v-model="attempt"
      class="trans__input"
      rows="3"
      placeholder="Type your translation…"
      :disabled="revealed"
      @keydown.ctrl.enter="reveal"
      @keydown.meta.enter="reveal"
    ></textarea>

    <button v-if="!revealed" class="reveal" @click="reveal">Reveal answer</button>

    <div v-if="revealed" class="trans__feedback">
      <p class="trans__label">Model translation</p>
      <p class="trans__answer">{{ current.english }}</p>

      <p class="trans__grade-prompt">How did you do?</p>
      <div class="trans__grade">
        <button class="grade grade--got" @click="grade(true)">I got it</button>
        <button class="grade grade--missed" @click="grade(false)">Missed it</button>
      </div>
    </div>

    <details v-if="missed.length" class="missed">
      <summary>Missed sentences ({{ missed.length }})</summary>
      <ul>
        <li v-for="(m, i) in missed" :key="i">
          <span class="missed__greek">{{ m.greek }}</span><br />
          <span class="missed__english">{{ m.english }}</span>
        </li>
      </ul>
    </details>
  </main>
</template>

<style scoped>
.trans {
  max-width: 600px;
  margin: 0 auto;
  padding: clamp(1.5rem, 6vh, 3rem) 0 4rem;
  text-align: center;
}

.trans__title {
  margin: 0 0 0.4rem;
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 500;
  color: var(--app-text);
}

.trans__prompt {
  margin: 0 0 1.5rem;
  font-size: 1.05rem;
  font-style: italic;
  letter-spacing: 0.06em;
  color: var(--app-muted);
}

.trans__retry,
.trans__review {
  margin: 0 0 0.9rem;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  display: inline-block;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
}

.trans__retry {
  background: #f6e4e0;
  color: var(--accent);
}

.trans__review {
  background: #eee9dd;
  color: var(--app-muted);
}

.trans__greek {
  margin: 0 0 1.75rem;
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 4.5vw, 2rem);
  font-weight: 500;
  line-height: 1.4;
  color: var(--app-text);
}

.trans__input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.9rem 1.1rem;
  background: #fffdf8;
  border: 1px solid var(--app-line);
  border-radius: 12px;
  color: var(--app-text);
  font-family: inherit;
  font-size: 1.1rem;
  line-height: 1.45;
  resize: vertical;
  box-shadow: 0 1px 2px rgba(43, 37, 32, 0.04);
}

.trans__input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 6px 18px rgba(156, 59, 46, 0.12);
}

.trans__input:disabled {
  opacity: 0.7;
}

.reveal,
.grade {
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.reveal {
  margin-top: 1.1rem;
  background: var(--accent);
  color: #fffdf8;
}

.reveal:hover,
.grade:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(156, 59, 46, 0.18);
}

.trans__feedback {
  margin-top: 1.75rem;
  text-align: center;
}

.trans__label {
  margin: 0;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--app-muted);
}

.trans__answer {
  margin: 0.35rem auto 1.5rem;
  max-width: 48ch;
  font-size: 1.2rem;
  line-height: 1.5;
  color: var(--app-text);
}

.trans__grade-prompt {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  color: var(--app-muted);
}

.trans__grade {
  display: flex;
  justify-content: center;
  gap: 0.85rem;
}

.grade--got {
  background: #e7f1e7;
  color: #2f5a31;
}

.grade--missed {
  background: #f6e4e0;
  color: var(--accent);
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
  margin-top: 0.85rem;
  line-height: 1.5;
  color: var(--app-text);
}

.missed__greek {
  font-family: var(--font-display);
  font-size: 1.1rem;
}

.missed__english {
  color: var(--app-muted);
  font-style: italic;
}

@media (prefers-reduced-motion: reduce) {
  .reveal,
  .grade {
    transition: none;
  }
}
</style>
