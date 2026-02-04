<script setup lang="ts">
import { ref, computed } from "vue";

const success = ref(false);
const message = ref("");
const correctAnswer = ref<{ genders: string[]; number: string; cases: string[] } | null>(null);

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
    currentQuestionIndex.value = newIndex;
  }
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
  const answer = questions.value[currentQuestionIndex.value].a;
  if (
    answer.genders.includes(gender) &&
    number === answer.number &&
    answer.cases.includes(case_)
  ) {
    success.value = true;
    correctAnswer.value = answer;
  } else {
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
        <td v-for="gender in genders" :key="gender">
          <td v-for="number in numbers" :key="number">
            <button
              class="button answer"
              :class="[gender, case_, number]"
              v-on:click="checkAnswer(gender, number, case_)"
            >
              {{ gender }}<br />{{ number }}<br />{{ case_ }}
            </button>
          </td>
        </td>
      </tr>
    </tbody>
  </table>

  <div>
    <template v-if="success && correctAnswer">
      Correct! This article is
      <template v-for="(combo, i) in correctCombinations" :key="i">
        <template v-if="correctCombinations.length > 2 && i > 0 && i < correctCombinations.length - 1">, </template>
        <template v-if="correctCombinations.length > 2 && i === correctCombinations.length - 1">, and </template>
        <template v-if="correctCombinations.length === 2 && i === 1"> and </template>
        <span
          class="correctAnswer"
          :class="[combo.gender, combo.case_, combo.number]"
        >
          {{ combo.gender }} {{ combo.number }} {{ combo.case_ }}
        </span>
      </template>
      <br />
      <button class="button" v-on:click="nextQuestion">Next ></button>
    </template>
    <template v-else>
      {{ message }}
    </template>
  </div>
</template>

<style scoped>
table {
  width: 100%;
}

.button.answer {
  width: 7rem;
  height: 7rem;
}

.correctAnswer {
  border-radius: 0.2rem;
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
</style>
