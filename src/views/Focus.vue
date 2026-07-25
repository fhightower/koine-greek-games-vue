<script setup lang="ts">
import { computed, ref } from "vue";
import { gameLabel } from "../utils/gameLabels";
import { loadMisses, missedQuestions } from "../utils/missLog";
import { createQueue, current, grade, remaining, type FocusQueue } from "../utils/focusQueue";

// The route hands the raw `games` query value straight through, so this component can
// be mounted and tested without a router. A comma-separated list of game ids, or "all".
const props = defineProps<{ games: string }>();

function selectedGameIds(): string[] {
  if (props.games.trim() === "all") {
    return [...new Set(loadMisses().map((miss) => miss.gameId))];
  }
  return props.games
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

const questions = missedQuestions(selectedGameIds());
const startingCount = questions.length;

const queue = ref<FocusQueue>(createQueue(questions));
const revealed = ref(false);

const card = computed(() => current(queue.value));
const left = computed(() => remaining(queue.value));
const done = computed(() => startingCount > 0 && left.value === 0);

function reveal() {
  revealed.value = true;
}

function mark(gotIt: boolean) {
  queue.value = grade(queue.value, gotIt);
  revealed.value = false;
}
</script>

<template>
  <main class="focus">
    <h2 class="focus__title">Focus</h2>

    <p v-if="!startingCount" class="focus__empty">
      Nothing to focus on. Miss a question in a game and it will show up here.
      <a class="focus__back" href="#/review">Back to review</a>
    </p>

    <div v-else-if="done" class="focus__done">
      <p class="focus__done-line">Cleared all {{ startingCount }} questions. Nicely done.</p>
      <a class="focus__back" href="#/review">Back to review</a>
    </div>

    <div v-else-if="card" class="focus__card">
      <p class="focus__remaining">{{ left }} to go</p>
      <span class="focus__game">{{ gameLabel(card.gameId) }}</span>
      <p class="focus__question">{{ card.question }}</p>

      <button v-if="!revealed" class="btn btn--reveal" @click="reveal">Reveal answer</button>

      <div v-else class="focus__grade">
        <p class="focus__answer-label">Answer</p>
        <p class="focus__answer">{{ card.answer }}</p>
        <p class="focus__grade-prompt">How did you do?</p>
        <div class="focus__grade-buttons">
          <button class="btn btn--got" @click="mark(true)">I got it</button>
          <button class="btn btn--missed" @click="mark(false)">Missed it</button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.focus {
  max-width: 600px;
  margin: 0 auto;
  padding: clamp(1.5rem, 6vh, 3rem) 0 4rem;
  text-align: center;
}

.focus__title {
  margin: 0 0 1.5rem;
  font-family: var(--font-display);
  font-size: 1.9rem;
  font-weight: 500;
  color: var(--app-text);
}

.focus__empty,
.focus__done {
  margin: 2.5rem 0;
  color: var(--app-muted);
  font-style: italic;
  line-height: 1.7;
}

.focus__done-line {
  margin: 0 0 0.75rem;
  font-style: normal;
  font-size: 1.15rem;
  color: var(--app-text);
}

.focus__remaining {
  margin: 0 0 1.25rem;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--app-muted);
}

.focus__game {
  font-size: 0.78rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--app-muted);
}

.focus__question {
  margin: 0.4rem 0 1.75rem;
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 4.5vw, 2rem);
  font-weight: 500;
  line-height: 1.4;
  color: var(--app-text);
}

.btn {
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(156, 59, 46, 0.18);
}

.btn--reveal {
  background: var(--accent);
  color: #fffdf8;
}

.focus__answer-label {
  margin: 0;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--app-muted);
}

.focus__answer {
  margin: 0.35rem auto 1.5rem;
  max-width: 48ch;
  font-size: 1.3rem;
  line-height: 1.5;
  color: var(--app-text);
}

.focus__grade-prompt {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  color: var(--app-muted);
}

.focus__grade-buttons {
  display: flex;
  justify-content: center;
  gap: 0.85rem;
}

.btn--got {
  background: #e7f1e7;
  color: #2f5a31;
}

.btn--missed {
  background: #f6e4e0;
  color: var(--accent);
}

.focus__back {
  color: var(--accent);
  text-decoration: none;
  font-style: normal;
}

.focus__back:hover {
  text-decoration: underline;
}

@media (prefers-reduced-motion: reduce) {
  .btn {
    transition: none;
  }
}
</style>
