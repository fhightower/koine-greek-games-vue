<script setup lang="ts">
import { ref, computed } from "vue";
import GenderNumberCaseGrid from "../components/GenderNumberCaseGrid.vue";
import AnswerFooter from "../components/AnswerFooter.vue";
import NominalFormsCheatSheetModal from "../components/NominalFormsCheatSheetModal.vue";
import type { Answer, Combination, MissedAnswer, Question } from "../types/nominalForms";
import { getRandomInt } from "../utils/random";
import { answerText, comboText } from "../utils/nominalAnswerText";
import { recordQuestionOutcome } from "../utils/performanceStats";

// Declension of ἀγαθός, good (Machen Lesson VI, §61).
// Forms ambiguous between masc. acc. and neut. nom./acc. are shown with the
// article so each question has a single gender.
const message = ref("");
const correctAnswer = ref<Answer | null>(null);
const hadMiss = ref(false);
// Wrong cells clicked before finding them all, for the miss log.
const wrongPicks = ref<string[]>([]);
const selectedAnswers = ref<Set<string>>(new Set());
const missedAnswers = ref<MissedAnswer[]>([]);
const gameId = "adjective-agathos";

const questions = ref<Question[]>([
  { q: "ἀγαθός", a: { genders: ["masculine"], number: "singular", cases: ["nominative"] } },
  { q: "ἀγαθή", a: { genders: ["feminine"], number: "singular", cases: ["nominative"] } },
  { q: "τὸ ἀγαθόν", a: { genders: ["neuter"], number: "singular", cases: ["nominative", "accusative"] } },
  { q: "τὸν ἀγαθόν", a: { genders: ["masculine"], number: "singular", cases: ["accusative"] } },
  { q: "ἀγαθήν", a: { genders: ["feminine"], number: "singular", cases: ["accusative"] } },
  { q: "ἀγαθοῦ", a: { genders: ["masculine", "neuter"], number: "singular", cases: ["genitive"] } },
  { q: "ἀγαθῆς", a: { genders: ["feminine"], number: "singular", cases: ["genitive"] } },
  { q: "ἀγαθῷ", a: { genders: ["masculine", "neuter"], number: "singular", cases: ["dative"] } },
  { q: "ἀγαθῇ", a: { genders: ["feminine"], number: "singular", cases: ["dative"] } },
  { q: "ἀγαθοί", a: { genders: ["masculine"], number: "plural", cases: ["nominative"] } },
  { q: "ἀγαθαί", a: { genders: ["feminine"], number: "plural", cases: ["nominative"] } },
  { q: "τὰ ἀγαθά", a: { genders: ["neuter"], number: "plural", cases: ["nominative", "accusative"] } },
  { q: "ἀγαθῶν", a: { genders: ["masculine", "feminine", "neuter"], number: "plural", cases: ["genitive"] } },
  { q: "ἀγαθοῖς", a: { genders: ["masculine", "neuter"], number: "plural", cases: ["dative"] } },
  { q: "ἀγαθαῖς", a: { genders: ["feminine"], number: "plural", cases: ["dative"] } },
  { q: "ἀγαθούς", a: { genders: ["masculine"], number: "plural", cases: ["accusative"] } },
  { q: "ἀγαθάς", a: { genders: ["feminine"], number: "plural", cases: ["accusative"] } },
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
    Parse this form of ἀγαθός: <b>{{ getQuestion() }}</b>
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
    title="ἀγαθός Cheat Sheet"
    buttonLabel="Show Cheat Sheet"
    :entries="cheatSheetEntries"
  />
</template>
