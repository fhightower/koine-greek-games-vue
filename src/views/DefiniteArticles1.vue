<script setup lang="ts">
import { ref } from "vue";

const success = ref(false);
const message = ref("");

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
    currentQuestionIndex.value = newIndex;
  }
}

function checkAnswer(gender: string, number: string, case_: string) {
  const answer = questions.value[currentQuestionIndex.value].a;
  if (
    answer.genders.includes(gender) &&
    number === answer.number &&
    answer.cases.includes(case_)
  ) {
    success.value = true;
    // todo: add styling here
    message.value = `Correct! This article is ${answer.genders.join("/")} ${number} ${answer.cases.join("/")}.`;
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
              :class="[gender, case_]"
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
    {{ message }}
    <span v-if="success">
      <br />
      <button class="button" v-on:click="nextQuestion">Next ></button>
    </span>
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
</style>
