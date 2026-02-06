<script setup lang="ts">
import { ref, computed } from "vue";

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
    article: string;
    combos: { gender: string; number: string; case_: string }[];
  }[]
>([]);

const questions = ref([
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

// Combine genders, numbers, and cases to create possible answers
const genders = ["masculine", "feminine", "neuter"];
const numbers = ["singular", "plural"];
const cases = ["nominative", "genitive", "dative", "accusative"];

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

function isSelected(gender: string, number: string, case_: string) {
  return selectedAnswers.value.has(`${gender}-${number}-${case_}`);
}

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
        missedAnswers.value.push({ article: question.q, combos });
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

  <table>
    <tbody>
      <tr v-for="case_ in cases" :key="case_">
        <template v-for="(gender, gi) in genders" :key="gender">
          <td v-if="gi > 0" class="gender-gap"></td>
          <td v-for="number in numbers" :key="number">
            <button
              class="button answer"
              :class="[gender, case_, number, { selected: isSelected(gender, number, case_) }]"
              :disabled="isSelected(gender, number, case_)"
              v-on:click="checkAnswer(gender, number, case_)"
            >
              {{ gender }}<br />{{ number }}<br />{{ case_ }}
            </button>
          </td>
        </template>
      </tr>
    </tbody>
  </table>

  <div>
    <br />
    <template v-if="success && correctAnswer">
      <p>
        Correct! This article is
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
        <b>{{ entry.article }}</b> —
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
table {
  width: 100%;
}

.button.answer {
  width: 7rem;
  height: 7rem;
}

.button.answer.selected {
  outline: 3px solid #333;
  outline-offset: -3px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3);
  opacity: 0.8;
}

.masculine {
  background-color: lightblue;
}

.feminine {
  background-color: lightpink;
}

.neuter {
  background-color: lightgray;
}

.nominative {
  color: black;
}

.genitive {
  color: red;
}

.dative {
  color: green;
}

.accusative {
  color: blue;
}

.plural {
  font-weight: 500;
}

.gender-gap {
  width: 0.25rem;
}

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
