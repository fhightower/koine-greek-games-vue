<script setup lang="ts">
import { ref, computed } from "vue";
import GenderNumberCaseGrid from "../components/GenderNumberCaseGrid.vue";

const success = ref(false);
const message = ref("");
const correctAnswer = ref<{
  genders: string[];
  number: string;
  cases: string[];
} | null>(null);
const hadMiss = ref(false);
const selectedAnswers = ref<Set<string>>(new Set());
const missedAnswers = ref<
  {
    word: string;
    combos: { gender: string; number: string; case_: string }[];
  }[]
>([]);

const questions = ref([
  {
    q: "ἄνθρωπος",
    a: {
      genders: ["masculine"],
      number: "singular",
      cases: ["nominative"],
    },
  },
]);
const currentQuestionIndex = ref(getRandomInt(questions.value.length));

// todo: move this to utils
function getRandomInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}

function getQuestion() {
  return questions.value[currentQuestionIndex.value].q;
}

function nextQuestion() {
  const newIndex = getRandomInt(questions.value.length);

  // avoid repetition of the same index
  if (newIndex === currentQuestionIndex.value) {
    nextQuestion();
  } else {
    success.value = false;
    message.value = "";
    correctAnswer.value = null;
    hadMiss.value = false;
    selectedAnswers.value = new Set();
    currentQuestionIndex.value = newIndex;
  }
}

const totalCorrectCombos = computed(() => {
  const answer = questions.value[currentQuestionIndex.value].a;
  return answer.genders.length * answer.cases.length;
});

const correctCombinations = computed(() => {
  if (!correctAnswer.value) return [];
  const combos: { gender: string; number: string; case_: string }[] = [];
  for (const g of correctAnswer.value.genders) {
    for (const c of correctAnswer.value.cases) {
      combos.push({ gender: g, number: correctAnswer.value.number, case_: c });
    }
  }
  return combos;
});

function checkAnswer(gender: string, number: string, case_: string) {
  const question = questions.value[currentQuestionIndex.value];
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
      success.value = true;
      correctAnswer.value = answer;
      if (hadMiss.value) {
        const combos: { gender: string; number: string; case_: string }[] = [];
        for (const g of answer.genders) {
          for (const c of answer.cases) {
            combos.push({ gender: g, number: answer.number, case_: c });
          }
        }
        missedAnswers.value.push({ word: question.q, combos });
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
    Select the gender, number, and case for this word:
    <b>{{ getQuestion() }}</b>
  </h3>

  <GenderNumberCaseGrid
    :selectedAnswers="selectedAnswers"
    @select="checkAnswer"
  />

  <!-- todo: componentize this -->
  <div>
    <br />
    <template v-if="success && correctAnswer">
      <p>
        Correct! This word is
        <template v-for="(combo, i) in correctCombinations" :key="i">
          <template
            v-if="
              correctCombinations.length > 2 &&
              i > 0 &&
              i < correctCombinations.length - 1
            "
            >,
          </template>
          <template
            v-if="
              correctCombinations.length > 2 &&
              i === correctCombinations.length - 1
            "
            >, and
          </template>
          <template v-if="correctCombinations.length === 2 && i === 1">
            and
          </template>
          <span
            class="correctAnswer"
            :class="[combo.gender, combo.case_, combo.number]"
          >
            {{ combo.gender }} {{ combo.number }} {{ combo.case_ }}
          </span>
        </template>
      </p>
      <br />
      <button class="button" v-on:click="nextQuestion">Next ></button>
    </template>
    <template v-else>
      {{ message }}
    </template>
  </div>

  <details v-if="missedAnswers.length" class="missed-answers">
    <summary>Missed answers ({{ missedAnswers.length }})</summary>
    <br />
    <ul>
      <li v-for="(entry, i) in missedAnswers" :key="i">
        <b>{{ entry.word }}</b> —
        <template v-for="(combo, j) in entry.combos" :key="j">
          <template v-if="j > 0">, </template>
          <span
            class="correctAnswer"
            :class="[combo.gender, combo.case_, combo.number]"
          >
            {{ combo.gender }} {{ combo.number }} {{ combo.case_ }}
          </span>
        </template>
      </li>
    </ul>
  </details>
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
