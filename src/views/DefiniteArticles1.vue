<script setup lang="ts">
import { ref, computed } from "vue";
import GenderNumberCaseGrid from "../components/GenderNumberCaseGrid.vue";
import AnswerFooter from "../components/AnswerFooter.vue";
import type { Answer, Combination, MissedAnswer, Question } from "../types/nominalForms";

const message = ref("");
const correctAnswer = ref<Answer | null>(null);
const hadMiss = ref(false);
const selectedAnswers = ref<Set<string>>(new Set());
const missedAnswers = ref<MissedAnswer[]>([]);

const questions = ref<Question[]>([
  {
    q: "ὁ",
    a: {
      genders: ["masculine"],
      number: "singular",
      cases: ["nominative"],
    },
  },
  {
    q: "οἱ",
    a: {
      genders: ["masculine"],
      number: "plural",
      cases: ["nominative"],
    },
  },
  {
    q: "τό",
    a: {
      genders: ["neuter"],
      number: "singular",
      cases: ["nominative", "accusative"],
    },
  },
  {
    q: "τά",
    a: {
      genders: ["neuter"],
      number: "plural",
      cases: ["nominative", "accusative"],
    },
  },
  {
    q: "ἡ",
    a: {
      genders: ["feminine"],
      number: "singular",
      cases: ["nominative"],
    },
  },
  {
    q: "αἱ",
    a: {
      genders: ["feminine"],
      number: "plural",
      cases: ["nominative"],
    },
  },
  {
    q: "τοῦ",
    a: {
      genders: ["masculine", "neuter"],
      number: "singular",
      cases: ["genitive"],
    },
  },
  {
    q: "τῶν",
    a: {
      genders: ["masculine", "feminine", "neuter"],
      number: "plural",
      cases: ["genitive"],
    },
  },
  {
    q: "τῆς",
    a: {
      genders: ["feminine"],
      number: "singular",
      cases: ["genitive"],
    },
  },
  {
    q: "τῷ",
    a: {
      genders: ["masculine", "neuter"],
      number: "singular",
      cases: ["dative"],
    },
  },
  {
    q: "τοῖς",
    a: {
      genders: ["masculine", "neuter"],
      number: "plural",
      cases: ["dative"],
    },
  },
  {
    q: "τῇ",
    a: {
      genders: ["feminine"],
      number: "singular",
      cases: ["dative"],
    },
  },
  {
    q: "ταῖς",
    a: {
      genders: ["feminine"],
      number: "plural",
      cases: ["dative"],
    },
  },
  {
    q: "τόν",
    a: {
      genders: ["masculine"],
      number: "singular",
      cases: ["accusative"],
    },
  },
  {
    q: "τούς",
    a: {
      genders: ["masculine"],
      number: "plural",
      cases: ["accusative"],
    },
  },
  {
    q: "τήν",
    a: {
      genders: ["feminine"],
      number: "singular",
      cases: ["accusative"],
    },
  },
  {
    q: "τάς",
    a: {
      genders: ["feminine"],
      number: "plural",
      cases: ["accusative"],
    },
  },
]);
const currentQuestionIndex = ref(getRandomInt(questions.value.length));

function getRandomInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
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
  <h3>
    Select the case for this definite article: <b>{{ getQuestion() }}</b>
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
</template>

<style scoped>
.correctAnswer {
  border-radius: 0.2rem;
  padding: 1rem;
}

.missed-answers {
  margin-top: 2rem;
}

.missed-answers summary {
  cursor: pointer;
  font-weight: bold;
}

.missed-answers ul {
  margin-top: 0.5rem;
  text-align: left;
}

.missed-answers li {
  margin-top: 2rem;
}
</style>
