<script setup lang="ts">
import { ref, computed } from "vue";
import GenderNumberCaseGrid from "../components/GenderNumberCaseGrid.vue";
import AnswerFooter from "../components/AnswerFooter.vue";
import NominalFormsCheatSheetModal from "../components/NominalFormsCheatSheetModal.vue";
import type { Answer, Combination, MissedAnswer, Question } from "../types/nominalForms";
import { getRandomInt } from "../utils/random";
import { answerText, comboText } from "../utils/nominalAnswerText";
import { recordQuestionOutcome } from "../utils/performanceStats";

// Demonstrative pronouns οὗτος, this, and ἐκεῖνος, that
// (Machen Lesson IX, §§102-103).
const message = ref("");
const correctAnswer = ref<Answer | null>(null);
const hadMiss = ref(false);
// Wrong cells clicked before finding them all, for the miss log.
const wrongPicks = ref<string[]>([]);
const selectedAnswers = ref<Set<string>>(new Set());
const missedAnswers = ref<MissedAnswer[]>([]);
const gameId = "demonstratives";

const questions = ref<Question[]>([
  // οὗτος
  { q: "οὗτος", a: { genders: ["masculine"], number: "singular", cases: ["nominative"] } },
  { q: "αὕτη", a: { genders: ["feminine"], number: "singular", cases: ["nominative"] } },
  { q: "τοῦτο", a: { genders: ["neuter"], number: "singular", cases: ["nominative", "accusative"] } },
  { q: "τοῦτον", a: { genders: ["masculine"], number: "singular", cases: ["accusative"] } },
  { q: "ταύτην", a: { genders: ["feminine"], number: "singular", cases: ["accusative"] } },
  { q: "τούτου", a: { genders: ["masculine", "neuter"], number: "singular", cases: ["genitive"] } },
  { q: "ταύτης", a: { genders: ["feminine"], number: "singular", cases: ["genitive"] } },
  { q: "τούτῳ", a: { genders: ["masculine", "neuter"], number: "singular", cases: ["dative"] } },
  { q: "ταύτῃ", a: { genders: ["feminine"], number: "singular", cases: ["dative"] } },
  { q: "οὗτοι", a: { genders: ["masculine"], number: "plural", cases: ["nominative"] } },
  { q: "αὗται", a: { genders: ["feminine"], number: "plural", cases: ["nominative"] } },
  { q: "ταῦτα", a: { genders: ["neuter"], number: "plural", cases: ["nominative", "accusative"] } },
  { q: "τούτους", a: { genders: ["masculine"], number: "plural", cases: ["accusative"] } },
  { q: "ταύτας", a: { genders: ["feminine"], number: "plural", cases: ["accusative"] } },
  { q: "τούτων", a: { genders: ["masculine", "feminine", "neuter"], number: "plural", cases: ["genitive"] } },
  { q: "τούτοις", a: { genders: ["masculine", "neuter"], number: "plural", cases: ["dative"] } },
  { q: "ταύταις", a: { genders: ["feminine"], number: "plural", cases: ["dative"] } },
  // ἐκεῖνος
  { q: "ἐκεῖνος", a: { genders: ["masculine"], number: "singular", cases: ["nominative"] } },
  { q: "ἐκείνη", a: { genders: ["feminine"], number: "singular", cases: ["nominative"] } },
  { q: "ἐκεῖνο", a: { genders: ["neuter"], number: "singular", cases: ["nominative", "accusative"] } },
  { q: "ἐκεῖνον", a: { genders: ["masculine"], number: "singular", cases: ["accusative"] } },
  { q: "ἐκείνην", a: { genders: ["feminine"], number: "singular", cases: ["accusative"] } },
  { q: "ἐκείνου", a: { genders: ["masculine", "neuter"], number: "singular", cases: ["genitive"] } },
  { q: "ἐκείνης", a: { genders: ["feminine"], number: "singular", cases: ["genitive"] } },
  { q: "ἐκείνῳ", a: { genders: ["masculine", "neuter"], number: "singular", cases: ["dative"] } },
  { q: "ἐκείνῃ", a: { genders: ["feminine"], number: "singular", cases: ["dative"] } },
  { q: "ἐκεῖνοι", a: { genders: ["masculine"], number: "plural", cases: ["nominative"] } },
  { q: "ἐκεῖναι", a: { genders: ["feminine"], number: "plural", cases: ["nominative"] } },
  { q: "ἐκεῖνα", a: { genders: ["neuter"], number: "plural", cases: ["nominative", "accusative"] } },
  { q: "ἐκείνους", a: { genders: ["masculine"], number: "plural", cases: ["accusative"] } },
  { q: "ἐκείνας", a: { genders: ["feminine"], number: "plural", cases: ["accusative"] } },
  { q: "ἐκείνων", a: { genders: ["masculine", "feminine", "neuter"], number: "plural", cases: ["genitive"] } },
  { q: "ἐκείνοις", a: { genders: ["masculine", "neuter"], number: "plural", cases: ["dative"] } },
  { q: "ἐκείναις", a: { genders: ["feminine"], number: "plural", cases: ["dative"] } },
]);
const currentQuestionIndex = ref(getRandomInt(questions.value.length));

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
    wrongPicks.value = [];
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

const cheatSheetEntries = computed(() =>
  questions.value.map((question) => ({
    question: question.q,
    combos: question.a.genders.flatMap((gender) =>
      question.a.cases.map((case_) => ({
        gender,
        number: question.a.number,
        case_,
      }))
    ),
  }))
);

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
      recordQuestionOutcome({
        gameId,
        question: question.q,
        correct: !hadMiss.value,
        given: wrongPicks.value.join(", "),
        answer: answerText(answer),
      });
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
    wrongPicks.value.push(comboText(gender, number, case_));
    message.value = "Incorrect. Try again.";
  }
}
</script>

<template>
  <h3>
    Parse this demonstrative pronoun: <b>{{ getQuestion() }}</b>
  </h3>
  <GenderNumberCaseGrid
    :selectedAnswers="selectedAnswers"
    @select="checkAnswer"
  />

  <AnswerFooter
    :correctAnswer="correctAnswer"
    :correctCombinations="correctCombinations"
    :message="message"
    :missedAnswers="missedAnswers"
    @nextQuestion="nextQuestion"
  />

  <br>

  <NominalFormsCheatSheetModal
    title="Demonstrative Pronoun Cheat Sheet"
    buttonLabel="Show Cheat Sheet"
    :entries="cheatSheetEntries"
  />
</template>
