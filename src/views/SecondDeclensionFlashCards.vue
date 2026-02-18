<script setup lang="ts">
import { ref, computed } from "vue";
import GenderNumberCaseGrid from "../components/GenderNumberCaseGrid.vue";
import AnswerFooter from "../components/AnswerFooter.vue";
import type { Answer, Combination, MissedAnswer, Question } from "../types/nominalForms";
import { getRandomInt } from "../utils/random";
import { recordQuestionOutcome } from "../utils/performanceStats";
import { secondDeclensionWords, type WordEntry } from "../data/secondDeclensionWords";

const message = ref("");
const correctAnswer = ref<Answer | null>(null);
const hadMiss = ref(false);
const selectedAnswers = ref<Set<string>>(new Set());
const missedAnswers = ref<MissedAnswer[]>([]);
const gameId = "second-declension-flash-cards";

const selectedWord = ref<WordEntry | null>(null);
const questions = ref<Question[]>([]);
const currentQuestionIndex = ref(0);

function selectWord(word: WordEntry) {
  selectedWord.value = word;
  questions.value = word.questions;
  currentQuestionIndex.value = getRandomInt(questions.value.length);
  message.value = "";
  correctAnswer.value = null;
  hadMiss.value = false;
  selectedAnswers.value = new Set();
  missedAnswers.value = [];
}

function changeWord() {
  selectedWord.value = null;
  questions.value = [];
  message.value = "";
  correctAnswer.value = null;
  hadMiss.value = false;
  selectedAnswers.value = new Set();
  missedAnswers.value = [];
}

function getQuestion() {
  return getCurrentQuestionOrThrow().q;
}

function getCurrentQuestionOrThrow() {
  const question = questions.value[currentQuestionIndex.value];
  if (!question) {
    throw new Error("Invalid question index");
  }
  return question;
}

function nextQuestion() {
  const newIndex = getRandomInt(questions.value.length);

  // avoid repetition of the same index
  if (newIndex === currentQuestionIndex.value) {
    nextQuestion();
  } else {
    message.value = "";
    correctAnswer.value = null;
    hadMiss.value = false;
    selectedAnswers.value = new Set();
    currentQuestionIndex.value = newIndex;
  }
}

const totalCorrectCombos = computed(() => {
  const answer = getCurrentQuestionOrThrow().a;
  return answer.genders.length * answer.cases.length;
});

const correctCombinations = computed(() => {
  if (!correctAnswer.value) return [];
  const combos: Combination[] = [];
  for (const g of correctAnswer.value.genders) {
    for (const c of correctAnswer.value.cases) {
      combos.push({ gender: g, number: correctAnswer.value.number, case_: c });
    }
  }
  return combos;
});

function checkAnswer(gender: string, number: string, case_: string) {
  const question = getCurrentQuestionOrThrow();
  const answer = question.a;
  const key = `${gender}-${number}-${case_}`;

  if (selectedAnswers.value.has(key)) {
    return; // Already selected
  }

  if (
    answer.genders.includes(gender) &&
    number === answer.number &&
    answer.cases.includes(case_)
  ) {
    selectedAnswers.value.add(key);
    const total = totalCorrectCombos.value;
    const found = selectedAnswers.value.size;

    if (found === total) {
      recordQuestionOutcome(gameId, question.q, !hadMiss.value);
      correctAnswer.value = answer;
      if (hadMiss.value) {
        const combos: Combination[] = [];
        for (const g of answer.genders) {
          for (const c of answer.cases) {
            combos.push({ gender: g, number: answer.number, case_: c });
          }
        }
        missedAnswers.value.push({ question: question.q, combos });
      }
    } else {
      message.value = `Correct! ${total - found} remaining.`;
    }
  } else {
    hadMiss.value = true;
    message.value = "Incorrect. Try again.";
  }
}
</script>

<template>
  <div v-if="!selectedWord" class="word-picker">
    <h3>Choose a word to practice:</h3>
    <ul class="word-list">
      <li v-for="word in secondDeclensionWords" :key="word.nominativeSingular">
        <button class="word-btn" @click="selectWord(word)">
          <span class="greek">{{ word.nominativeSingular }}</span>
          <span class="meaning">{{ word.meaning }}</span>
        </button>
      </li>
    </ul>
  </div>

  <template v-else>
    <h3>
      Select the gender, number, and case for this word:
      <b>{{ getQuestion() }}</b>
    </h3>
    <div class="word-label">
      Practicing: <b>{{ selectedWord.nominativeSingular }}</b> ({{ selectedWord.meaning }})
      <button class="change-btn" @click="changeWord">Change word</button>
    </div>

    <GenderNumberCaseGrid
      :selectedAnswers="selectedAnswers"
      :includeVocative="true"
      @select="checkAnswer"
    />

    <AnswerFooter
      :correctAnswer="correctAnswer"
      :correctCombinations="correctCombinations"
      :message="message"
      :missedAnswers="missedAnswers"
      @nextQuestion="nextQuestion"
    />
  </template>
</template>

<style scoped>
.word-picker {
  max-width: 480px;
}

.word-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.word-btn {
  width: 100%;
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
  background: none;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  font-size: 1rem;
}

.word-btn:hover {
  background-color: #f0f0f0;
}

.greek {
  font-size: 1.15rem;
  font-weight: bold;
}

.meaning {
  color: #555;
  font-size: 0.9rem;
}

.word-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #444;
}

.change-btn {
  padding: 0.2rem 0.6rem;
  font-size: 0.85rem;
  background: none;
  border: 1px solid #aaa;
  border-radius: 4px;
  cursor: pointer;
}

.change-btn:hover {
  background-color: #f0f0f0;
}
</style>
